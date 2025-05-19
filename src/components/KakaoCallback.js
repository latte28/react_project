import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function KakaoCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    fetch("http://localhost:3003/auth/kakao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("token", data.token);

          if (data.firstLogin) {
            // 👉 첫 로그인 시 추가 정보 입력 페이지로 이동
            navigate("/profile-edit");
          } else {
            navigate("/main");
          }
        } else {
          alert("카카오 로그인 실패");
        }
      })
      .catch((err) => {
        console.error("카카오 로그인 처리 중 오류:", err);
        alert("카카오 로그인 실패");
      });
  }, [navigate]);

  return <div>카카오 로그인 처리 중...</div>;
}

export default KakaoCallback;
