// import { useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   TextField,
//   MenuItem,
//   DialogActions,
//   Button
// } from "@mui/material";
// import API from "../api/axios";

// const TaskModal = ({ open, onClose, task, projectId, refresh }) => {
//   const [form, setForm] = useState({
//     title: task?.title || "",
//     description: task?.description || "",
//     priority: task?.priority || "medium",
//     assignedTo: task?.assignedTo?.id || "",
//     dueDate: task?.dueDate || ""
//   });

//   const submit = async () => {
//     try {
//       if (task) {
//         await API.put(`/tasks/${task.id}`, form);
//       } else {
//         await API.post(`/projects/${projectId}/tasks`, form);
//       }
//       refresh();
//       onClose();
//     } catch (err) {
//       console.log("Task create/edit error", err);
//     }
//   };

//   return (
//     <Dialog open={open} fullWidth>
//       <DialogTitle>
//         {task ? "Edit Task" : "Create Task"}
//       </DialogTitle>

//       <DialogContent>
//         <TextField
//           sx={{ mt: 2 }}
//           fullWidth
//           label="Title"
//           value={form.title}
//           onChange={(e) => setForm({ ...form, title: e.target.value })}
//         />

//         <TextField
//           sx={{ mt: 2 }}
//           fullWidth
//           multiline
//           rows={3}
//           label="Description"
//           value={form.description}
//           onChange={(e) => setForm({ ...form, description: e.target.value })}
//         />

//         <TextField
//           sx={{ mt: 2 }}
//           select
//           fullWidth
//           label="Priority"
//           value={form.priority}
//           onChange={(e) => setForm({ ...form, priority: e.target.value })}
//         >
//           <MenuItem value="low">Low</MenuItem>
//           <MenuItem value="medium">Medium</MenuItem>
//           <MenuItem value="high">High</MenuItem>
//         </TextField>

//         <TextField
//           sx={{ mt: 2 }}
//           fullWidth
//           label="Due Date"
//           type="date"
//           InputLabelProps={{ shrink: true }}
//           value={form.dueDate}
//           onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
//         />
//       </DialogContent>

//       <DialogActions>
//         <Button onClick={onClose}>Cancel</Button>
//         <Button variant="contained" onClick={submit}>
//           Save
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default TaskModal;

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

const TaskModal = ({ open, onClose, task, projectId, refresh }) => {
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "medium",
    assignedTo: task?.assignedTo === "all"
      ? "all"
      : task?.assignedTo?.id || "all",
    dueDate: task?.dueDate || "",
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data.data.users);
      } catch (err) {
        console.log("User load error", err);
      }
    };
    loadUsers();
  }, []);

  const submit = async () => {
    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo === "all" ? null : form.assignedTo,
      };

      if (task) {
        await API.put(`/tasks/${task.id}`, payload);
      } else {
        await API.post(`/projects/${projectId}/tasks`, payload);
      }

      refresh();
      onClose();
    } catch (err) {
      console.log("Task create/edit error", err.response?.data || err);
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
          <MenuItem value="all">All Users</MenuItem>
          {users.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.fullName}
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
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          sx={{ px: 3 }}
          onClick={submit}
        >
          {task ? "Update Task" : "Create Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal;
