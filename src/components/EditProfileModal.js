import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// 항상 라이트 모드 테마
const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

function EditProfileModal({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    nick: "",
    email: "",
    phone: "",
    birth: "",
    website: "",
    bio: "",
    gender: "",
    profileImg: "",
    profileFile: null,
  });
  const [preview, setPreview] = useState("/default.png");
  const fileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3003/user/info", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const user = data.user;
          setForm((prev) => ({
            ...prev,
            ...user,
            bio: !user.bio || user.bio === "null" ? "" : user.bio,
            gender:
              user.gender === "남성" || user.gender === "여성"
                ? user.gender
                : "기타",
          }));
          setPreview(
            user.profileImg && user.profileImg !== "null"
              ? user.profileImg.startsWith("http")
                ? user.profileImg
                : "http://localhost:3003" + user.profileImg
              : "/default.png"
          );
        }
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, profileFile: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("nick", form.nick);
    formData.append("bio", form.bio);
    formData.append("gender", form.gender);
    if (form.profileFile) {
      formData.append("profileImg", form.profileFile);
    }

    fetch("http://localhost:3003/user/update", {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("수정 완료!");
          onClose();
          navigate("/profile");
        }
      });
  };

  const inputStyle = {
    mb: 2,
    "& .MuiInputBase-root": {
      bgcolor: "#fff",
    },
    "& .MuiInputBase-input": {
      color: "#000",
    },
    "& .MuiInputLabel-root": {
      color: "#000",
    },
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <Box
        className="force-light"
        sx={{
          width: 500,
          maxHeight: "90vh",
          overflowY: "auto",
          bgcolor: "#fff",
          color: "#000",
          p: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" mb={2}>
          프로필 편집
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            src={preview}
            sx={{ width: 80, height: 80, mr: 2, cursor: "pointer" }}
            onClick={() => fileRef.current?.click()}
          />
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileRef}
            onChange={handleImageChange}
          />
          <Typography>{form.nick}</Typography>
        </Box>

        <TextField
          fullWidth
          label="이름"
          name="name"
          value={form.name}
          onChange={handleChange}
          sx={inputStyle}
        />
        <TextField
          fullWidth
          label="닉네임"
          name="nick"
          value={form.nick}
          onChange={handleChange}
          sx={inputStyle}
        />
        <TextField
          fullWidth
          label="소개"
          name="bio"
          value={form.bio}
          onChange={handleChange}
          sx={inputStyle}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ color: "#000" }}>성별</InputLabel>
          <Select
            name="gender"
            value={form.gender || ""}
            label="성별"
            onChange={handleChange}
            sx={{
              "& .MuiInputBase-root": {
                bgcolor: "#fff",
              },
              "& .MuiSelect-select": {
                color: "#000",
              },
            }}
          >
            <MenuItem value="남성">남성</MenuItem>
            <MenuItem value="여성">여성</MenuItem>
            <MenuItem value="기타">기타</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={onClose} color="inherit">
            취소
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            수정 완료
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default EditProfileModal;
