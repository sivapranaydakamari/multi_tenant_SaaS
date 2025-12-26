import { useState } from "react";
import {
  TextField,
  Button,
  Card,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  Divider
} from "@mui/material";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tenantName: "",
    subdomain: "",
    adminEmail: "",
    adminFullName: "",
    adminPassword: "",
    confirmPassword: "",
    terms: false
  });

  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (form.adminPassword !== form.confirmPassword)
      return setError("Passwords do not match");

    if (!form.terms)
      return setError("You must accept the terms & conditions");

    try {
      await API.post("/auth/register-tenant", {
        tenantName: form.tenantName,
        subdomain: form.subdomain,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
        adminFullName: form.adminFullName
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          width: 440,
          p: 4,
          border: "1px solid #e0e0e0",
          borderRadius: 3
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Create Workspace
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
            Set up your organization and admin account
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Error */}
        {error && (
          <Typography
            sx={{
              bgcolor: "#f5f5f5",
              color: "#000",
              p: 1,
              borderRadius: 1,
              fontSize: 14,
              textAlign: "center",
              mb: 2
            }}
          >
            {error}
          </Typography>
        )}

        {/* Form */}
        <form onSubmit={submit}>
          <TextField
            fullWidth
            label="Organization Name"
            name="tenantName"
            margin="normal"
            onChange={onChange}
            sx={inputStyle}
          />

          <TextField
            fullWidth
            label="Subdomain"
            name="subdomain"
            margin="normal"
            onChange={onChange}
            sx={inputStyle}
          />

          <TextField
            fullWidth
            label="Admin Email"
            name="adminEmail"
            margin="normal"
            onChange={onChange}
            sx={inputStyle}
          />

          <TextField
            fullWidth
            label="Admin Full Name"
            name="adminFullName"
            margin="normal"
            onChange={onChange}
            sx={inputStyle}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            name="adminPassword"
            margin="normal"
            onChange={onChange}
            sx={inputStyle}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            margin="normal"
            onChange={onChange}
            sx={inputStyle}
          />

          {/* Terms */}
          <FormControlLabel
            control={
              <Checkbox
                name="terms"
                checked={form.terms}
                onChange={onChange}
                sx={{
                  color: "#000",
                  "&.Mui-checked": {
                    color: "#000"
                  }
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: 14 }}>
                I accept the Terms & Conditions
              </Typography>
            }
            sx={{ mt: 1 }}
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
            Register
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
            onClick={() => navigate("/login")}
          >
            Already have an account? Login
          </Button>
        </form>
      </Card>
    </Box>
  );
};

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

export default Register;
