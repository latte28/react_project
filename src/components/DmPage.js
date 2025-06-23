import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import Sidebar from "./Sidebar";
import DmSidebar from "./DmSidebar";
import DmChat from "./DmChat";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import NewMessageModal from "./NewMessageModal";
import { useDarkMode } from "./DarkModeContext";
import { jwtDecode } from "jwt-decode";

function DmPage({ onUploadClick, onNotiClick }) {
  const { darkMode } = useDarkMode();
  const { roomId } = useParams();
  const location = useLocation();
  const toUserId = location.state?.toUserId;

  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notiCount, setNotiCount] = useState(0);

  const token = localStorage.getItem("token");
  const currentUserId = jwtDecode(token).userId;

  // ✅ 초기 알림/DM 읽지 않은 개수
  useEffect(() => {
    fetch("http://localhost:3003/dm/unread-count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => data.success && setUnreadCount(data.count));

    fetch("http://localhost:3003/notis/unread-count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => data.success && setNotiCount(data.count));
  }, [token]);

  // ✅ WebSocket 실시간 수신
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:3003?token=${token}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "dm" && String(data.toUserId) === String(currentUserId)) {
        if (String(data.roomId) !== String(roomId)) {
          setUnreadCount((prev) => prev + 1);
        }
      }

      if (data.type === "notification") {
        setNotiCount((prev) => prev + 1);
      }
    };

    return () => socket.close();
  }, [token, roomId, currentUserId]);

  // ✅ 채팅방 진입 시 읽음 처리 API 호출
  useEffect(() => {
    if (roomId) {
      fetch(`http://localhost:3003/dm/mark-read/${roomId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }).then(() => {
        // 읽음 후 count 감소 (서버에서도 처리되었기 때문에 반영)
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      });
    }
  }, [roomId, token]);

  // ✅ 미사용 상태 유지
  const handleUnreadIncrement = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
  }, []);

  const handleUnreadClear = useCallback(() => {
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const bgMain = darkMode ? "#000" : "#fff";
  const textColor = darkMode ? "#fff" : "#000";
  const borderColor = darkMode ? "#333" : "#ccc";

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        onUploadClick={onUploadClick}
        onNotiClick={onNotiClick}
        unreadCount={unreadCount}
        notiCount={notiCount}
      />

      <Box sx={{ display: "flex", flexGrow: 1, ml: "240px" }}>
        <Box
          sx={{
            width: 360,
            borderRight: `1px solid ${borderColor}`,
            bgcolor: bgMain,
            color: textColor,
          }}
        >
          <DmSidebar onNewMessageClick={() => setIsNewMessageOpen(true)} />
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            bgcolor: bgMain,
            color: textColor,
            position: "relative",
          }}
        >
          {roomId ? (
            <DmChat
              roomId={roomId}
              toUserId={toUserId}
              onUnreadIncrement={handleUnreadIncrement}
              onUnreadClear={handleUnreadClear}
            />
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                textAlign: "center",
                px: 3,
              }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 64, color: "#888" }} />
              <Typography variant="h5" fontWeight="bold">
                내 메시지
              </Typography>
              <Typography variant="body2" sx={{ color: "#aaa" }}>
                친구나 그룹에 비공개 사진과 메시지를 보내보세요.
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  backgroundColor: "#3797f0",
                  "&:hover": { backgroundColor: "#318ae0" },
                }}
                onClick={() => setIsNewMessageOpen(true)}
              >
                메시지 보내기
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <NewMessageModal
        open={isNewMessageOpen}
        onClose={() => setIsNewMessageOpen(false)}
      />
    </Box>
  );
}

export default DmPage;
