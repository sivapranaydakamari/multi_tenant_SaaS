import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  Typography,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, tenant, loadUser } = useAuth();

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });

  const [recentProjects, setRecentProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  const loadDashboard = async () => {
    try {
      const projRes = await API.get("/projects?limit=100");
      const projects = projRes.data.data.projects;

      const totalTasks = projects.reduce(
        (sum, p) => sum + p.taskCount,
        0
      );
      const completedTasks = projects.reduce(
        (sum, p) => sum + (p.completedTaskCount || 0),
        0
      );

      const projectCount = tenant?.subscription_plan === "free" ? Math.min(projects.length, tenant.max_projects) : projects.length;

      setStats({
        totalProjects: projectCount,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
      });


      let visibleProjects = projects;

      if (tenant?.subscription_plan === "free") {
        visibleProjects = projects.slice(0, tenant.max_projects);
      }

      setRecentProjects(visibleProjects.slice(0, 4));


      // setRecentProjects(projects.slice(0, 4));

      const my = [];
      for (let p of projects) {
        const tasksRes = await API.get(
          `/projects/${p.id}/tasks?assignedTo=${user.id}`
        );
        my.push(...tasksRes.data.data.tasks);
      }

      setMyTasks(my.slice(0, 6));
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoPro = async () => {
    try {
      await API.put(`/tenants/${tenant.id}`, {
        subscriptionPlan: "pro",
      });

      await loadUser();
      await loadDashboard();

    } catch (err) {
      console.error("Upgrade failed", err.response?.data || err);
    }
  };

  useEffect(() => {
    if (tenant) {
      loadDashboard();
    }
  }, [tenant]);


  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", py: 5 }}>
      <Box sx={{ maxWidth: 1300, mx: "auto", px: 3 }}>

        {/* HEADER */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700}>
            Welcome back, {user.fullName}

            {tenant?.subscription_plan === "pro" && (
              <Chip
                label="PRO"
                size="small"
                sx={{
                  ml: 2,
                  bgcolor: "#000",
                  color: "#fff",
                  fontWeight: 600,
                }}
              />
            )}
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Here’s a snapshot of your workspace
          </Typography>
          <Divider sx={{ mt: 3 }} />
        </Box>

        {/* STATS */}
        <Grid container spacing={3}>
          {[
            { label: "Projects", value: stats.totalProjects },
            { label: "Total Tasks", value: stats.totalTasks },
            { label: "Completed", value: stats.completedTasks },
            { label: "Pending", value: stats.pendingTasks },
          ].map((item, i) => (
            <Grid item xs={12} md={3} key={i}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid #eee",
                  textAlign: "center",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  letterSpacing={1}
                >
                  {item.label.toUpperCase()}
                </Typography>
                <Typography variant="h3" fontWeight={700} mt={1}>
                  {item.value}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {tenant?.subscription_plan === "free" && (
          <Card
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 3,
              border: "1px solid #000",
              bgcolor: "#fafafa",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography fontWeight={700}>
                Upgrade to Pro
              </Typography>
              <Typography fontSize={14} color="text.secondary">
                Unlock more projects, users, and advanced features
              </Typography>
            </Box>

            <Chip
              label="Go Pro"
              clickable
              onClick={handleGoPro}
              sx={{
                bgcolor: "#000",
                color: "#fff",
                fontWeight: 600,
                px: 2,
              }}
            />
          </Card>
        )}


        {/* RECENT PROJECTS */}
        <Box sx={{ mt: 7 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              Recent Projects
            </Typography>
            <Typography color="text.secondary" fontSize={14}>
              Jump back into your work
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {recentProjects.map((proj) => (
              <Grid item xs={12} md={6} key={proj.id}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: "1px solid #eee",
                    height: "100%",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow:
                        "0 18px 40px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      {proj.name}
                    </Typography>
                    <Chip
                      label={proj.status}
                      variant="outlined"
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </Box>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Total Tasks: {proj.taskCount}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ textAlign: "right" }}>
                    <Link
                      to={`/projects/${proj.id}`}
                      style={{
                        textDecoration: "none",
                        fontWeight: 600,
                        color: "#000",
                      }}
                    >
                      View Details →
                    </Link>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* MY TASKS */}
        <Box sx={{ mt: 7 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              My Tasks
            </Typography>
            <Typography color="text.secondary" fontSize={14}>
              Tasks assigned to you
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {myTasks.map((task) => (
              <Grid item xs={12} md={4} key={task.id}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: "1px solid #eee",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow:
                        "0 16px 36px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Typography fontWeight={600}>
                    {task.title}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    fontSize={14}
                    sx={{ mt: 0.5 }}
                  >
                    Due: {task.dueDate || "No due date"}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Chip
                      label={task.priority}
                      variant="outlined"
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                    <Typography
                      fontSize={12}
                      color="text.secondary"
                    >
                      Assigned Task
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

      </Box>
    </Box>
  );
};

export default Dashboard;
