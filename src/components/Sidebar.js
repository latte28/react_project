import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  Badge,
} from "@mui/material";
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Send as SendIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AddBox as AddBoxIcon,
  AccountCircle as AccountCircleIcon,
  DarkMode as DarkModeIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "./DarkModeContext";

// ✅ 수정: notiCount도 props로 받음
function Sidebar({ onUploadClick, onNotiClick, unreadCount, notiCount }) {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, resetDarkMode } = useDarkMode();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    resetDarkMode();
    navigate("/login");
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const menuItems = [
    { icon: <HomeIcon />, label: "홈", action: () => navigate("/") },
    { icon: <SearchIcon />, label: "검색" },

    // ✅ DM 알림 뱃지
    {
      icon: (
        <Badge
          badgeContent={unreadCount}
          color="error"
          invisible={unreadCount === 0}
        >
          <SendIcon />
        </Badge>
      ),
      label: "메시지",
      action: () => navigate("/dm"),
    },

    // ✅ 좋아요/댓글 알림 뱃지 (분리됨)
    {
      icon: (
        <Badge
          badgeContent={notiCount}
          color="error"
          invisible={notiCount === 0}
        >
          <FavoriteBorderIcon />
        </Badge>
      ),
      label: "알림",
      action: onNotiClick,
    },

    { icon: <AddBoxIcon />, label: "업로드", action: onUploadClick },
    {
      icon: <AccountCircleIcon />,
      label: "프로필",
      action: () => navigate("/profile"),
    },
  ];

  return (
    <Box
      sx={{
        width: 240,
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        bgcolor: darkMode ? "#000" : "#fff",
        color: darkMode ? "#fff" : "#000",
        borderRight: `1px solid ${darkMode ? "#333" : "#ccc"}`,
        display: { xs: "none", sm: "flex" },
        flexDirection: "column",
        alignItems: "start",
        pt: 3,
        px: 2,
        zIndex: 10,
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{ mt: 3.25, mb: 6, ml: 3.5 }}
      >
        Instagram
      </Typography>

      <List sx={{ width: "100%", mt: 1 }}>
        {menuItems.map((item, i) => (
          <ListItem
            key={i}
            button
            onClick={item.action}
            sx={{ gap: 1, py: 1.5, px: 1 }}
          >
            <ListItemIcon
              sx={{
                minWidth: "auto",
                color: darkMode ? "#fff" : "#000",
                cursor: "pointer",
                ml: 3.5,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                sx: {
                  fontSize: "0.875rem",
                  color: darkMode ? "#fff" : "#000",
                  cursor: "default",
                  ml: 1.5,
                },
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: "auto", width: "100%" }}>
        <Divider sx={{ borderColor: darkMode ? "#444" : "#ccc", mb: 1 }} />
        <ListItem button onClick={handleMenuOpen} sx={{ px: 1 }}>
          <ListItemIcon
            sx={{ minWidth: "auto", color: darkMode ? "#fff" : "#000" }}
          >
            <MenuIcon />
          </ListItemIcon>
          <ListItemText
            primary="더 보기"
            primaryTypographyProps={{
              sx: {
                fontSize: "0.875rem",
                color: darkMode ? "#fff" : "#000",
                cursor: "pointer",
              },
            }}
          />
        </ListItem>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{
            sx: {
              bgcolor: darkMode ? "#222" : "#f9f9f9",
              color: darkMode ? "#fff" : "#000",
              mt: 1,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              setTimeout(toggleDarkMode, 0);
            }}
          >
            <DarkModeIcon sx={{ mr: 1 }} />
            모드 전환
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              setTimeout(handleLogout, 0);
            }}
          >
            <LogoutIcon sx={{ mr: 1 }} />
            로그아웃
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}

export default Sidebar;
