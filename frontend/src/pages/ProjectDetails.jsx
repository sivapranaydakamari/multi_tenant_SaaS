import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  Divider,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import TaskModal from "../components/TaskModal";

const STATUS_COLUMNS = [
  { key: "todo", label: "Todo" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProject = async () => {
    try {
      const res = await API.get(`/projects/${projectId}`);
      setProject(res.data.data);
    } catch (err) {
      console.log("Project load error", err);
      navigate("/projects");
    }
  };

  const loadTasks = async () => {
    try {
      const res = await API.get(`/projects/${projectId}/tasks`);
      setTasks(res.data.data.tasks);
    } catch (err) {
      console.log("Task load error", err);
    }
  };

  useEffect(() => {
    loadProject();
    loadTasks();
  }, [projectId]);

  const openNewTask = () => {
    setEditTask(null);
    setOpenTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditTask(task);
    setOpenTaskModal(true);
  };

  const updateTaskStatus = async (task) => {
    try {
      const nextStatus =
        task.status === "todo"
          ? "in_progress"
          : task.status === "in_progress"
            ? "completed"
            : "todo";

      await API.patch(`/projects/${projectId}/tasks/${task.id}/status`, { status: nextStatus });

      loadTasks();
    } catch (err) {
      console.log("Update task status error", err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      setDeleting(true);
      await API.delete(`/projects/${projectId}/tasks/${taskId}`);
      setDeleteTaskId(null);
      loadTasks();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleting(false);
    }
  };

  if (!project) return <Typography sx={{ p: 3 }}>Loading...</Typography>;

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: "auto" }}>

      {/* PROJECT HEADER */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h4" fontWeight={700}>
            {project.name}
          </Typography>
          <Chip label={project.status} variant="outlined" />
        </Box>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {project.description || "No description provided"}
        </Typography>
      </Box>

      {/* ACTION BAR */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Tasks Board
        </Typography>

        <Button
          onClick={openNewTask}
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
          + Add Task
        </Button>
      </Box>


      <Grid container spacing={3}>
        {STATUS_COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.key);

          return (
            <Grid item xs={12} md={4} key={col.key}>
              <Box
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 3,
                  p: 2,
                  minHeight: "70vh",
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "#fafafa",
                }}
              >
                {/* COLUMN HEADER */}
                <Typography fontWeight={600} mb={2}>
                  {col.label}
                </Typography>

                {/* COLUMN BODY */}
                <Box sx={{ flexGrow: 1 }}>
                  {columnTasks.length === 0 && (
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        color: "text.secondary",
                        px: 2,
                      }}
                    >
                      <Box>
                        <Typography fontWeight={500}>
                          No tasks yet
                        </Typography>
                        <Typography fontSize={13}>
                          Add tasks to get started
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {columnTasks.map((task) => (
                    <Card
                      key={task.id}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 3,
                        transition: "0.2s",
                        "&:hover": {
                          boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      <Typography fontWeight={600}>
                        {task.title}
                      </Typography>

                      <Typography fontSize={13} color="text.secondary">
                        {task.description}
                      </Typography>

                      <Divider sx={{ my: 1 }} />

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip label={task.priority} size="small" />
                        <Chip
                          label={
                            task.assignedTo
                              ? task.assignedTo.fullName
                              : "Unassigned"
                          }
                          size="small"
                          variant="outlined"
                        />

                      </Box>

                      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                        <Button
                          size="small"
                          onClick={() => updateTaskStatus(task)}
                        >
                          Move →
                        </Button>

                        <IconButton
                          size="small"
                          onClick={() => openEditTask(task)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTaskId(task.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* TASK MODAL */}
      {openTaskModal && (
        <TaskModal
          open={openTaskModal}
          onClose={() => setOpenTaskModal(false)}
          task={editTask}
          projectId={projectId}
          refresh={loadTasks}
        />
      )}

      {/* DELETE CONFIRM */}
      <Dialog open={!!deleteTaskId}>
        <DialogTitle>Delete Task?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteTaskId(null)}>Cancel</Button>
          <Button color="error" disabled={deleting} onClick={() => handleDelete(deleteTaskId)}>
            Delete
          </Button>

        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetails;
