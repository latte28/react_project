import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function EditFeedModal({ feed, onClose, onUpdate }) {
  const [content, setContent] = useState(feed.content);
  const [selectedImage, setSelectedImage] = useState(null); // 새 선택 파일
  const [previewUrl, setPreviewUrl] = useState(null);       // 미리보기 URL
  const fileInputRef = useRef();

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  useEffect(() => {
    return () => {
      // 메모리 누수 방지
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("content", content);
    if (selectedImage) {
      formData.append("images", selectedImage);
    }

    const res = await fetch(`http://localhost:3003/posts/${feed.postId}`, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      onUpdate(data.updatedFeed);
      onClose();
    } else {
      alert("수정 실패");
    }
  };

  return (
    <Box
      sx={{
        width: "80%",
        maxWidth: "900px",
        height: "80vh",
        display: "flex",
        bgcolor: "#000",
        color: "#fff",
        mx: "auto",
        mt: "5vh",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* 미디어 영역 */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          cursor: "pointer",
          bgcolor: "#111",
        }}
        onClick={handleImageClick}
      >
        {previewUrl ? (
          selectedImage?.type.startsWith("video/") ? (
            <video
              src={previewUrl}
              controls
              autoPlay
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <img
              src={previewUrl}
              alt="미리보기"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )
        ) : feed.images?.[0]?.url ? (
          feed.images[0].type === "video" ? (
            <video
              src={"http://localhost:3003" + feed.images[0].url}
              controls
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <img
              src={"http://localhost:3003" + feed.images[0].url}
              alt="기존 이미지"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )
        ) : (
          <img
            src="/default.png"
            alt="기본 이미지"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        <input
          type="file"
          accept="image/*,video/*"
          hidden
          ref={fileInputRef}
          onChange={handleImageChange}
        />
      </Box>

      {/* 오른쪽 수정 영역 */}
      <Box
        sx={{
          width: 400,
          display: "flex",
          flexDirection: "column",
          p: 3,
          bgcolor: "#fafafa",
          color: "#000",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">게시글 수정</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <TextField
          multiline
          rows={6}
          fullWidth
          variant="outlined"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{
            mb: 2,
            bgcolor: "#fff",
            input: { color: "#000" },
            textarea: { color: "#000" },
          }}
        />

        <Button variant="contained" onClick={handleSubmit}>
          수정 완료
        </Button>
      </Box>
    </Box>
  );
}

export default EditFeedModal;
