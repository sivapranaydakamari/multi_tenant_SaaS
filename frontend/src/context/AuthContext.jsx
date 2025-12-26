import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password, subdomain) => {
    const res = await API.post("/auth/login", {
      email,
      password,
      tenantSubdomain: subdomain
    });
    localStorage.setItem("token", res.data.data.token);
    return await loadUser();
  };

  const loadUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data.data);
      setTenant(res.data.data.tenant);
    } catch (err) {
      localStorage.removeItem("token");
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setTenant(null);
  };

  useEffect(() => {
    if(localStorage.getItem("token")) loadUser();
    else setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, tenant, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
