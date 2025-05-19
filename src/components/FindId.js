import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";

function FindId() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleFindId = () => {
    fetch("http://localhost:3003/user/find-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("회원님의 아이디는: " + data.userId);
          navigate("/login");
        } else {
          alert(data.message);
        }
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
          아이디 찾기
        </Typography>

        <TextField
          placeholder="가입한 이메일"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleFindId}
          sx={{
            backgroundColor: "#3897f0",
            textTransform: "none",
            fontWeight: 500,
            py: 1.2
          }}
        >
          아이디 찾기
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

export default FindId;
