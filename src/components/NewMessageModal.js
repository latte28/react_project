import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Radio,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function NewMessageModal({ open, onClose }) {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const token = localStorage.getItem("token");
    setLoading(true);

    fetch(`http://localhost:3003/user/search?keyword=${keyword}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUsers(data.users);
      })
      .finally(() => setLoading(false));
  }, [keyword, open]);

  const handleChatStart = async () => {
    if (!selectedId) return;
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:3003/dm/room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ toUserId: selectedId }),
    });

    const data = await res.json();
    if (data.success) {
      onClose();
      navigate(`/dm/${data.roomId}`);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      className="force-light"
      PaperProps={{
        sx: {
          bgcolor: "#fff !important", // ✅ 강제 흰 배경
          color: "#000 !important",   // ✅ 강제 검정 텍스트
        },
      }}
    >
      <DialogTitle sx={{ color: "#000" }}>새로운 메시지</DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <TextField
          fullWidth
          placeholder="받는 사람 검색..."
          variant="standard"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          autoFocus
          sx={{
            mb: 2,
            input: { color: "#000" },
            "& .MuiInput-underline:before": { borderBottomColor: "#ccc" },
            "& .MuiInput-underline:after": { borderBottomColor: "#3797f0" },
          }}
        />

        {loading ? (
          <CircularProgress size={24} sx={{ mt: 2 }} />
        ) : (
          <List dense>
            {users.map((user) => (
              <ListItem
                key={user.userId}
                button
                onClick={() => setSelectedId(user.userId)}
                sx={{
                  px: 1.5,
                  py: 1,
                  bgcolor: selectedId === user.userId ? "#f0f0f0" : "transparent",
                  "&:hover": { bgcolor: "#f5f5f5" },
                  borderRadius: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar src={user.profileImg || "/default.png"} />
                </ListItemAvatar>
                <ListItemText
                  primary={user.nick}
                  primaryTypographyProps={{
                    sx: {
                      color: "#000",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                  }}
                />
                <Radio
                  checked={selectedId === user.userId}
                  sx={{
                    color: "#000",
                    "&.Mui-checked": { color: "#3797f0" },
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="contained"
          fullWidth
          disabled={!selectedId}
          onClick={handleChatStart}
          sx={{
            backgroundColor: "#3797f0",
            "&:hover": { backgroundColor: "#318ae0" },
          }}
        >
          채팅
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewMessageModal;
