// ✅ 실시간 DM 수신 + 읽음 상태 반영용 WebSocket 서버 (다중 연결 허용)
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const db = require("./db");

const wss = new WebSocket.Server({ noServer: true });
const clients = new Map(); // userId → WebSocket[]

wss.on("connection", (ws, req) => {
  const userId = req.userId;
  console.log("🧹 연결됨:", userId);

  if (!clients.has(userId)) {
    clients.set(userId, []);
  }
  clients.get(userId).push(ws);

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
        return;
      }

      // ✅ 1. 메시지 전송 처리
      if (data.type === "dm") {
        const { toUserId, roomId, content, mediaUrl, mediaType } = data;

        const [result] = await db.query(
          `INSERT INTO dm_messages 
           (roomId, senderId, toUserId, content, mediaUrl, mediaType, isRead)
           VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
          [
            roomId,
            userId,
            toUserId,
            content || "",
            mediaUrl || null,
            mediaType || null,
          ]
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
        if (clients.has(toUserId)) {
          clients.get(toUserId).forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(msg));
            }
          });
        }

        // 본인에게 echo
        if (clients.has(userId)) {
          clients.get(userId).forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(msg));
            }
          });
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

        await db.query("DELETE FROM dm_messages WHERE messageId = ?", [
          messageId,
        ]);

        const deleteMsg = {
          type: "dm-delete",
          messageId,
          roomId,
        };

        const [roomRows] = await db.query(
          "SELECT * FROM dm_rooms WHERE roomId = ?",
          [roomId]
        );
        const { userA, userB } = roomRows[0];

        [userA, userB].forEach((uid) => {
          if (clients.has(uid)) {
            clients.get(uid).forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(deleteMsg));
              }
            });
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

        const readConfirm = {
          type: "dm-read",
          roomId,
          readerId: userId,
        };

        for (const [uid, clientList] of clients.entries()) {
          clientList.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(readConfirm));
            }
          });
        }
      }
    } catch (err) {
      console.error("❌ WebSocket 메시지 처리 오류:", err);
    }
  });

  ws.on("close", () => {
    console.log("❎ 연결 종료:", userId);
    if (clients.has(userId)) {
      clients.set(
        userId,
        clients.get(userId).filter((client) => client !== ws)
      );
      if (clients.get(userId).length === 0) {
        clients.delete(userId);
      }
    }
  });

  ws.on("error", (err) => {
    console.error("💥 WebSocket 에러:", err);
  });
});

// ✅ 서버가 특정 유저에게 직접 메시지 보내기
function sendToUser(userId, message) {
  if (clients.has(userId)) {
    clients.get(userId).forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

module.exports = { wss, sendToUser };
