import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const TaskModal = ({ open, onClose, task, projectId, refresh }) => {
  const [users, setUsers] = useState([]);
  const { tenant } = useAuth();

  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "medium",
    assignedTo: task?.assignedTo?.id ?? "",
    dueDate: task?.dueDate || ""
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        if (!tenant?.id) return;

        const res = await API.get(`/tenants/${tenant.id}/users`);

        setUsers(
          res.data.data.users.map(u => ({
            id: u.id,
            fullName: u.full_name,
            role: u.role
          }))
        );
      } catch (err) {
        console.error("User load error", err);
      }
    };

    if (open && tenant?.id) loadUsers();
  }, [open, tenant]);



  const submit = async () => {
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null
      };

      if (task) {
        await API.put(`/projects/${projectId}/tasks/${task.id}`, payload);
      } else {
        await API.post(`/projects/${projectId}/tasks`, payload);
      }

      refresh();
      onClose();
    } catch (err) {
      console.log("Task create/edit error", err);
    }
  };



  return (
    <Dialog open={open} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {task ? "Edit Task" : "Create New Task"}
      </DialogTitle>

      <DialogContent>
        {/* BASIC INFO */}
        <Box sx={{ mt: 1 }}>
          <Typography fontWeight={600} mb={1}>
            Task Details
          </Typography>

          <TextField
            fullWidth
            label="Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <TextField
            sx={{ mt: 2 }}
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* SETTINGS */}
        <Typography fontWeight={600} mb={1}>
          Settings
        </Typography>

        <TextField
          fullWidth
          select
          label="Assign To"
          value={form.assignedTo}
          onChange={(e) =>
            setForm({ ...form, assignedTo: e.target.value })
          }
        >
          <MenuItem value="">
            <em>Unassigned</em>
          </MenuItem>

          {users.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.fullName} ({u.role})
            </MenuItem>
          ))}
        </TextField>



        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            select
            label="Priority"
            value={form.priority}
            onChange={(e) =>
              setForm({ ...form, priority: e.target.value })
            }
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </TextField>

          <TextField
            fullWidth
            type="date"
            label="Due Date"
            InputLabelProps={{ shrink: true }}
            value={form.dueDate}
            onChange={(e) =>
              setForm({ ...form, dueDate: e.target.value })
            }
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx = {{color: "#000"}}>Cancel</Button>
        <Button
          variant="contained"
          sx={{ px: 3, bgcolor: "#000", "&:hover": { bgcolor: "#111" } }}
          onClick={submit}
        >
          {task ? "Update Task" : "Create Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal;
