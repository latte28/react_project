import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Avatar, Typography, Divider, Modal } from "@mui/material";
import Sidebar from "./Sidebar";
import EditProfileModal from "./EditProfileModal";
import FeedDetailModal from "./FeedDetailModal";
import FeedUploadModal from "./FeedUploadModal";
import BottomNav from "./BottomNav";

function ProfilePage() {
  const { userId } = useParams();
  const [resolvedUserId, setResolvedUserId] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [feeds, setFeeds] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const loggedInUserId = decoded.userId;

      if (!userId || userId === loggedInUserId) {
        setResolvedUserId(loggedInUserId);
      } else {
        setResolvedUserId(userId);
      }
    } catch (err) {
      console.error("토큰 파싱 실패:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (!resolvedUserId) return;

    fetch(`http://localhost:3003/profile/${resolvedUserId}/info`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUserInfo(data.user);
      });

    fetch(`http://localhost:3003/profile/${resolvedUserId}/feeds`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setFeeds(data.feeds);
      });

    fetch(`http://localhost:3003/user/${resolvedUserId}/follow-stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFollowStats({
            followers: data.followers,
            following: data.following,
          });
        }
      });
  }, [resolvedUserId, editOpen, uploadOpen]);

  const handleDeleteFeed = (postId) => {
    setFeeds((prev) => prev.filter((f) => f.postId !== postId));
    setSelectedFeed(null);
  };

  return (
    <Box className="profile-page" sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar onUploadClick={() => setUploadOpen(true)} />
      <BottomNav onUploadClick={() => setUploadOpen(true)} />
      <Box
        sx={{
          flex: 1,
          ml: { sm: "240px" },
          px: 4,
          py: 5,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "900px" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 5 }}>
            <Avatar
              src={
                userInfo.profileImg
                  ? "http://localhost:3003" + userInfo.profileImg
                  : "/default.png"
              }
              sx={{ width: 150, height: 150, mr: 8 }}
            />
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: "1.75rem", fontWeight: "500" }}>
                  {userInfo.nick}
                </Typography>
                <Box
                  className="profile-edit-btn"
                  sx={{ px: 2, py: 0.5, borderRadius: 1, fontSize: "0.875rem", cursor: "pointer" }}
                  onClick={() => setEditOpen(true)}
                >
                  프로필 편집
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 3, mb: 1 }}>
                <Typography>게시물 {feeds.length}</Typography>
                <Typography>팔로워 {followStats.followers}</Typography>
                <Typography>팔로우 {followStats.following}</Typography>
              </Box>
              <Typography
                sx={{
                  fontWeight: "normal",
                  fontStyle: userInfo.bio?.trim() ? "normal" : "italic",
                  whiteSpace: "pre-line",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {userInfo.bio || "아직 소개글이 없습니다."}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "#444", mb: 3 }} />

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {feeds.map((feed) => (
              <Box
                key={feed.postId}
                sx={{
                  width: "calc(33.333% - 12px)",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                  cursor: "pointer",
                  "&:hover img, &:hover video": { transform: "scale(1.05)" },
                }}
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    alert("로그인이 필요합니다.");
                    return;
                  }

                  const res = await fetch(`http://localhost:3003/posts/${feed.postId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  if (res.status === 401) {
                    alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
                    localStorage.removeItem("token");
                    return;
                  }

                  const data = await res.json();
                  if (data.success) {
                    setSelectedFeed(data.feed);
                  }
                }}
              >
                {typeof feed.thumbnailUrl === "string" && feed.thumbnailUrl.endsWith(".mp4") ? (
                  <video
                    src={"http://localhost:3003" + feed.thumbnailUrl}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.3s ease",
                    }}
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={
                      typeof feed.thumbnailUrl === "string"
                        ? "http://localhost:3003" + feed.thumbnailUrl
                        : "/default.png"
                    }
                    alt="thumbnail"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.3s ease",
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box className="profile-modal">
          <EditProfileModal
            onClose={() => setEditOpen(false)}
            onSuccess={() => setEditOpen(false)}
          />
        </Box>
      </Modal>

      <Modal open={!!selectedFeed} onClose={() => setSelectedFeed(null)}>
        <Box className="feed-detail-modal">
          {selectedFeed && (
            <FeedDetailModal
              open={!!selectedFeed}
              feed={selectedFeed}
              onClose={() => setSelectedFeed(null)}
              onDelete={handleDeleteFeed}
              onLikeUpdate={async (updatedFeed) => {
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:3003/posts/${updatedFeed.postId}`, {
                  headers: { Authorization: "Bearer " + token },
                });
                const data = await res.json();

                if (data.success) {
                  const first = data.feed.images?.[0] || {};
                  const thumbnailUrl = first?.url || "/default.png";
                  const isVideo = first?.type === "video";

                  setFeeds((prev) =>
                    prev.map((f) =>
                      f.postId === data.feed.postId
                        ? { ...f, ...data.feed, thumbnailUrl, isVideo }
                        : f
                    )
                  );

                  setSelectedFeed((prev) => ({
                    ...prev,
                    ...data.feed,
                    thumbnailUrl,
                    isVideo,
                  }));
                }
              }}
            />
          )}
        </Box>
      </Modal>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)}>
        <Box className="upload-modal">
          <FeedUploadModal
            onClose={() => setUploadOpen(false)}
            onSuccess={() => {
              setUploadOpen(false);
            }}
          />
        </Box>
      </Modal>
    </Box>
  );
}

export default ProfilePage;
