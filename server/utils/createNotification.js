const db = require("../db");

async function createNotification({
  userId,
  type,
  msg,
  postId = null,
  fromUser = null,
  extraData = null,
}) {
  try {
    let existing = [];

    // 중복 방지 조건이 필요한 알림 종류
    const uniqueTypes = ["like", "comment", "reply", "follow_accept"];

    // follow_request는 isRead = 0인 알림만 중복 체크
    if (type === "follow_request") {
      [existing] = await db.query(
        `SELECT * FROM notis 
         WHERE userId = ? AND type = 'follow_request' AND fromUser = ? AND isRead = 0`,
        [userId, fromUser]
      );
    } else if (uniqueTypes.includes(type)) {
      [existing] = await db.query(
        `SELECT * FROM notis 
         WHERE userId = ? AND type = ? AND postId <=> ? AND fromUser <=> ?`,
        [userId, type, postId, fromUser]
      );
    }

    if (existing.length === 0) {
      await db.query(
        `INSERT INTO notis 
         (userId, type, msg, postId, fromUser, extraData, isRead, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`,
        [
          userId,
          type,
          msg,
          postId,
          fromUser,
          extraData ? JSON.stringify(extraData) : null,
        ]
      );
      console.log("✅ 알림 생성됨:", { userId, type, msg });
    } else {
      console.log("ℹ️ 중복 알림 무시됨:", { type, postId, fromUser });
    }
  } catch (err) {
    console.error("❌ 알림 생성 실패:", err);
  }
}

module.exports = createNotification;
