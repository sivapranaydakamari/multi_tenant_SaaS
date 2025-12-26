// import { useEffect, useState } from "react";
// import {
//   Box,
//   Button,
//   Card,
//   Grid,
//   Typography,
//   TextField,
//   MenuItem,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions
// } from "@mui/material";

// import { Delete, Edit } from "@mui/icons-material";
// import API from "../api/axios";
// import { useNavigate } from "react-router-dom";
// import ProjectModal from "../components/ProjectModal";

// const Projects = () => {
//   const navigate = useNavigate();

//   const [projects, setProjects] = useState([]);
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("");
//   const [loading, setLoading] = useState(true);

//   const [openModal, setOpenModal] = useState(false);
//   const [editProject, setEditProject] = useState(null);

//   const [deleteId, setDeleteId] = useState(null);

//   const fetchProjects = async () => {
//     setLoading(true);
//     try {
//       let url = "/projects";

//       if (filter) url += `?status=${filter}`;
//       const res = await API.get(url);

//       const list = res.data.data.projects || res.data.projects;

//       setProjects(list);
//     } catch (err) {
//       console.log("Project fetch error", err);
//     }
//     setLoading(false);
//   };
//   useEffect(() => {
//     fetchProjects();
//   }, [filter]);

//   const handleSearch = (e) => {
//     setSearch(e.target.value);
//   };
//   const filteredProjects = projects.filter((p) =>
//     p.name.toLowerCase().includes(search.toLowerCase())
//   );



//   const openCreateModal = () => {
//     setEditProject(null);
//     setSearch("");
//     setOpenModal(true);
//   };

//   const openEditModal = (project) => {
//     setEditProject(project);
//     setOpenModal(true);
//   };

//   const confirmDelete = async () => {
//     try {
//       await API.delete(`/projects/${deleteId}`);
//       setDeleteId(null);
//       fetchProjects();
//     } catch (err) {
//       console.log("Delete error", err);
//     }
//   };

//   return (
//     <Box sx={{ p: 3 }}>

//       <Typography variant="h4">Projects</Typography>

//       {/* CREATE BUTTON */}
//       <Button
//         variant="contained"
//         sx={{ mt: 3 }}
//         onClick={openCreateModal}
//       >
//         Create New Project
//       </Button>

//       {/* FILTERS */}
//       <Grid container spacing={2} sx={{ mt: 2 }}>
//         <Grid item xs={12} md={6}>
//           <TextField
//             fullWidth
//             placeholder="Search by name"
//             value={search}
//             onChange={handleSearch}
//           />
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <TextField
//             fullWidth
//             select
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             label="Filter by status"
//           >
//             <MenuItem value="">All</MenuItem>
//             <MenuItem value="active">Active</MenuItem>
//             <MenuItem value="archived">Archived</MenuItem>
//             <MenuItem value="completed">Completed</MenuItem>
//           </TextField>
//         </Grid>
//       </Grid>

//       {/* PROJECT LIST */}
//       <Grid container spacing={3} sx={{ mt: 2 }}>
//         {!loading && filteredProjects.length === 0 && (
//           <Typography sx={{ mt: 3, ml: 2 }}>
//             No projects found
//           </Typography>
//         )}

//         {filteredProjects.map((p) => (
//           <Grid item xs={12} md={4} key={p.id}>
//             <Card
//               sx={{
//                 p: 2,
//                 cursor: "pointer",
//                 ":hover": { boxShadow: 4 }
//               }}
//               onClick={() => navigate(`/projects/${p.id}`)}
//             >
//               <Typography variant="h6">{p.name}</Typography>

//               <Typography variant="body2" color="text.secondary">
//                 {p.description?.slice(0, 50) || "No description"}...
//               </Typography>

//               <Typography sx={{ mt: 1 }}>
//                 Status:
//                 <span style={{ marginLeft: 5, color: "#1976d2" }}>
//                   {p.status}
//                 </span>
//               </Typography>

//               <Typography>
//                 Tasks:
//                 <span style={{ marginLeft: 5 }}>
//                   {p.taskCount}
//                 </span>
//               </Typography>

//               <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
//                 <IconButton
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     openEditModal(p);
//                   }}
//                 >
//                   <Edit />
//                 </IconButton>

//                 <IconButton
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setDeleteId(p.id);
//                   }}
//                 >
//                   <Delete />
//                 </IconButton>
//               </Box>
//             </Card>
//           </Grid>
//         ))}


//       </Grid>

//       {/* CREATE/EDIT MODAL */}
//       {openModal && (
//         <ProjectModal
//           open={openModal}
//           onClose={() => setOpenModal(false)}
//           project={editProject}
//           refresh={fetchProjects}
//         />
//       )}

//       {/* DELETE CONFIRM DIALOG */}
//       <Dialog open={!!deleteId}>
//         <DialogTitle>Confirm Delete</DialogTitle>
//         <DialogContent>
//           Are you sure you want to delete this project?
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDeleteId(null)}>Cancel</Button>
//           <Button color="error" onClick={confirmDelete}>Delete</Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default Projects;


import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider
} from "@mui/material";
import { Delete, Edit, Add } from "@mui/icons-material";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import ProjectModal from "../components/ProjectModal";

const Projects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let url = "/projects";

      if (filter) url += `?status=${filter}`;
      const res = await API.get(url);

      const list = res.data.data.projects || res.data.projects;

      setProjects(list);
    } catch (err) {
      console.log("Project fetch error", err);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );



  const openCreateModal = () => {
    setEditProject(null);
    setSearch("");
    setOpenModal(true);
  };

  const openEditModal = (project) => {
    setEditProject(project);
    setOpenModal(true);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/projects/${deleteId}`);
      setDeleteId(null);
      fetchProjects();
    } catch (err) {
      console.log("Delete error", err);
    }
  };
  
  const statusColor = (status) => {
    if (status === "active") return "default";
    if (status === "completed") return "success";
    return "warning";
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#fafafa", minHeight: "100vh" }}>

      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="#000">
          Projects
        </Typography>
        <Typography color="text.secondary">
          Manage, track and organize all tenant projects in one place
        </Typography>
      </Box>

      {/* ACTION BAR */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            select
            label="Status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={5} textAlign="right">
          <Button
            startIcon={<Add />}
            variant="contained"
            sx={{
              bgcolor: "#000",
              color: "#fff",
              px: 3,
              ":hover": { bgcolor: "#222" }
            }}
            onClick={() => {
              setEditProject(null);
              setOpenModal(true);
            }}
          >
            New Project
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* PROJECT GRID */}
      <Grid container spacing={3}>
        {!loading && filteredProjects.length === 0 && (
          <Box sx={{ textAlign: "center", width: "100%", mt: 8 }}>
            <Typography variant="h6">No projects found</Typography>
            <Typography color="text.secondary">
              Create your first project to get started
            </Typography>
          </Box>
        )}

        {filteredProjects.map((p) => (
          <Grid item xs={12} md={4} key={p.id}>
            <Card
              onClick={() => navigate(`/projects/${p.id}`)}
              sx={{
                p: 3,
                height: "100%",
                cursor: "pointer",
                borderRadius: 3,
                border: "1px solid #e0e0e0",
                transition: "all 0.3s ease",
                ":hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
                }
              }}
            >
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" fontWeight={600}>
                  {p.name}
                </Typography>
                <Chip
                  label={p.status}
                  size="small"
                  color={statusColor(p.status)}
                />
              </Box>

              <Typography
                sx={{ mt: 1 }}
                color="text.secondary"
                fontSize={14}
              >
                {p.description || "No description provided"}
              </Typography>

              <Typography sx={{ mt: 2, fontSize: 14 }}>
                Tasks: <b>{p.taskCount}</b>
              </Typography>

              {/* ACTIONS */}
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  gap: 1,
                  opacity: 0,
                  transition: "0.2s",
                  ".MuiCard-root:hover &": { opacity: 1 }
                }}
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditProject(p);
                    setOpenModal(true);
                  }}
                >
                  <Edit />
                </IconButton>

                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(p.id);
                  }}
                >
                  <Delete />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* MODALS */}
      {openModal && (
        <ProjectModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          project={editProject}
          refresh={fetchProjects}
        />
      )}

      <Dialog open={!!deleteId}>
        <DialogTitle>Delete Project?</DialogTitle>
        <DialogContent>
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" onClick={() => confirmDelete()}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
