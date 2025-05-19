import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Button,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDarkMode } from "./DarkModeContext";

function NotificationPanel({
  open,
  onClose,
  onNotiClick,
  refreshUnreadCount,
  onFollowAction,
}) {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotiId, setLoadingNotiId] = useState(null);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    if (!open) return;

    const token = localStorage.getItem("token");
    fetch("http://localhost:3003/notis/list", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const parsed = data.notis.map((n) => ({
            ...n,
            extraData:
              typeof n.extraData === "string"
                ? JSON.parse(n.extraData)
                : n.extraData,
            fromUser:
              typeof n.fromUser === "string"
                ? JSON.parse(n.fromUser)
                : n.fromUser,
          }));
          setNotifications(parsed);
        }
      })
      .catch((err) => console.error("알림 목록 불러오기 실패", err));
  }, [open]);

  const markAsRead = async (notiId) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3003/notis/read/${notiId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    refreshUnreadCount?.();
  };

 const handleAcceptFollow = async (followId, notiId) => {
  setLoadingNotiId(notiId);
  const token = localStorage.getItem("token");

  await fetch(`http://localhost:3003/follows/${followId}/accept`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  await markAsRead(notiId);

  setNotifications((prev) =>
    prev.map((n) =>
      n.notiId === notiId
        ? {
            ...n,
            type: "follow_accepted",
            msg: `${n.fromUser.nick}님과 서로 팔로우되었습니다.`,
            isRead: true,
          }
        : n
    )
  );

  // ✅ 여기! 올바르게 updatedNoti 객체 전달
  onFollowAction?.({
    notiId,
    type: "follow_accepted",
    msg: `${notifications.find((n) => n.notiId === notiId)?.fromUser.nick || "상대"}님과 서로 팔로우되었습니다.`,
    isRead: true,
  });

  setLoadingNotiId(null);
};


  const handleRejectFollow = async (followId, notiId) => {
    setLoadingNotiId(notiId);
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3003/follows/${followId}/reject`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    await markAsRead(notiId);
    setNotifications((prev) => prev.filter((n) => n.notiId !== notiId));
    setLoadingNotiId(null);
    onFollowAction?.();
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 240,
        width: "100%",
        maxWidth: 320,
        minWidth: 260,
        height: "100vh",
        bgcolor: darkMode ? "#111" : "#fff",
        color: darkMode ? "#fff" : "#000",
        borderRight: darkMode ? "1px solid #333" : "1px solid #ccc",
        boxShadow: "3px 0 10px rgba(0,0,0,0.1)",
        zIndex: 1200,
        px: 2,
        py: 3,
        overflowY: "auto",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">알림</Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: darkMode ? "#fff" : "#000" }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: darkMode ? "#444" : "#ccc" }} />

      {notifications.length === 0 ? (
        <Typography sx={{ mt: 4, color: darkMode ? "#888" : "#888" }}>
          알림이 없습니다.
        </Typography>
      ) : (
        notifications.map((noti) => (
          <Box
            key={noti.notiId}
            sx={{
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: darkMode ? "#333" : "#eee",
              opacity: noti.isRead ? 0.6 : 1,
              "&:hover": {
                backgroundColor: darkMode ? "#222" : "#f4f4f4",
              },
            }}
          >
            {noti.type === "follow_request" &&
            noti.extraData?.followId &&
            noti.fromUser ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  src={
                    noti.fromUser.profileImg
                      ? `http://localhost:3003${noti.fromUser.profileImg}`
                      : "/default.png"
                  }
                  sx={{ width: 36, height: 36 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2">
                    <b>{noti.fromUser.nick}</b>님이 회원님을 팔로우하기
                    시작했습니다.
                  </Typography>
                </Box>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Button
                    size="small"
                    variant="contained"
                    disabled={loadingNotiId === noti.notiId}
                    onClick={() =>
                      handleAcceptFollow(noti.extraData.followId, noti.notiId)
                    }
                  >
                    수락
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={loadingNotiId === noti.notiId}
                    onClick={() =>
                      handleRejectFollow(noti.extraData.followId, noti.notiId)
                    }
                  >
                    거절
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-line",
                  cursor: noti.postId ? "pointer" : "default",
                }}
                onClick={async () => {
                  await markAsRead(noti.notiId);
                  if (noti.postId && onNotiClick) {
                    onNotiClick(noti.postId, noti.userId);
                    onClose();
                  }
                }}
              >
                {noti.msg}
              </Typography>
            )}
          </Box>
        ))
      )}
    </Box>
  );
}

export default NotificationPanel;
