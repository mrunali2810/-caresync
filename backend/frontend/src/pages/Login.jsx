import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    setLoading(true);

    try {
      const response = await api.post("/login", {
        email: email.trim(),
        password: password
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);

        if (response.data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );
        }

        toast.success("Login Successful");
        navigate("/dashboard");
      } else {
        toast.error("Token not received from server");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Login</h2>

      <form onSubmit={onSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
        />

        <br /><br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
        />

        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;