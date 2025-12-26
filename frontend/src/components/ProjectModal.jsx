import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  DialogActions,
  Button
} from "@mui/material";
import API from "../api/axios";

const ProjectModal = ({ open, onClose, project, refresh }) => {
  const [form, setForm] = useState({
    name: project?.name || "",
    description: project?.description || "",
    status: project?.status || "active"
  });

  const submit = async () => {
    try {
      if (project) {
        await API.put(`/projects/${project.id}`, form);
      } else {
        await API.post("/projects", form);
      }
      refresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Project creation failed");
    }

  };

  return (
    <Dialog open={open} fullWidth>
      <DialogTitle>
        {project ? "Edit Project" : "Create Project"}
      </DialogTitle>

      <DialogContent>

        <TextField
          fullWidth
          label="Project Name"
          value={form.name}
          sx={{ mt: 2 }}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <TextField
          fullWidth
          label="Description"
          sx={{ mt: 2 }}
          multiline
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <TextField
          fullWidth
          select
          label="Status"
          sx={{ mt: 2 }}
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="archived">Archived</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </TextField>

      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            color: "#000",
            borderColor: "#ddd",
            "&:hover": {
              bgcolor: "#f5f5f5",
              borderColor: "#ccc",
            },
          }}
          variant="outlined"
        >
          Cancel
        </Button>

        <Button
          onClick={submit}
          sx={{
            bgcolor: "#000",
            color: "#fff",
            px: 3,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              bgcolor: "#111",
            },
          }}
        >
          {project ? "Save Changes" : "Add Project"}
        </Button>

      </DialogActions>

    </Dialog>
  );
};

export default ProjectModal;
