import React, { useEffect, useState } from "react";
import { Box, Avatar, Typography, Button } from "@mui/material";

function FollowRequests({ userId, refreshKey, onUpdateNotifications }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3003/follow/received/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRequests(data.requests);
      });
  }, [userId, refreshKey]);

  const handleAccept = (followId) => {
    fetch(`http://localhost:3003/follow/${followId}/accept`, {
      method: "PUT",
    }).then(() => {
      setRequests((prev) => prev.filter((req) => req.followId !== followId));
      if (typeof onUpdateNotifications === "function") {
        onUpdateNotifications();
      }
    });
  };

  const handleReject = (followId) => {
    fetch(`http://localhost:3003/follow/${followId}/reject`, {
      method: "PUT",
    }).then(() => {
      setRequests((prev) => prev.filter((req) => req.followId !== followId));
      if (typeof onUpdateNotifications === "function") {
        onUpdateNotifications();
      }
    });
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: "#888" }}>
        받은 팔로우 요청
      </Typography>
      {requests.length === 0 ? (
        <Typography variant="body2" sx={{ color: "#aaa" }}>
          받은 요청이 없습니다.
        </Typography>
      ) : (
        requests.map((req) => (
          <Box
            key={req.followId}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
              p: 1,
              borderRadius: 1,
              bgcolor: "#f5f5f5",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src={
                  req.profileImg
                    ? `http://localhost:3003${req.profileImg}`
                    : "/default.png"
                }
                sx={{ width: 32, height: 32 }}
              />
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {req.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  @{req.nick}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => handleAccept(req.followId)}
              >
                수락
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={() => handleReject(req.followId)}
              >
                거절
              </Button>
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
}

export default FollowRequests;
