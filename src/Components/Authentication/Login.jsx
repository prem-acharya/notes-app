import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Toaster, toast } from "sonner";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();

  useEffect(() => {
    const prefersDarkMode =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDarkMode ? "dark" : "light");
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully 🥳");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      // console.error('Login failed', error.message);
      toast.error("Invalid: ID & Password");
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Email sent For Password Reset 📧");
    } catch (error) {
      // console.error('Password reset failed', error.message);
      toast.error("Failed: Check Your Email For Password Reset");
    }
  };

  return (
    <div
      className={`max-w-md mx-auto mt-24 p-6 rounded-md shadow-custom ${
        theme === "dark" ? "dark:bg-gray-800 text-white" : ""
      }`}
    >
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <input
        className="w-full text-slate-800 mb-3 p-2 border rounded-md"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="relative">
        <input
          className="w-full mb-3 p-2 text-slate-800 border rounded-md"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-4"
        >
          {showPassword ? (
            <VisibilityIcon
              className="text-gray-700"
              style={{ marginBottom: "12px" }}
            />
          ) : (
            <VisibilityOffIcon
              className="text-gray-500"
              style={{ marginBottom: "12px" }}
            />
          )}
        </span>
      </div>
      <button
        className="w-full bg-blue-500 text-white p-2 mt-2 font-semibold rounded-md mb-4 hover:bg-blue-600"
        onClick={handleLogin}
      >
        Login
      </button>
      <button
        className="w-full bg-gray-300 text-gray-800 p-2 font-semibold rounded-md mb-4 hover:bg-gray-400"
        onClick={handleForgotPassword}
      >
        Forgot Password
      </button>
      <div className="text-center font-light">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold hover:underline">
          Create Account
        </Link>
      </div>
      <Toaster position="top-right" theme={theme} />
    </div>
  );
};

export default Login;
