import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  CssBaseline,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// 항상 라이트 모드 테마
const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#000000",
    },
  },
});

function ProfileEdit() {
  const [form, setForm] = useState({
    name: "",
    nick: "",
    birth: "",
    gender: "",
    phone: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3003/user/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("정보가 저장되었습니다!");
          navigate("/main");
        } else {
          alert("정보 저장 실패");
        }
      });
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box
      className="force-light"
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
        }}
      >
        <Paper sx={{ p: 4, width: 400 }}>
          <Typography variant="h5" gutterBottom>
            추가 정보 입력
          </Typography>

          <TextField
            label="이름"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="닉네임"
            name="nick"
            value={form.nick}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="생년월일"
            name="birth"
            type="date"
            value={form.birth}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="성별"
            name="gender"
            select
            value={form.gender}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value="남자">남자</MenuItem>
            <MenuItem value="여자">여자</MenuItem>
          </TextField>
          <TextField
            label="전화번호"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <Button variant="contained" fullWidth onClick={handleSubmit} sx={{ mt: 2 }}>
            저장하기
          </Button>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default ProfileEdit;
