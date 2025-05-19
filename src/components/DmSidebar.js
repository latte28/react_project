import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CircleIcon from "@mui/icons-material/Circle";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "./DarkModeContext";
import { jwtDecode } from "jwt-decode";

function DmSidebar({ onNewMessageClick }) {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { darkMode } = useDarkMode();
  const currentUserId = jwtDecode(token).userId;

  const fetchRooms = useCallback(() => {
    fetch("http://localhost:3003/dm/conversations", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const sortedRooms = (data.rooms || []).sort(
            (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
          );
          setRooms(sortedRooms);
        }
      });
  }, [token]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:3003?token=${token}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "dm") {
        const { roomId, content, createdAt, senderId } = data;

        setRooms((prevRooms) => {
          let updated = false;

          const newRooms = prevRooms.map((room) => {
            if (String(room.roomId) === String(roomId)) {
              updated = true;
              return {
                ...room,
                lastMessage: content,
                updatedAt: createdAt || new Date().toISOString(),
                hasUnread: senderId !== currentUserId,
              };
            }
            return room;
          });

          if (!updated) {
            fetchRooms();
            return prevRooms;
          }

          return [...newRooms].sort(
            (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
          );
        });
      }
    };

    return () => {
      socket.close();
    };
  }, [token, fetchRooms, currentUserId]);

  const bgMain = darkMode ? "#000" : "#fff";
  const textPrimary = darkMode ? "#fff" : "#000";
  const textSecondary = darkMode ? "#ccc" : "#555";
  const hoverBg = darkMode ? "#111" : "#f5f5f5";
  const borderColor = darkMode ? "#222" : "#ddd";

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: bgMain,
        color: textPrimary,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          메시지
        </Typography>
        <IconButton onClick={onNewMessageClick} size="small">
          <EditIcon sx={{ color: textPrimary }} />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor }} />

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <List disablePadding>
          {rooms.map((room) => (
            <ListItem
              key={room.roomId}
              button
              onClick={() =>
                navigate(`/dm/${room.roomId}`, {
                  state: { toUserId: room.targetId },
                })
              }
              sx={{ px: 2, py: 1.5, "&:hover": { bgcolor: hoverBg } }}
            >
              <ListItemAvatar>
                <Avatar src={room.targetProfileImg || "/default.png"} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      color: textPrimary,
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {room.targetNick}
                  </Typography>
                }
                secondary={
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: textSecondary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {room.lastMessage || " "}
                  </Typography>
                }
              />
              {room.hasUnread && (
                <CircleIcon sx={{ color: "#3797f0", fontSize: 10, ml: 1 }} />
              )}
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}

export default DmSidebar;
