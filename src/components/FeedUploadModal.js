import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

function FeedUploadModal({ onClose, onSuccess }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFileChange = (e) => {
    const files = [...e.target.files];
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("content", content); 
    images.forEach((file) => {
      formData.append("images", file);
    });

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:3003/posts", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token, // ✅ 토큰 포함
      },
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      alert("업로드 성공!");
      onSuccess();
    } else {
      alert("업로드 실패!");
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <Typography variant="h6" mb={2}>피드 작성</Typography>

      <TextField
        multiline
        minRows={10}
        maxRows={15}
        fullWidth
        placeholder="내용을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        sx={{ mb: 2, bgcolor: "#fff", borderRadius: 1 }}
      />

      <Button
        component="label"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        startIcon={<AddPhotoAlternateIcon />}
      >
        사진 선택
        <input
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </Button>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        {previewUrls.map((src, idx) => (
          <Box
            key={idx}
            component="img"
            src={src}
            sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 2 }}
          />
        ))}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button onClick={onClose} color="inherit">취소</Button>
        <Button type="submit" variant="contained" color="primary">업로드</Button>
      </Box>
    </form>
  );
}

export default FeedUploadModal;
