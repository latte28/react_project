import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Modal,
  Button,
  TextField,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import Sidebar from "./Sidebar";
import NotificationPanel from "./NotificationPanel";
import BottomNav from "./BottomNav";

import FollowButton from "./FollowButton";

import { useDarkMode } from "./DarkModeContext";
import FeedUploadModal from "./FeedUploadModal";
import FeedDetailModal from "./FeedDetailModal";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Main() {
  const [posts, setPosts] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [isWriting, setIsWriting] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [userInfo, setUserInfo] = useState(null); // 로그인 정보
  const [notificationKey, setNotificationKey] = useState(Date.now());
  const [notiCount, setNotiCount] = useState(0);
  const fetchPosts = () => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3003/posts/list", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPosts(data.posts);
        }
      });
  };

  const toggleLike = async (postId, liked) => {
    const token = localStorage.getItem("token");
    const method = liked ? "DELETE" : "POST";

    const res = await fetch("http://localhost:3003/likes", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ postId }),
    });

    const data = await res.json();
    if (data.success) {
      const { liked: newLiked, likeCount: newCount } = data;
      setPosts((prev) => {
        const updatedPosts = prev.map((post) =>
          post.postId === postId
            ? { ...post, liked: newLiked, likeCount: newCount }
            : post
        );
        const updatedPost = updatedPosts.find((p) => p.postId === postId);
        if (selectedPost?.postId === postId) {
          setSelectedPost(updatedPost);
        }
        return updatedPosts;
      });
    }
  };

  const handleCommentSubmit = async (postId) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:3003/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ postId, content }),
      });

      const data = await res.json();
      if (data.success) {
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
        setIsWriting((prev) => ({ ...prev, [postId]: false }));
        fetchPosts();
      } else {
        alert("댓글 등록 실패: " + (data.message || "알 수 없는 오류"));
      }
    } catch (err) {
      alert("서버 오류");
    }
  };
  // 알림 클릭 시 실행할 핸들러
  const handleNotiClick = async (postId, ownerUserId) => {
    const target = document.getElementById(`post-${postId}`);

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setShowNotifications(false);
    } else {
      // 게시글이 메인에 없으면 해당 유저 프로필로 이동 후 쿼리 파라미터 전달
      navigate(`/profile/${ownerUserId}?post=${postId}`);
    }
  };

  const refreshUnreadCount = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3003/notis/unread-count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
        setUnreadCount(data.dmCount); // ✅ 오직 DM만 카운트하세요!
        setNotiCount(data.notificationCount); // ❤️ 좋아요/댓글 등 일반 알림도 DB에서 분리해서 반환
      }
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetch("http://localhost:3003/user/info", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          fetchPosts();
          refreshUnreadCount();
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    const intervalId = setInterval(refreshUnreadCount, 2000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = new WebSocket(`ws://localhost:3003?token=${token}`);

    socket.onopen = () => {};

    socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "like-update") {
    const { postId, likeCount } = data;
    setPosts((prev) =>
      prev.map((post) =>
        post.postId === Number(postId) ? { ...post, likeCount } : post
      )
    );
    if (selectedPost?.postId === Number(postId)) {
      setSelectedPost((prev) => ({ ...prev, likeCount }));
    }
  }

  if (data.type === "dm") {
    setUnreadCount((prev) => prev + 1); // ✅ DM 알림만 여기
  }

  if (data.type === "notification") {
    setNotifications((prev) => [
      {
        type: "generic",
        notiId: Date.now(),
        msg: data.message,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setNotiCount((prev) => prev + 1);
    if (showNotifications) setNotificationKey(Date.now());
  }

  if (data.type === "follow-request") {
    setNotifications((prev) => [
      {
        type: "follow_request",
        notiId: Date.now(),
        msg: `${data.fromUser.nick}님이 당신을 팔로우 요청했습니다.`,
        extraData: { followId: data.followId },
        fromUser: data.fromUser,
        createdAt: data.createdAt,
      },
      ...prev,
    ]);
    setNotiCount((prev) => prev + 1);
    if (showNotifications) setNotificationKey(Date.now());
  }

  if (data.type === "follow-accepted") {
    setNotifications((prev) => [
      {
        type: "follow_accept",
        notiId: Date.now(),
        msg: data.message,
        fromUser: data.fromUser,
        createdAt: data.createdAt,
      },
      ...prev,
    ]);
    setNotiCount((prev) => prev + 1);
    if (showNotifications) setNotificationKey(Date.now());
  }

  if (data.type === "follow-rejected") {
    setNotifications((prev) => [
      {
        type: "follow_reject",
        notiId: Date.now(),
        msg: data.message,
        fromUser: data.fromUser,
        createdAt: data.createdAt,
      },
      ...prev,
    ]);
    setNotiCount((prev) => prev + 1);
    if (showNotifications) setNotificationKey(Date.now());
  }
};


    socket.onclose = () => {};
    return () => socket.close();
  }, [selectedPost?.postId, showNotifications]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3003/user/info", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserInfo(data.user);
          fetch(`http://localhost:3003/user/recommend/${data.user.userId}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                setRecommendedUsers(data.users);
              }
            });
        }
      });
  }, []);
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: darkMode ? "#000" : "#f9f9f9",
        color: darkMode ? "#fff" : "#000",
        overflowX: "hidden",
        width: "100vw",
      }}
    >
      <Sidebar
        onUploadClick={() => setUploadOpen(true)}
        onNotiClick={() => {
          setShowNotifications(true);
          setNotiCount(0);
        }}
        unreadCount={unreadCount}
        notiCount={notiCount}
      />
      <NotificationPanel
        key={notificationKey} // 👈 이 줄만 추가!
        open={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          refreshUnreadCount();
        }}
        onNotiClick={handleNotiClick}
        refreshUnreadCount={refreshUnreadCount}
        notifications={notifications}
        onFollowAction={(updatedNoti) => {
          if (!updatedNoti?.notiId) {
            console.warn(
              "onFollowAction: 잘못된 알림 객체 전달됨",
              updatedNoti
            );
            return;
          }

          setNotifications((prev) =>
            prev.map((n) =>
              n.notiId === updatedNoti.notiId ? { ...n, ...updatedNoti } : n
            )
          );
        }}
      />

      <BottomNav onUploadClick={() => setUploadOpen(true)} />
      <Box
        sx={{
          flex: 1,
          py: 3,
          px: { xs: 2, sm: 12 },
          pl: { sm: "320px" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          gap: 3,
          width: "100%",
          maxWidth: "1400px",
          marginX: "auto",
          boxSizing: "border-box",
        }}
      >
        {/* 피드 영역 */}
        <Box
          sx={{
            maxWidth: 700,
            width: "100%",
            marginX: "auto",
            flexShrink: 1,
            minWidth: 0,
          }}
        >
          <Box sx={{ width: "100%", overflow: "hidden", mb: 2 }}>
            <SwiperComponent
              style={{ backgroundColor: darkMode ? "#000" : "#f9f9f9" }}
              spaceBetween={12}
              breakpoints={{
                0: { slidesPerView: 4 }, // 모바일: 4개
                600: { slidesPerView: 5 }, // 태블릿: 5개
                900: { slidesPerView: 6 }, // 작은 데스크탑: 6개
                1200: { slidesPerView: 8 },
              }}
            >
              {[...Array(12)].map((_, i) => (
                <SwiperSlide key={i}>
                  <Box sx={{ textAlign: "center" }}>
                    <Avatar
                      src={`https://i.pravatar.cc/150?img=${i + 1}`}
                      sx={{
                        width: 56,
                        height: 56,
                        border: "2px solid #d6249f",
                        mx: "auto",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: darkMode ? "#ccc" : "#333" }}
                    >
                      user{i + 1}
                    </Typography>
                  </Box>
                </SwiperSlide>
              ))}
            </SwiperComponent>
          </Box>

          <Divider sx={{ borderColor: darkMode ? "#333" : "#ccc", my: 2 }} />

          {posts.map((post) => (
            <Card
              key={post.postId}
              id={`post-${post.postId}`}
              sx={{
                my: 4,
                bgcolor: darkMode ? "#111" : "#fff",
                color: darkMode ? "#fff" : "#000",
              }}
            >
              <CardHeader
                avatar={
                  <Avatar
                    src={
                      post.profileImg
                        ? "http://localhost:3003" + post.profileImg
                        : "/default.png"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${post.userId}`);
                    }}
                    sx={{ cursor: "pointer" }}
                  />
                }
                title={
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${post.userId}`);
                    }}
                    sx={{ cursor: "pointer" }}
                  >
                    {post.name}
                    {post.nick && (
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: darkMode ? "#aaa" : "#888", ml: 1 }}
                      >
                        @{post.nick}
                      </Typography>
                    )}
                  </Typography>
                }
                subheader={new Date(post.createdAt).toLocaleDateString()}
                subheaderTypographyProps={{ color: darkMode ? "#bbb" : "#777" }}
              />
              <Box
                sx={{ position: "relative", width: "100%", paddingTop: "100%" }}
              >
                <SwiperComponent
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  modules={[Pagination, Navigation]}
                  pagination={{ clickable: true }}
                  navigation={true}
                  loop={post.images.length > 1}
                >
                  {post.images.map((media, i) => (
                    <SwiperSlide key={i}>
                      {media.type === "video" ? (
                        <video
                          src={`http://localhost:3003${media.url}`}
                          controls
                          loop
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "4px",
                            backgroundColor: "#000",
                          }}
                        />
                      ) : (
                        <img
                          src={`http://localhost:3003${media.url}`}
                          alt={`미디어 ${i + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      )}
                    </SwiperSlide>
                  ))}
                </SwiperComponent>
              </Box>

              <CardContent>
                <Box sx={{ display: "flex", gap: 1.5, mb: 0.5 }}>
                  <IconButton
                    onClick={() => toggleLike(post.postId, post.liked)}
                  >
                    {post.liked ? (
                      <FavoriteIcon sx={{ color: "red" }} />
                    ) : (
                      <FavoriteBorderIcon
                        sx={{ color: darkMode ? "#fff" : "#000" }}
                      />
                    )}
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedPost(post);
                      setDetailOpen(true);
                    }}
                  >
                    <ChatBubbleOutlineIcon
                      sx={{ color: darkMode ? "#fff" : "#000" }}
                    />
                  </IconButton>
                  <IconButton>
                    <SendIcon sx={{ color: darkMode ? "#fff" : "#000" }} />
                  </IconButton>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: darkMode ? "#aaa" : "#555" }}
                >
                  좋아요 {post.likeCount}개
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  <b>{post.nick}</b>{" "}
                  {expandedPosts[post.postId] || post.content.length <= 100
                    ? post.content
                    : post.content.slice(0, 100) + "... "}
                  {post.content.length > 100 && !expandedPosts[post.postId] && (
                    <Button
                      onClick={() =>
                        setExpandedPosts((prev) => ({
                          ...prev,
                          [post.postId]: true,
                        }))
                      }
                      size="small"
                      sx={{
                        color: darkMode ? "#aaa" : "#666",
                        textTransform: "none",
                        pl: 0,
                      }}
                    >
                      더 보기
                    </Button>
                  )}
                </Typography>
                {post.comments?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: darkMode ? "#aaa" : "#666" }}
                    >
                      <b>{post.comments[0].nick}</b> {post.comments[0].content}
                    </Typography>
                    {post.comments.length > 1 && (
                      <Button
                        size="small"
                        sx={{
                          color: darkMode ? "#888" : "#666",
                          mt: 0.5,
                          ml: -1,
                        }}
                        onClick={() => {
                          setSelectedPost(post);
                          setDetailOpen(true);
                        }}
                      >
                        댓글 {post.comments.length}개 모두 보기
                      </Button>
                    )}
                  </Box>
                )}
                {isWriting[post.postId] ? (
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      autoFocus
                      placeholder="댓글 달기..."
                      value={commentInputs[post.postId] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.postId]: e.target.value,
                        }))
                      }
                      onBlur={() =>
                        setIsWriting((prev) => ({
                          ...prev,
                          [post.postId]: false,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCommentSubmit(post.postId);
                        }
                      }}
                      sx={{
                        bgcolor: darkMode ? "#222" : "#eee",
                        input: { color: darkMode ? "#fff" : "#000" },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleCommentSubmit(post.postId)}
                    >
                      게시
                    </Button>
                  </Box>
                ) : (
                  <Typography
                    sx={{
                      color: darkMode ? "#888" : "#555",
                      mt: 1,
                      cursor: "text",
                    }}
                    onClick={() =>
                      setIsWriting((prev) => ({ ...prev, [post.postId]: true }))
                    }
                  >
                    댓글 달기...
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* 추천 사용자 영역 */}
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            width: 320,
            ml: 4,
            bgcolor: darkMode ? "#000" : "#f9f9f9",
            color: darkMode ? "#fff" : "#000",
            flexShrink: 0,
            wordBreak: "keep-all",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              src="/my-profile.png"
              sx={{ width: 48, height: 48, mr: 2 }}
            />
            <Box>
              <Typography fontWeight="bold">재원</Typography>
              <Typography
                variant="body2"
                sx={{ color: darkMode ? "#888" : "#555" }}
              >
                wodnjs__p
              </Typography>
            </Box>
            <Button size="small" sx={{ marginLeft: "auto", color: "#1e88e5" }}>
              전환
            </Button>
          </Box>
          <Typography
            variant="body2"
            sx={{ color: darkMode ? "#888" : "#555", mb: 1 }}
          >
            회원님을 위한 추천
          </Typography>

          {recommendedUsers.map((user) => (
            <Box
              key={user.userId}
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <Avatar
                src={
                  user.profileImg
                    ? `http://localhost:3003${user.profileImg}`
                    : "/default.png"
                }
                sx={{ width: 32, height: 32, mr: 1 }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: darkMode ? "#aaa" : "#888" }}
                >
                  @{user.nick}
                </Typography>
              </Box>
              <FollowButton
                myUserId={userInfo.userId}
                targetUserId={user.userId}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* 모달 */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)}>
        <Box
          sx={{
            width: 600,
            height: 600,
            maxWidth: "95%",
            bgcolor: darkMode ? "#111" : "#fff",
            color: darkMode ? "#fff" : "#000",
            p: 3,
            borderRadius: 2,
            mx: "auto",
            mt: "10vh",
            boxShadow: 24,
          }}
        >
          <FeedUploadModal
            onClose={() => setUploadOpen(false)}
            onSuccess={() => {
              setUploadOpen(false);
              fetchPosts();
            }}
          />
        </Box>
      </Modal>

      <FeedDetailModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          fetchPosts();
        }}
        feed={selectedPost}
        onLikeUpdate={(updatedFeed) => {
          setPosts((prev) =>
            prev.map((p) => (p.postId === updatedFeed.postId ? updatedFeed : p))
          );
          setSelectedPost(updatedFeed);
        }}
        onDelete={(postId) => {
          setPosts((prev) => prev.filter((p) => p.postId !== postId));
          setDetailOpen(false);
          setSelectedPost(null);
        }}
      />
    </Box>
  );
}

export default Main;
