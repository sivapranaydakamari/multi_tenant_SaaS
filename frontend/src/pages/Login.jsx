import { useState } from "react";
import {
  TextField,
  Button,
  Card,
  Typography,
  Box,
  Divider
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    subdomain: ""
  });

  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password, form.subdomain);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: 420,
          p: 4,
          border: "1px solid #e0e0e0",
          borderRadius: 3
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#000" }}
          >
            Welcome Back
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#666", mt: 1 }}
          >
            Sign in to your workspace
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Error */}
        {error && (
          <Typography
            sx={{
              color: "#000",
              bgcolor: "#f5f5f5",
              p: 1,
              borderRadius: 1,
              fontSize: 14,
              mb: 2,
              textAlign: "center"
            }}
          >
            {error}
          </Typography>
        )}

        {/* Form */}
        <form onSubmit={submit}>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            sx={inputStyle}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            sx={inputStyle}
          />

          <TextField
            fullWidth
            label="Tenant Subdomain"
            margin="normal"
            onChange={(e) =>
              setForm({ ...form, subdomain: e.target.value })
            }
            sx={inputStyle}
          />

          {/* Primary Button */}
          <Button
            type="submit"
            fullWidth
            sx={{
              mt: 3,
              py: 1.3,
              bgcolor: "#000",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 2,
              "&:hover": {
                bgcolor: "#222"
              }
            }}
          >
            Login
          </Button>

          {/* Secondary Action */}
          <Button
            fullWidth
            variant="text"
            sx={{
              mt: 2,
              color: "#000",
              fontSize: 14,
              textTransform: "none",
              "&:hover": {
                bgcolor: "transparent",
                textDecoration: "underline"
              }
            }}
            onClick={() => navigate("/register")}
          >
            Need an account? Register
          </Button>
        </form>
      </Card>
    </Box>
  );
};

/* Shared Input Styles */
const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "& fieldset": {
      borderColor: "#ccc"
    },
    "&:hover fieldset": {
      borderColor: "#000"
    },
    "&.Mui-focused fieldset": {
      borderColor: "#000",
      borderWidth: 1.5
    }
  },
  "& label.Mui-focused": {
    color: "#000"
  }
};

export default Login;
