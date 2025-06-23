import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";

import Login from "./components/Login";
import Join from "./components/Join";
import Main from "./components/Main";
import ProfilePage from "./components/ProfilePage";
import FindId from "./components/FindId";
import FindPassword from "./components/FindPassword";
import ResetPassword from "./components/ResetPassword";
import KakaoCallback from "./components/KakaoCallback";
import ProfileEdit from "./components/ProfileEdit";
import NotificationPanel from "./components/NotificationPanel";
import { useDarkMode } from "./components/DarkModeContext";
import DmPage from "./components/DmPage";

function App() {
  const { darkMode } = useDarkMode();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // ✅ DM 알림 상태
  const [unreadCount, setUnreadCount] = useState(0); // 서버에서 가져온 알림 수
  const [dmSocketCount, setDmSocketCount] = useState(0); // WebSocket으로 받은 알림 수

  // ✅ 서버에서 안읽은 메시지 수 가져오기
  const refreshUnreadCount = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3003/notis/unread-count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUnreadCount(isNaN(data.dmCount) ? 0 : data.dmCount);
        } else {
          setUnreadCount(0);
        }
      })
      .catch(() => setUnreadCount(0));
  };

  // ✅ 채팅방 들어가서 읽음 처리 후 실행
  const handleUnreadClear = () => {
    setDmSocketCount(0);       // WebSocket 알림 초기화
    refreshUnreadCount();      // 서버 값도 다시 요청
  };

  // 다크모드 제외 경로
  const lightOnlyRoutes = [
    "/login",
    "/join",
    "/find-id",
    "/find-password",
    "/reset-password",
  ];
  const isLightOnly = lightOnlyRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  useEffect(() => {
    document.body.classList.remove("light", "dark");
    if (isLightOnly) {
      document.body.classList.add("light");
    } else {
      document.body.classList.add(darkMode ? "dark" : "light");
    }
  }, [darkMode, location.pathname, isLightOnly]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />

      <NotificationPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              <Main
                setShowNotifications={setShowNotifications}
                unreadCount={unreadCount + dmSocketCount} // ✅ 표시용 알림 수
                refreshUnreadCount={refreshUnreadCount}
                setDmSocketCount={setDmSocketCount}
              />
            }
          />
          <Route
            path="/main"
            element={
              <Main
                setShowNotifications={setShowNotifications}
                unreadCount={unreadCount + dmSocketCount}
                refreshUnreadCount={refreshUnreadCount}
                setDmSocketCount={setDmSocketCount}
              />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/find-id" element={<FindId />} />
          <Route path="/find-password" element={<FindPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/kakao/callback" element={<KakaoCallback />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route
            path="/dm"
            element={
              <DmPage
                onNotiClick={() => setShowNotifications(true)}
                onUploadClick={() => console.log("업로드 클릭 처리")}
                unreadCount={unreadCount + dmSocketCount}
                onUnreadClear={handleUnreadClear}
              />
            }
          />
          <Route
            path="/dm/:roomId"
            element={
              <DmPage
                onNotiClick={() => setShowNotifications(true)}
                onUploadClick={() => console.log("업로드 클릭 처리")}
                unreadCount={unreadCount + dmSocketCount}
                onUnreadClear={handleUnreadClear}
              />
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
