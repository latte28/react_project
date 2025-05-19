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
import NotificationPanel from "./components/NotificationPanel"; // 알림 패널 import
import { useDarkMode } from "./components/DarkModeContext";
import DmPage from "./components/DmPage";

function App() {
  const { darkMode } = useDarkMode();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false); // 알림 패널 상태

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

      {/* ✅ 알림 패널은 항상 전역 위치에 고정 */}
      <NotificationPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route
            path="/"
            element={<Main setShowNotifications={setShowNotifications} />}
          />
          <Route
            path="/main"
            element={<Main setShowNotifications={setShowNotifications} />}
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
                unreadCount={0} // 나중에 알림 수 연동되면 바꿔
              />
            }
          />
          <Route
            path="/dm/:roomId"
            element={
              <DmPage
                onNotiClick={() => setShowNotifications(true)}
                onUploadClick={() => console.log("업로드 클릭 처리")}
                unreadCount={0}
              />
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
