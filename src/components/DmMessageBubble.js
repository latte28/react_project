import React, { useState } from "react";
import { Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";

function DmMessageBubble({ message, isMe, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [hover, setHover] = useState(false);
  const isImage = message.mediaType === "image";
  const isVideo = message.mediaType === "video";
  const SERVER_URL = "http://localhost:3003";

  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleDelete = () => {
    handleCloseMenu();
    if (onDelete) onDelete(message.messageId);
  };

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        display: "flex",
        justifyContent: isMe ? "flex-end" : "flex-start",
        mb: 2,
        px: 2,
        position: "relative",
        alignItems: "center",
      }}
    >
      {isMe && hover && (
        <IconButton
          size="small"
          onClick={handleOpenMenu}
          sx={{
            mr: 1,
            color: "#aaa",
            backgroundColor: "#222",
            "&:hover": { backgroundColor: "#333" },
            height: 28,
            width: 28,
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      )}

      <Box
        sx={{
          maxWidth: "70%",
          bgcolor: isMe ? "#3797f0" : "#262626",
          color: "#fff",
          px: 2,
          py: 1,
          borderRadius: 2,
          borderTopRightRadius: isMe ? 0 : 2,
          borderTopLeftRadius: isMe ? 2 : 0,
          wordBreak: "break-word",
        }}
      >
        {/* ✅ 이미지/영상 */}
        {message.mediaUrl && (
          <Box sx={{ mb: message.content?.trim() ? 1 : 0 }}>
            {isImage ? (
              <img
                src={`${SERVER_URL}${message.mediaUrl}`}
                alt="media"
                style={{ maxWidth: "100%", borderRadius: 8 }}
              />
            ) : isVideo ? (
              <video
                src={`${SERVER_URL}${message.mediaUrl}`}
                controls
                style={{ maxWidth: "100%", borderRadius: 8 }}
              />
            ) : null}
          </Box>
        )}

        {/* ✅ 텍스트 메시지 */}
        {typeof message.content === "string" && (
          <Typography variant="body2">{message.content}</Typography>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> 삭제
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default DmMessageBubble;
