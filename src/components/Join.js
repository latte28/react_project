import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Paper,
  MenuItem,
  Stack,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function Join() {
  const [form, setForm] = useState({
    userId: "",
    email: "",
    pw: "",
    nick: "",
    name: "",
    phone: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [idCheckMsg, setIdCheckMsg] = useState("");
  const [isIdValid, setIsIdValid] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [confirmPw, setConfirmPw] = useState("");
  const [isPwMatch, setIsPwMatch] = useState(true);
  const navigate = useNavigate();

  const validatePhone = (phone) => /^010\d{8}$/.test(phone.replace(/-/g, ""));
  const formatPhone = (phone) =>
    phone.replace(/-/g, "").replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
  const validateEmail = (email) => {
    const regex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email);
  };
  const validateUserId = (userId) => /^[a-zA-Z0-9]{4,}$/.test(userId);
  const validatePassword = (pw) =>
    /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(pw);

  const checkUserId = async (userId) => {
    if (!userId) {
      setIdCheckMsg("아이디를 입력해주세요.");
      setIsIdValid(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3003/user/check-id?userId=${userId}`
      );
      const data = await res.json();

      if (data.exists) {
        setIdCheckMsg("❌ 이미 사용 중인 아이디입니다.");
        setIsIdValid(false);
      } else {
        setIdCheckMsg("✅ 사용 가능한 아이디입니다.");
        setIsIdValid(true);
      }
    } catch {
      setIdCheckMsg("중복 확인 실패");
      setIsIdValid(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "userId") {
      checkUserId(value);
      setIsIdValid(validateUserId(value));
    }
    if (name === "phone") setIsPhoneValid(validatePhone(value));
    if (name === "email") setIsEmailValid(validateEmail(value));
    if (name === "pw") setIsPwMatch(value === confirmPw);
    if (name === "confirmPw") {
      setConfirmPw(value);
      setIsPwMatch(form.pw === value);
    }
  };

  const handleTogglePw = () => setShowPw((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const birth = `${form.birthYear}-${form.birthMonth}-${form.birthDay}`;

    if (!isIdValid) {
      alert("아이디 중복 확인을 통과해주세요.");
      return;
    }

    if (!validatePassword(form.pw)) {
      alert("비밀번호는 영문자와 숫자를 포함해 8자 이상이어야 합니다.");
      return;
    }
    if (!isPwMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!validatePhone(form.phone)) {
      alert("전화번호는 01012345678 또는 010-1234-5678 형식으로 입력해주세요.");
      return;
    }

    const formattedPhone = formatPhone(form.phone);

    try {
      const res = await fetch("http://localhost:3003/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, phone: formattedPhone, birth }),
      });

      const data = await res.json();
      if (data.success) {
        alert("회원가입 성공!");
        navigate("/login");
      } else {
        alert(data.message || "회원가입 실패");
      }
    } catch (err) {
      alert("서버 오류 발생: " + err.message);
    }
  };

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const years = Array.from({ length: 100 }, (_, i) => 2024 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#fafafa",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 400,
          padding: 4,
          borderRadius: 2,
          boxSizing: "border-box",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight="bold" align="center">
              회원가입
            </Typography>

            <TextField
              label="아이디"
              name="userId"
              value={form.userId}
              onChange={handleChange}
              size="small"
              fullWidth
              required
              helperText={
                form.userId && !validateUserId(form.userId)
                  ? "영문자와 숫자를 조합한 4자 이상"
                  : idCheckMsg
              }
              error={form.userId && !validateUserId(form.userId)}
            />

            <TextField
              label="비밀번호"
              name="pw"
              value={form.pw}
              onChange={handleChange}
              type={showPw ? "text" : "password"}
              size="small"
              fullWidth
              required
              error={form.pw && !validatePassword(form.pw)}
              helperText={
                form.pw && !validatePassword(form.pw)
                  ? "영문자와 숫자를 포함한 8자 이상 입력하세요"
                  : " "
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePw} edge="end">
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="비밀번호 확인"
              name="confirmPw"
              value={confirmPw}
              onChange={handleChange}
              type="password"
              size="small"
              fullWidth
              required
              error={confirmPw && !isPwMatch}
              helperText={
                confirmPw && !isPwMatch ? "비밀번호가 일치하지 않습니다." : " "
              }
            />
            <TextField
              label="이메일"
              name="email"
              value={form.email}
              onChange={handleChange}
              size="small"
              type="email"
              fullWidth
              required
              error={form.email && !isEmailValid}
              helperText={
                form.email && !isEmailValid
                  ? "올바른 이메일 형식으로 입력하세요"
                  : " "
              }
            />
            <TextField
              label="이름"
              name="name"
              value={form.name}
              onChange={handleChange}
              size="small"
              fullWidth
              required
            />

            <TextField
              label="닉네임"
              name="nick"
              value={form.nick}
              onChange={handleChange}
              size="small"
              fullWidth
              required
            />

            <TextField
              label="전화번호"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              size="small"
              fullWidth
              required
              placeholder="01012345678 또는 010-1234-5678"
              helperText={
                form.phone && !isPhoneValid
                  ? "01012345678 또는 010-1234-5678 형식으로 입력하세요"
                  : " "
              }
              error={form.phone && !isPhoneValid}
            />

            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                select
                label="년"
                name="birthYear"
                value={form.birthYear}
                onChange={handleChange}
                size="small"
                fullWidth
                required
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="월"
                name="birthMonth"
                value={form.birthMonth}
                onChange={handleChange}
                size="small"
                fullWidth
                required
              >
                {months.map((month) => (
                  <MenuItem
                    key={month}
                    value={month.toString().padStart(2, "0")}
                  >
                    {month}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="일"
                name="birthDay"
                value={form.birthDay}
                onChange={handleChange}
                size="small"
                fullWidth
                required
              >
                {days.map((day) => (
                  <MenuItem key={day} value={day.toString().padStart(2, "0")}>
                    {day}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ fontWeight: "bold", py: 1 }}
            >
              회원가입
            </Button>

            <Typography variant="body2" align="center">
              이미 회원이신가요?{" "}
              <Link
                to="/login"
                style={{ fontWeight: "bold", textDecoration: "none" }}
              >
                로그인
              </Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

export default Join;
