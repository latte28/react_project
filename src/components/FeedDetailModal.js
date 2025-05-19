import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Divider,
  TextField,
  Button,
  Modal,
  Menu,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import "swiper/css";

function FeedDetailModal({ open, onClose, feed, onLikeUpdate, onDelete }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [commentPage, setCommentPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const token = localStorage.getItem("token");
  const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;

  const fetchComments = useCallback(() => {
    if (!feed) return;
    fetch(`http://localhost:3003/comments/${feed.postId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setComments(data.comments);
          setExpandedReplies({});
          setCommentPage(1);
        }
      });
  }, [feed]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!feed) return;

    fetchComments();
    fetch(`http://localhost:3003/likes/${feed.postId}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLiked(data.liked);
          setLikeCount(data.likeCount);
        }
      });

    setLikeCount(typeof feed.likeCount === "number" ? feed.likeCount : 0);
    setEditContent(feed.content || "");
  }, [feed, fetchComments]);

  const handleLikeToggle = async () => {
    const method = liked ? "DELETE" : "POST";
    try {
      const res = await fetch("http://localhost:3003/likes", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ postId: feed.postId }),
      });

      const data = await res.json();
      if (data.success) {
        setLiked(data.liked);
        setLikeCount(data.likeCount);
        onLikeUpdate &&
          onLikeUpdate({
            ...feed,
            liked: data.liked,
            likeCount: data.likeCount,
            thumbnailUrl: feed.thumbnailUrl,
            images: feed.images,
            profileImg: feed.profileImg,
            nick: feed.nick,
          });
      }
    } catch (err) {
      console.error("좋아요 실패:", err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const res = await fetch("http://localhost:3003/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        postId: feed.postId,
        content: newComment,
        parentId: replyTo,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setNewComment("");
      setReplyTo(null);
      fetchComments();
    }
  };

  const handleEditSubmit = async () => {
    const token = localStorage.getItem("token");
    const fileInput = document.getElementById("edit-image-input");
    const file = fileInput?.files?.[0];

    const formData = new FormData();
    formData.append("content", editContent);
    if (file) {
      formData.append("images", file);
    }

    try {
      const res = await fetch(`http://localhost:3003/posts/${feed.postId}`, {
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        onLikeUpdate && onLikeUpdate(data.updatedFeed);
        setIsEditing(false);
      } else {
        alert("수정 실패");
      }
    } catch (err) {
      console.error("피드 수정 실패:", err);
      alert("서버 오류");
    }
  };

  const handleDeleteFeed = async () => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await fetch(`http://localhost:3003/posts/${feed.postId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      onDelete && onDelete(feed.postId);
      onClose();
    } catch (err) {
      console.error("삭제 오류:", err);
    }
  };

  const renderReplies = (parentId) => {
    const replies = comments.filter((c) => c.parentId === parentId);
    const isExpanded = expandedReplies[parentId];
    const visible = isExpanded ? replies : replies.slice(0, 3);
    return (
      <>
        {visible.map((reply) => {
          const match = reply.content.match(/^@(\S+)\s(.+)$/);
          return (
            <Box key={reply.commentId} sx={{ ml: 3, mt: 0.5 }}>
              <Typography variant="body2">
                <b>{reply.nick}</b>{" "}
                {match ? (
                  <>
                    <span style={{ color: "#4fc3f7", fontWeight: "bold" }}>
                      @{match[1]}
                    </span>{" "}
                    {match[2]}
                  </>
                ) : (
                  reply.content
                )}
              </Typography>
            </Box>
          );
        })}

        {replies.length > 3 && (
          <Button
            size="small"
            sx={{ ml: 3, color: "#aaa", mt: 0.5 }}
            onClick={() =>
              setExpandedReplies((prev) => ({
                ...prev,
                [parentId]: !prev[parentId],
              }))
            }
          >
            {isExpanded ? "답글 숨기기" : `답글 ${replies.length - 3}개 더보기`}
          </Button>
        )}
      </>
    );
  };

  if (!feed) return null;
  const isOwner = decoded?.userId === feed.userId;
  const topLevelComments = comments.filter((c) => !c.parentId);
  const displayedComments = topLevelComments.slice(0, commentPage * 10);

  const firstMedia = feed.images?.[0];
  const rawUrl = firstMedia?.url || "";
  const isVideo = /\.(mp4|webm|ogg)$/i.test(rawUrl);
  const fullUrl = rawUrl.startsWith("blob:")
    ? rawUrl
    : rawUrl
    ? "http://localhost:3003" + rawUrl
    : "";

  return (
    <Modal open={open} onClose={onClose}>
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
        <Box
          sx={{
            flex: 1,
            position: "relative",
            cursor: isEditing ? "pointer" : "default",
          }}
          onClick={() => {
            if (isEditing) document.getElementById("edit-image-input")?.click();
          }}
        >
          <input
            id="edit-image-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                feed.images = [
                  {
                    url,
                    type: file.type.startsWith("video/") ? "video" : "image",
                  },
                ];
              }
            }}
          />
          {fullUrl ? (
            isVideo ? (
              <video
                src={fullUrl}
                controls
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  backgroundColor: "#000",
                }}
              />
            ) : (
              <img
                src={fullUrl}
                alt="피드"
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
        </Box>

        <Box
          sx={{ width: 400, display: "flex", flexDirection: "column", p: 2 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              src={
                feed.profileImg
                  ? "http://localhost:3003" + feed.profileImg
                  : "/default.png"
              }
              sx={{ mr: 1 }}
            />
            <Box>
              <Typography fontWeight="bold">{feed.nick}</Typography>
              <Typography variant="caption" sx={{ color: "#aaa" }}>
                {new Date(feed.createdAt).toLocaleDateString("ko-KR")}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            {isOwner && (
              <>
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ color: "#fff" }}
                >
                  <MoreHorizIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setIsEditing(true);
                      setAnchorEl(null);
                    }}
                  >
                    수정
                  </MenuItem>
                  <MenuItem onClick={handleDeleteFeed}>삭제</MenuItem>
                </Menu>
              </>
            )}
            <IconButton onClick={onClose} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ borderColor: "#333", mb: 2 }} />

          {isEditing ? (
            <>
              <TextField
                fullWidth
                multiline
                rows={8}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                sx={{
                  mb: 2,
                  bgcolor: "#f9f9f9",
                  input: { color: "#000" },
                  textarea: { color: "#000" },
                }}
              />
              <Button variant="contained" onClick={handleEditSubmit}>
                수정 완료
              </Button>
            </>
          ) : (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {feed.content}
            </Typography>
          )}

          {!isEditing && (
            <>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <IconButton onClick={handleLikeToggle}>
                  {liked ? (
                    <FavoriteIcon sx={{ color: "red" }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ color: "#fff" }} />
                  )}
                </IconButton>
                <Typography variant="body2" color="gray">
                  좋아요 {likeCount ?? 0}개
                </Typography>
              </Box>
              <Divider sx={{ borderColor: "#333", my: 1 }} />
            </>
          )}

          {!isEditing && (
            <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 1 }}>
              {topLevelComments.length === 0 ? (
                <Typography variant="body2" color="gray">
                  댓글이 없습니다.
                </Typography>
              ) : (
                displayedComments.map((comment) => (
                  <Box key={comment.commentId} sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <b>{comment.nick}</b> {comment.content}
                    </Typography>
                    <Button
                      size="small"
                      sx={{ ml: 1, color: "#aaa" }}
                      onClick={() => {
                        setReplyTo(comment.commentId);
                        setNewComment(`@${comment.nick} `);
                      }}
                    >
                      답글 달기
                    </Button>
                    {renderReplies(comment.commentId)}
                  </Box>
                ))
              )}
              {topLevelComments.length > displayedComments.length && (
                <Button
                  onClick={() => setCommentPage((prev) => prev + 1)}
                  sx={{ color: "#888", mt: 1 }}
                  fullWidth
                >
                  댓글 더보기
                </Button>
              )}
            </Box>
          )}

          {!isEditing && (
            <Box
              sx={{ display: "flex", gap: 1, mt: "auto", alignItems: "center" }}
            >
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder={
                  replyTo
                    ? `${newComment.startsWith("@") ? "" : "답글 "}입력 중...`
                    : "댓글 달기..."
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
                sx={{ bgcolor: "#222", input: { color: "#fff" } }}
              />
              <Button onClick={handleCommentSubmit} variant="contained">
                게시
              </Button>
              {replyTo && (
                <Button
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment("");
                  }}
                  variant="text"
                  sx={{ color: "#aaa", minWidth: "fit-content" }}
                >
                  취소
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
}

export default FeedDetailModal;
