const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const auth = require("../middlewares/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
// 이미지 업로드 설정
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "video/mp4"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("jpg, png, mp4 형식만 업로드 가능합니다."));
  }
};

const upload = multer({ storage, fileFilter });

/**
 * 1. 피드 목록 조회 (로그인 여부 상관없이 보여야 하므로 auth 제거)
 */
router.get("/list", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  let userId = 0; // 기본값: 로그인 안 된 상태

  if (token) {
    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, "your_secret_key");
      userId = decoded.userId;
    } catch (e) {
      // 토큰이 잘못되었을 경우 무시하고 로그인 없는 상태로 처리
    }
  }

  try {
    const sql = `
      SELECT 
        p.postId, p.userId, u.name, u.nick, u.profileImg,
        p.content, p.createdAt,
        i.url, i.type, -- 🔥 type 추가
        (SELECT COUNT(*) FROM postlikes WHERE postId = p.postId) AS likeCount,
        EXISTS (
          SELECT 1 FROM postlikes WHERE postId = p.postId AND userId = ?
        ) AS liked
      FROM posts p
      LEFT JOIN users u ON p.userId = u.userId
      LEFT JOIN postImgs i ON p.postId = i.postId
      ORDER BY p.createdAt DESC, p.postId DESC, i.sort ASC
    `;
    const [rows] = await db.query(sql, [userId]);

    const postMap = {};
    rows.forEach((row) => {
      const id = row.postId;
      if (!postMap[id]) {
        postMap[id] = {
          postId: id,
          userId: row.userId,
          name: row.name || "알 수 없음",
          nick: row.nick || "",
          profileImg: row.profileImg || null,
          content: row.content,
          createdAt: row.createdAt,
          likeCount: row.likeCount,
          liked: !!row.liked,
          images: [],
        };
      }

      // 이미지 또는 영상 추가
      if (row.url) {
        postMap[id].images.push({
          url: row.url,
          type: row.type || "image", // 기본값 image 처리
        });
      }
    });

    const posts = Object.values(postMap).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json({ success: true, posts });
  } catch (err) {
    console.error("❌ 게시글 조회 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

/**
 * 2. 피드 등록 (로그인 필요)
 */
router.post("/", auth, upload.array("images", 5), async (req, res) => {
  const userId = req.user.userId;
  const { content } = req.body;
  const files = req.files;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [postResult] = await conn.query(
      "INSERT INTO posts (userId, content) VALUES (?, ?)",
      [userId, content]
    );

    const postId = postResult.insertId;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = file.mimetype.startsWith("video/") ? "video" : "image";

      await conn.query(
        "INSERT INTO postImgs (postId, url, sort, type) VALUES (?, ?, ?, ?)",
        [postId, "/uploads/" + file.filename, i, fileType]
      );
    }

    await conn.commit();
    res.json({ success: true, postId });
  } catch (err) {
    await conn.rollback();
    console.error("❌ 게시글 등록 오류:", err);
    res.status(500).json({ success: false });
  } finally {
    conn.release();
  }
});

/**
 * 3. 피드 수정
 */
// 수정된 피드 수정 라우터 (/posts/:postId)
router.put("/:postId", upload.array("images", 5), async (req, res) => {
  const postId = req.params.postId;
  const { content } = req.body;
  const files = req.files || [];

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 게시글 내용 수정
    await conn.query(
      "UPDATE posts SET content = ?, updatedAt = NOW() WHERE postId = ?",
      [content, postId]
    );

    if (files.length > 0) {
      // 기존 이미지/영상 삭제
      await conn.query("DELETE FROM postImgs WHERE postId = ?", [postId]);

      // 새 이미지/영상 삽입
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = file.mimetype.startsWith("video/") ? "video" : "image";

        await conn.query(
          "INSERT INTO postImgs (postId, url, sort, type) VALUES (?, ?, ?, ?)",
          [postId, "/uploads/" + file.filename, i, fileType]
        );
      }
    }

    await conn.commit();

    // 수정 후 다시 조회해 클라이언트에 반영
    const [[post]] = await conn.query(
      `SELECT p.postId, p.userId, u.nick, u.profileImg, p.content, p.updatedAt
       FROM posts p
       LEFT JOIN users u ON p.userId = u.userId
       WHERE p.postId = ?`,
      [postId]
    );

    const [imgs] = await conn.query(
      `SELECT url, type FROM postImgs WHERE postId = ? ORDER BY sort`,
      [postId]
    );

    // 이미지 + 영상 포함해서 내려주기
    post.images = imgs.map((img) => ({
      url: img.url,
      type: img.type || "image", // type이 null이면 기본값
    }));

    res.json({ success: true, updatedFeed: post });
  } catch (err) {
    await conn.rollback();
    console.error("❌ 게시글 수정 오류:", err);
    res.status(500).json({ success: false });
  } finally {
    conn.release();
  }
});

/**
 * 4. 피드 삭제
 */
router.delete("/:postId", async (req, res) => {
  const postId = req.params.postId;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query("DELETE FROM postImgs WHERE postId = ?", [postId]);
    await conn.query("DELETE FROM posts WHERE postId = ?", [postId]);

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error("❌ 게시글 삭제 오류:", err);
    res.status(500).json({ success: false });
  } finally {
    conn.release();
  }
});

/**
 * 5. 단일 피드 상세 조회
 */
router.get("/:postId", auth, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.userId;

  try {
    const [[post]] = await db.query(
      `SELECT p.postId, p.userId, u.name, u.nick, u.profileImg,
              p.content, p.createdAt
       FROM posts p
       LEFT JOIN users u ON p.userId = u.userId
       WHERE p.postId = ?`,
      [postId]
    );

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "피드가 없습니다" });
    }

    // 이미지 목록 조회
    const [images] = await db.query(
      `SELECT url, type FROM postImgs WHERE postId = ? ORDER BY sort`,
      [postId]
    );
    post.images = images.map((img) => ({
      url: img.url,
      type: img.type || "image", // 기본값을 이미지로
    }));

    // 좋아요 수 및 사용자의 좋아요 여부
    const [[likeData]] = await db.query(
      `SELECT COUNT(*) AS likeCount,
              SUM(CASE WHEN userId = ? THEN 1 ELSE 0 END) AS liked
       FROM postlikes
       WHERE postId = ?`,
      [userId, postId]
    );

    post.likeCount = likeData.likeCount;
    post.liked = !!likeData.liked;

    res.json({ success: true, feed: post });
  } catch (err) {
    console.error("❌ 피드 상세 조회 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

module.exports = router;
