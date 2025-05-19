import React, { useEffect, useState, useCallback } from "react";

function FollowButton({ myUserId, targetUserId }) {
  const [status, setStatus] = useState(null);

  const fetchStatus = useCallback(() => {
    fetch(`http://localhost:3003/follows/status/${myUserId}/${targetUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus(data.follow?.status || null);
        }
      });
  }, [myUserId, targetUserId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]); // ✅ 경고 제거됨

  const handleFollow = () => {
    fetch("http://localhost:3003/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUser: myUserId, toUser: targetUserId }),
    }).then(fetchStatus);
  };

  const handleUnfollow = () => {
    fetch(`http://localhost:3003/follows/${targetUserId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUser: myUserId }),
    }).then(fetchStatus);
  };

  if (myUserId === targetUserId) return null;

  return (
    <button
      onClick={status === "accepted" || status === "pending" ? handleUnfollow : handleFollow}
      style={{
        background: "none",
        border: "none",
        color: status === "accepted" ? "#999" : "#1e88e5",
        cursor: "pointer",
      }}
    >
      {status === "accepted"
        ? "팔로잉"
        : status === "pending"
        ? "요청됨"
        : "팔로우"}
    </button>
  );
}

export default FollowButton;
