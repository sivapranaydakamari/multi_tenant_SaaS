// import { useState } from "react";
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   IconButton,
//   Drawer,
//   List,
//   ListItemButton,
//   ListItemText,
//   Box,
//   Avatar,
//   Menu,
//   MenuItem
// } from "@mui/material";
// import MenuIcon from "@mui/icons-material/Menu";

// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const Navbar = () => {
//   const { user, tenant, logout } = useAuth();
//   const navigate = useNavigate();

//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [profileMenu, setProfileMenu] = useState(null);

//   if (!user) return null; // hide navbar on login/register pages

//   const navItems = [
//     { label: "Dashboard", path: "/dashboard" },
//     { label: "Projects", path: "/projects" },
//   ];

//   if (user.role === "tenant_admin") {
//     navItems.push({ label: "Users", path: "/users" });
//   }

//   if (user.role === "super_admin") {
//     navItems.push({ label: "Tenants", path: "/tenants" }); // OPTIONAL: future
//   }

//   const openProfile = (event) => {
//     setProfileMenu(event.currentTarget);
//   };

//   const closeProfile = () => {
//     setProfileMenu(null);
//   };

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <>
//       <AppBar position="sticky" color="primary">
//         <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

//           {/* Left Section */}
//           <Typography
//             variant="h6"
//             sx={{ cursor: "pointer" }}
//             onClick={() => navigate("/dashboard")}
//           >
//             {tenant?.name || "SaaS App"}
//           </Typography>

//           {/* Desktop Nav */}
//           <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
//             {navItems.map((item) => (
//               <Button
//                 key={item.label}
//                 color="inherit"
//                 component={Link}
//                 to={item.path}
//               >
//                 {item.label}
//               </Button>
//             ))}

//             <IconButton color="inherit" onClick={openProfile}>
//               <Avatar>
//                 {user.fullName?.charAt(0)?.toUpperCase()}
//               </Avatar>
//             </IconButton>

//             <Menu
//               anchorEl={profileMenu}
//               open={Boolean(profileMenu)}
//               onClose={closeProfile}
//             >
//               <MenuItem disabled>
//                 {user.fullName} ({user.role})
//               </MenuItem>

//               <MenuItem onClick={handleLogout}>
//                 Logout
//               </MenuItem>
//             </Menu>
//           </Box>

//           {/* Mobile Menu */}
//           <Box sx={{ display: { xs: "flex", md: "none" } }}>
//             <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
//               <MenuIcon />
//             </IconButton>
//           </Box>

//         </Toolbar>
//       </AppBar>

//       {/* Drawer for Mobile */}
//       <Drawer
//         anchor="left"
//         open={drawerOpen}
//         onClose={() => setDrawerOpen(false)}
//       >
//         <Box sx={{ width: 250 }}>

//           <Typography
//             variant="h6"
//             sx={{ p: 2, textAlign: "center" }}
//           >
//             {tenant?.name || "SaaS App"}
//           </Typography>

//           <List>
//             {navItems.map((item) => (
//               <ListItemButton
//                 key={item.label}
//                 onClick={() => {
//                   navigate(item.path);
//                   setDrawerOpen(false);
//                 }}
//               >
//                 <ListItemText primary={item.label} />
//               </ListItemButton>
//             ))}

//             <ListItemButton onClick={handleLogout}>
//               <ListItemText primary="Logout" />
//             </ListItemButton>
//           </List>
//         </Box>
//       </Drawer>
//     </>
//   );
// };

// export default Navbar;

import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, tenant, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(null);

  if (!user) return null;

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Projects", path: "/projects" },
  ];

  if (user.role === "tenant_admin") {
    navItems.push({ label: "Users", path: "/users" });
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#fff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1200,
            mx: "auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* BRAND */}
          <Box
            onClick={() => navigate("/dashboard")}
            sx={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              mr: 6, // 🔥 controls nav closeness
            }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif",
              }}
            >
              {tenant?.name ?? "WorkBoard"}
            </Typography>

            <Typography
              sx={{
                fontSize: 11,
                color: "text.secondary",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif",
              }}
            >
              Workspace
            </Typography>
          </Box>

          {/* NAVIGATION (DESKTOP) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
            }}
          >
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.path);

              return (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={{
                    textTransform: "none",
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    color: "#000",
                    px: 2,
                    borderRadius: 2,
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif",
                    bgcolor: active ? "#f3f4f6" : "transparent",
                    "&:hover": {
                      bgcolor: "#f3f4f6",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* SPACER */}
          <Box sx={{ flexGrow: 1 }} />

          {/* PROFILE */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* NAME (DESKTOP) */}
            <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "right" }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif",
                }}
              >
                {user.fullName}
              </Typography>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "text.secondary",
                  textTransform: "capitalize",
                }}
              >
                {user.role.replace("_", " ")}
              </Typography>
            </Box>

            <IconButton onClick={(e) => setProfileMenu(e.currentTarget)}>
              <Avatar
                sx={{
                  bgcolor: "#000",
                  color: "#fff",
                  width: 36,
                  height: 36,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {user.fullName?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>

            {/* MOBILE MENU */}
            <IconButton
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* PROFILE MENU */}
      <Menu
        anchorEl={profileMenu}
        open={Boolean(profileMenu)}
        onClose={() => setProfileMenu(null)}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            border: "1px solid #eee",
            minWidth: 200,
          },
        }}
      >
        <MenuItem disabled>
          <Box>
            <Typography fontWeight={600}>{user.fullName}</Typography>
            <Typography fontSize={12} color="text.secondary">
              {user.role.replace("_", " ")}
            </Typography>
          </Box>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 260 }}>
          <Box sx={{ p: 2 }}>
            <Typography fontWeight={800}>
              {tenant?.name || "WorkBoard"}
            </Typography>
            <Typography fontSize={12} color="text.secondary">
              Workspace
            </Typography>
          </Box>

          <Divider />

          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.label}
                selected={location.pathname.startsWith(item.path)}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}

            <Divider sx={{ my: 1 }} />

            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
