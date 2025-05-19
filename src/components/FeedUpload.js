import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useNavigate } from "react-router-dom";

function FeedUpload() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const files = [...e.target.files];
    setImages(files);

    const previews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    setPreviewUrls(previews);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", content);
    images.forEach((file) => {
      formData.append("images", file);
    });

    const res = await fetch("http://localhost:3003/posts", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      alert("업로드 성공!");
      navigate("/main");
    } else {
      alert("업로드 실패!");
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#000",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        px: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleUpload}
        sx={{
          width: "100%",
          maxWidth: 480,
          backgroundColor: "#111",
          borderRadius: 4,
          p: 4,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" mb={3}>
          피드 업로드
        </Typography>

        <Box
          component="textarea"
          rows={6}
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            resize: "vertical",
            backgroundColor: "#fff",
            color: "#000",
            lineHeight: "1.5",
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <Button
          component="label"
          variant="outlined"
          sx={{ mb: 2, color: "#fff", borderColor: "#555" }}
          startIcon={<AddPhotoAlternateIcon />}
        >
          사진/영상 선택
          <input
            type="file"
            multiple
            accept="image/*,video/mp4"
            hidden
            onChange={handleFileChange}
          />
        </Button>

        {/* 미리보기 */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {previewUrls.map((media, idx) =>
            media.type === "video" ? (
              <Box
                key={idx}
                component="video"
                src={media.url}
                controls
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  objectFit: "cover",
                  backgroundColor: "#000",
                }}
              />
            ) : (
              <Box
                key={idx}
                component="img"
                src={media.url}
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 2,
                }}
              />
            )
          )}
        </Box>

        <Button type="submit" variant="contained" fullWidth>
          업로드
        </Button>
      </Box>
    </Box>
  );
}

export default FeedUpload;
