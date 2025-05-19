import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

function ResetPassword() {
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  const handleSubmit = () => {
    if (newPw !== confirmPw) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    fetch("http://localhost:3003/user/reset-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPw }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("비밀번호 변경 완료");
          navigate("/login");
        } else {
          alert(data.message);
        }
      })
      .catch(err => {
        console.error("비밀번호 변경 오류:", err);
        alert("요청 처리 중 오류가 발생했습니다.");
      });
  };

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "#fafafa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          border: "1px solid #dbdbdb",
          borderRadius: 2,
          textAlign: "center",
          backgroundColor: "#fff"
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 500, mb: 3 }}>
          비밀번호 재설정
        </Typography>

        <TextField
          placeholder="새 비밀번호"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
        />

        <TextField
          placeholder="비밀번호 확인"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: "#3897f0",
            textTransform: "none",
            fontWeight: 500,
            py: 1.2
          }}
        >
          비밀번호 변경
        </Button>

        <Typography variant="body2" sx={{ mt: 3, color: "#8e8e8e" }}>
          <Link to="/login" style={{ color: "#00376b", textDecoration: "none" }}>
            로그인으로 돌아가기
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default ResetPassword;
