const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ 인증 실패: 헤더 없음 또는 형식 오류");
    return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT 인증 실패:", err.message);
    return res.status(403).json({ success: false, message: "유효하지 않은 토큰입니다." });
  }
}

module.exports = authMiddleware;
