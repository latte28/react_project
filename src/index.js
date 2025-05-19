import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { DarkModeProvider } from "./components/DarkModeContext";

// ✅ 현재 경로 가져오기
const currentPath = window.location.pathname;

// ✅ 로그인, 회원가입 등 밝은 테마를 써야 하는 페이지 목록
const isLightOnlyPage = ["/login", "/join", "/find-id", "/find-password"].includes(currentPath);

// ✅ 라이트 전용 페이지가 아닐 때만 다크모드 적용
if (!isLightOnlyPage) {
  const savedDarkMode = localStorage.getItem("darkMode") === "true";
  document.body.classList.add(savedDarkMode ? "dark" : "light");
} else {
  // 다크모드 클래스 제거 (혹시 남아 있을 수도 있으므로)
  document.body.classList.remove("dark");
  document.body.classList.add("light");
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <DarkModeProvider>
      <App />
    </DarkModeProvider>
  </BrowserRouter>
);
