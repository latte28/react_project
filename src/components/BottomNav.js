import React, { useState } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "./DarkModeContext";

function BottomNav({ onUploadClick }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { toggleDarkMode } = useDarkMode();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleDarkModeToggle = () => {
    toggleDarkMode();
    handleClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    handleClose();
  };

  return (
    <>
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: "flex", sm: "none" },
          zIndex: 100,
          backgroundColor: "#000",
          color: "#fff",
          borderTop: "1px solid #fff",
        }}
        elevation={3}
      >
        <BottomNavigation showLabels sx={{ backgroundColor: "#000", width: "100%" }}>
          <BottomNavigationAction
            label="홈"
            icon={<HomeIcon sx={{ color: "#fff" }} />}
            onClick={() => navigate("/")}
          />
          <BottomNavigationAction
            label="검색"
            icon={<SearchIcon sx={{ color: "#fff" }} />}
          />
          <BottomNavigationAction
            label="업로드"
            icon={<AddBoxIcon sx={{ color: "#fff" }} />}
            onClick={onUploadClick}
          />
          <BottomNavigationAction
            label="프로필"
            icon={<AccountCircleIcon sx={{ color: "#fff" }} />}
            onClick={() => navigate("/profile")}
          />
          <BottomNavigationAction
            label="더 보기"
            icon={<MenuIcon sx={{ color: "#fff" }} />}
            onClick={handleMenuClick}
          />
        </BottomNavigation>
      </Paper>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleDarkModeToggle}>
          <ListItemIcon>
            <DarkModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="모드 전환" />
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="로그아웃" />
        </MenuItem>
      </Menu>
    </>
  );
}

export default BottomNav;
