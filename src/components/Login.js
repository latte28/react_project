import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  Stack,
  Box,
} from "@mui/material";
import KaKaoIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

// 라이트 모드 강제 적용 테마
const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const REST_API_KEY = "882332c3ee262b6764b8b37aceda1f1a";
  const REDIRECT_URI = "http://localhost:3000/kakao/callback";

  const handleKakaoLogin = () => {
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoURL;
  };

  const handleLogin = () => {
    fetch("http://localhost:3003/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId, pw: password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.token) {
          localStorage.setItem("token", data.token);
          const decoded = jwtDecode(data.token);
          console.log("로그인 정보 ==>", decoded);
          navigate("/main");
        } else {
          alert("로그인 실패: " + (data.message || "알 수 없음"));
        }
      })
      .catch((err) => {
        console.error("서버 오류:", err);
        alert("서버 오류 발생");
      });
  };

  useEffect(() => {
    document.body.classList.remove("dark");
    document.body.classList.add("light");

    return () => {
      document.body.classList.remove("light"); // 나갈 때 원래대로
    };
  }, []);

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Paper
          elevation={4}
          sx={{
            width: "90%",
            maxWidth: "600px",
            padding: 4,
            borderRadius: 2,
            boxSizing: "border-box",
          }}
        >
          <Typography
            variant="h5"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            로그인
          </Typography>

          <TextField
            label="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            variant="outlined"
            margin="normal"
            fullWidth
            required
          />

          <TextField
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            margin="normal"
            fullWidth
            required
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            sx={{
              mt: 2,
              py: 1.3,
              fontWeight: "bold",
              backgroundColor: "#3897f0",
            }}
          >
            로그인
          </Button>

          <Divider sx={{ my: 3 }}>또는</Divider>

          <Stack spacing={1.2} sx={{ mb: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<KaKaoIcon />}
              sx={{
                backgroundColor: "#FEE500",
                color: "#000",
                height: 44,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#FDD835",
                },
              }}
              onClick={handleKakaoLogin}
            >
              카카오 로그인
            </Button>

            <Button
              fullWidth
              variant="contained"
              startIcon={<AppleIcon />}
              sx={{
                backgroundColor: "#000",
                color: "#fff",
                height: 44,
                textTransform: "none",
              }}
              onClick={() => alert("Apple 로그인 준비 중")}
            >
              Apple로 로그인
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<PhoneIphoneIcon />}
              sx={{
                color: "#10b981",
                borderColor: "#10b981",
                height: 44,
                textTransform: "none",
              }}
              onClick={() => alert("전화번호 로그인 준비 중")}
            >
              전화번호로 로그인
            </Button>
          </Stack>

          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            아이디 또는 비밀번호를 잊으셨나요?{" "}
            <Link
              to="/find-id"
              style={{ fontWeight: "bold", textDecoration: "none" }}
            >
              아이디 찾기
            </Link>{" "}
            /{" "}
            <Link
              to="/find-password"
              style={{ fontWeight: "bold", textDecoration: "none" }}
            >
              비밀번호 찾기
            </Link>
          </Typography>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            계정이 없으신가요?{" "}
            <Link
              to="/join"
              style={{ fontWeight: "bold", textDecoration: "none" }}
            >
              가입하기
            </Link>
          </Typography>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default Login;
