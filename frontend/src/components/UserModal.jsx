import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  DialogActions,
  Button,
} from "@mui/material";
import API from "../api/axios";

const UserModal = ({ open, onClose, userData, tenantId, refresh }) => {
  const [form, setForm] = useState({
    email: userData?.email || "",
    fullName: userData?.fullName || "",
    password: "",
    role: userData?.role || "user",
    isActive: userData?.isActive ?? true,
  });

  const submit = async () => {
    try {
      if (userData) {
        await API.put(`/users/${userData.id}`, form);
      } else {
        await API.post(`/tenants/${tenantId}/users`, form);
      }

      refresh();
      onClose();
    } catch (err) {
      console.error("User add/edit failed", err);
    }
  };

  return (
    <Dialog open={open} fullWidth maxWidth="sm">
      <DialogTitle>{userData ? "Edit User" : "Add User"}</DialogTitle>

      <DialogContent>
        <TextField
          sx={{ mt: 2 }}
          fullWidth
          label="Email"
          value={form.email}
          disabled={!!userData}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <TextField
          sx={{ mt: 2 }}
          fullWidth
          label="Full Name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />

        {!userData && (
          <TextField
            sx={{ mt: 2 }}
            fullWidth
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        )}

        <TextField
          sx={{ mt: 2 }}
          select
          fullWidth
          label="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="tenant_admin">Tenant Admin</MenuItem>
        </TextField>

        {userData && (
          <FormControlLabel
            sx={{ mt: 2 }}
            control={
              <Checkbox
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
            }
            label="Active"
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx = {{color: "#000"}}>Cancel</Button>
        <Button
          variant="contained"
          sx={{ bgcolor: "#000", "&:hover": { bgcolor: "#111" } }}
          onClick={submit}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;
