import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";

function FindPassword() {
  const [form, setForm] = useState({ userId: "", email: "" });
  const navigate = useNavigate();

  const handleResetRequest = () => {
    fetch("http://localhost:3003/user/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        console.log("응답 결과:", data);
        if (data.success) {
          navigate(`/reset-password?token=${data.token}`);
        } else {
          alert(data.message);
        }
      })
      .catch(err => {
        console.error("비밀번호 재설정 요청 오류:", err);
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
          placeholder="아이디"
          fullWidth
          variant="outlined"
          value={form.userId}
          onChange={(e) => setForm(prev => ({ ...prev, userId: e.target.value }))}
          sx={{ mb: 2 }}
        />

        <TextField
          placeholder="가입한 이메일"
          fullWidth
          variant="outlined"
          value={form.email}
          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
          sx={{ mb: 2 }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleResetRequest}
          sx={{
            backgroundColor: "#3897f0",
            textTransform: "none",
            fontWeight: 500,
            py: 1.2
          }}
        >
          재설정 링크 받기
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

export default FindPassword;
