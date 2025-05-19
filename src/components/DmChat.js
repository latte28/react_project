import React, { useEffect, useState, useRef } from "react";
import { Box, TextField, IconButton, InputAdornment } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ImageIcon from "@mui/icons-material/Image";
import { jwtDecode } from "jwt-decode";
import DmMessageBubble from "./DmMessageBubble";
import { useDarkMode } from "./DarkModeContext";

function DmChat({ roomId, toUserId: initialToUserId, onUnreadIncrement, onUnreadClear }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [toUserId, setToUserId] = useState(initialToUserId || null);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const { darkMode } = useDarkMode();

  const token = localStorage.getItem("token");
  const currentUserId = jwtDecode(token).userId;

  useEffect(() => {
    if (!initialToUserId) {
      fetch(`http://localhost:3003/dm/partner/${roomId}`, {
        headers: { Authorization: "Bearer " + token },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setToUserId(data.partnerId);
          }
        });
    } else {
      setToUserId(initialToUserId);
    }
  }, [roomId, initialToUserId, token]);

  useEffect(() => {
    fetch(`http://localhost:3003/dm/messages/${roomId}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessages(data.messages);
        }
      });

    fetch(`http://localhost:3003/dm/mark-read/${roomId}`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && onUnreadClear) {
          onUnreadClear();
        }
      });

    socketRef.current = new WebSocket(`ws://localhost:3003?token=${token}`);

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "dm") {
        if (String(data.roomId) === String(roomId)) {
          setMessages((prev) => [
            ...prev,
            {
              ...data,
              createdAt: data.createdAt || new Date().toISOString(),
            },
          ]);

          // 실시간 읽음 처리 요청
          fetch(`http://localhost:3003/dm/mark-read/${roomId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          }).then(() => {
            if (onUnreadClear) onUnreadClear();
          });
        } else if (data.toUserId === currentUserId) {
          if (onUnreadIncrement) {
            onUnreadIncrement();
          }
        }
      }

      if (data.type === "dm-delete" && String(data.roomId) === String(roomId)) {
        setMessages((prev) =>
          prev.filter((msg) => msg.messageId !== data.messageId)
        );
      }
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.onmessage = null;
        socketRef.current.close();
      }
    };
  }, [roomId, token, currentUserId, onUnreadIncrement, onUnreadClear]);

  const sendMessage = async () => {
    if (
      (!input.trim() && !file) ||
      !toUserId ||
      socketRef.current.readyState !== WebSocket.OPEN
    )
      return;

    let mediaUrl = "";
    let mediaType = "";

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:3003/dm/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        mediaUrl = data.url;
        mediaType = file.type.startsWith("image") ? "image" : "unknown";
      }

      setFile(null);
    }

    const message = {
      type: "dm",
      roomId,
      toUserId,
      content: input,
      mediaUrl,
      mediaType,
    };

    socketRef.current.send(JSON.stringify(message));
    setInput("");
  };

  const handleDeleteMessage = async (messageId) => {
    const msg = {
      type: "dm-delete",
      roomId,
      messageId,
    };
    socketRef.current.send(JSON.stringify(msg));
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const bgColor = darkMode ? "#000" : "#fff";
  const textColor = darkMode ? "#fff" : "#000";
  const inputBg = darkMode ? "#111" : "#f5f5f5";
  const borderColor = darkMode ? "#333" : "#ccc";

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: bgColor,
        color: textColor,
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: "auto", py: 2 }}>
        {messages.map((msg, i) => (
          <DmMessageBubble
            key={msg.messageId || i}
            message={msg}
            isMe={msg.senderId === currentUserId}
            onDelete={handleDeleteMessage}
          />
        ))}
        <div ref={bottomRef} />
      </Box>

      {file && (
        <Box sx={{ px: 2, pb: 1 }}>
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }}
          />
        </Box>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => setFile(e.target.files[0])}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 2,
          borderTop: `1px solid ${borderColor}`,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="메시지를 입력하세요"
          InputProps={{
            sx: {
              backgroundColor: inputBg,
              color: textColor,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: borderColor,
              },
              "& input": {
                color: textColor,
              },
            },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon sx={{ color: textColor }} />
                </IconButton>
                <IconButton onClick={sendMessage}>
                  <SendIcon sx={{ color: "#3797f0" }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}

export default DmChat;
