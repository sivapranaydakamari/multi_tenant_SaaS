import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  Divider,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import UserModal from "../components/UserModal";

const Users = () => {
  const { tenant, user, loading } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // ✅ SAFE fetch
  const fetchUsers = async () => {
    if (!tenant?.id) return;

    try {
      const res = await API.get(`/tenants/${tenant.id}/users`);
      let list = res.data.data.users || [];

      if (search) {
        const term = search.toLowerCase();
        list = list.filter(
          (u) =>
            u.fullName.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term)
        );
      }

      if (roleFilter) {
        list = list.filter((u) => u.role === roleFilter);
      }

      setUsers(list);
    } catch (err) {
      console.error("Fetch users failed", err);
    }
  };

  // ✅ Load users once tenant is ready
  useEffect(() => {
    if (tenant?.id) fetchUsers();
  }, [tenant, roleFilter]);

  // ✅ Guard rendering
  if (loading || !tenant) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading users...</Typography>
      </Box>
    );
  }

  const openAddModal = () => {
    setEditUser(null);
    setOpenModal(true);
  };

  const openEditModal = (u) => {
    setEditUser(u);
    setOpenModal(true);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/users/${deleteId}`);
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      console.error("Delete user failed", err);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: "auto" }}>
      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Users
        </Typography>
        <Typography color="text.secondary">
          Manage members in your workspace
        </Typography>
        <Divider sx={{ mt: 3 }} />
      </Box>

      {/* ACTION BAR */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search name or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchUsers();
            }}
            sx={{ minWidth: 260 }}
          />

          <TextField
            select
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="tenant_admin">Tenant Admin</MenuItem>
          </TextField>
        </Box>

        {user.role === "tenant_admin" && (
          <Button
            onClick={openAddModal}
            sx={{
              bgcolor: "#000",
              color: "#fff",
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "#111" },
            }}
          >
            + Add User
          </Button>
        )}
      </Box>

      {/* USER GRID */}
      <Grid container spacing={3}>
        {users.length === 0 && (
          <Typography sx={{ mt: 2 }}>No users found</Typography>
        )}

        {users.map((u) => (
          <Grid item xs={12} md={4} key={u.id}>
            <Card
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid #eee",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 14px 32px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Typography fontWeight={600} variant="h6">
                {u.fullName}
              </Typography>

              <Typography fontSize={14} color="text.secondary">
                {u.email}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Chip label={u.role.replace("_", " ")} variant="outlined" />
                <Chip
                  label={u.isActive ? "Active" : "Inactive"}
                  color={u.isActive ? "success" : "default"}
                  variant="outlined"
                />
              </Box>

              {user.role === "tenant_admin" && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                    mt: 3,
                  }}
                >
                  <IconButton onClick={() => openEditModal(u)}>
                    <Edit />
                  </IconButton>

                  {u.id !== user.id && (
                    <IconButton
                      color="error"
                      onClick={() => setDeleteId(u.id)}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* USER MODAL */}
      {openModal && (
        <UserModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          userData={editUser}
          tenantId={tenant.id}
          refresh={fetchUsers}
        />
      )}

      {/* DELETE CONFIRM */}
      <Dialog open={!!deleteId}>
        <DialogTitle>Delete this user?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
