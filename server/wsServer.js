// ✅ 실시간 DM 수신 + 읽음 상태 반영용 WebSocket 서버 전체 코드
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const db = require("./db");

const wss = new WebSocket.Server({ noServer: true });
const clients = new Map(); // userId → WebSocket

wss.on("connection", (ws, req) => {
  const userId = req.userId;

  if (clients.has(userId)) {
    const oldWs = clients.get(userId);
    if (oldWs && oldWs.readyState === WebSocket.OPEN) {
      oldWs.terminate();
    }
  }
  clients.set(userId, ws);

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      // ✅ 1. 메시지 전송 처리
      if (data.type === "dm") {
        const { toUserId, roomId, content, mediaUrl, mediaType } = data;

        const [result] = await db.query(
          `INSERT INTO dm_messages 
           (roomId, senderId, toUserId, content, mediaUrl, mediaType, isRead)
           VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
          [roomId, userId, toUserId, content || "", mediaUrl || null, mediaType || null]
        );

        const msg = {
          type: "dm",
          roomId,
          senderId: userId,
          toUserId,
          content,
          mediaUrl,
          mediaType,
          isRead: false,
          createdAt: new Date().toISOString(),
          messageId: result.insertId,
        };

        // 수신자에게 전송
        const toClient = clients.get(toUserId);
        if (toClient && toClient.readyState === WebSocket.OPEN) {
          toClient.send(JSON.stringify(msg));
        }

        // 본인에게 echo
        const fromClient = clients.get(userId);
        if (fromClient && fromClient.readyState === WebSocket.OPEN) {
          fromClient.send(JSON.stringify(msg));
        }
      }

      // ✅ 2. 메시지 삭제 처리
      if (data.type === "dm-delete") {
        const { messageId, roomId } = data;

        const [rows] = await db.query(
          "SELECT * FROM dm_messages WHERE messageId = ? AND senderId = ?",
          [messageId, userId]
        );
        if (rows.length === 0) return;

        await db.query("DELETE FROM dm_messages WHERE messageId = ?", [messageId]);

        const deleteMsg = {
          type: "dm-delete",
          messageId,
          roomId,
        };

        const [roomRows] = await db.query("SELECT * FROM dm_rooms WHERE roomId = ?", [roomId]);
        const { userA, userB } = roomRows[0];
        const targetId = userA === userId ? userB : userA;

        [userId, targetId].forEach((uid) => {
          const client = clients.get(uid);
          if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(deleteMsg));
          }
        });
      }

      // ✅ 3. 메시지 읽음 처리
      if (data.type === "dm-read") {
        const { roomId } = data;

        await db.query(
          `UPDATE dm_messages SET isRead = TRUE WHERE roomId = ? AND toUserId = ?`,
          [roomId, userId]
        );

        // 수신자(=보낸 사람)에게 알림 (optional)
        const readConfirm = {
          type: "dm-read",
          roomId,
          readerId: userId,
        };

        // 모든 접속자에게 알림 전송
        for (const [uid, client] of clients.entries()) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(readConfirm));
          }
        }
      }
    } catch (err) {
      console.error("❌ WebSocket 메시지 처리 오류:", err);
    }
  });

  ws.on("close", () => {
    for (const [key, value] of clients.entries()) {
      if (value === ws) {
        clients.delete(key);
        break;
      }
    }
  });

  ws.on("error", (err) => {
    console.error("💥 WebSocket 에러:", err);
  });
});

// ✅ 서버가 특정 유저에게 직접 메시지 보내기
function sendToUser(userId, message) {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
}

module.exports = { wss, sendToUser };
