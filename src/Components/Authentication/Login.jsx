import React, { useState } from "react";
import { auth, firestore, googleProvider } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider, // Added GoogleAuthProvider
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import loginGif from "../../assets/Login.gif";
import googleLogo from "../../assets/Google.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isContinuewithGoogle, setIsContinuewithGoogle] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLogin(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully 🥳");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      toast.error("Invalid: ID & Password");
    } finally {
      setIsLogin(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Email sent For Password Reset 📧");
    } catch (error) {
      toast.error("Failed: Check Your Email For Password Reset");
    }
  };

  const handleGoogleLogin = async () => {
    setIsContinuewithGoogle(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;

      if (user.metadata.creationTime === user.metadata.lastSignInTime) {
        await setDoc(doc(firestore, "users", user.uid), {
          username: user.displayName,
          email: user.email,
        });
      }

      toast.success("Google Login Successful 🥳");
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.log("error:",error);
      toast.error("Google Login Failed");
    } finally {
      setIsContinuewithGoogle(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center space-x-4 bg-gray-100">
      <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-custom overflow-hidden">
        <div className="hidden md:block w-full md:w-1/2 lg:w-3/5">
          <img
            className="object-cover w-full h-full"
            src={loginGif}
            alt="Login"
          />
        </div>
        <div className="w-full md:max-w-md lg:max-w-full md:w-1/2 lg:w-3/5 p-8 md:p-12 lg:p-24">
          <h2 className="text-2xl font-semibold mb-4">Hello Again!</h2>
          <p className="text-sm mb-8">Welcome back you've been missed!</p>
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
                <VisibilityOffIcon
                  className="text-gray-700"
                  style={{ marginBottom: "12px" }}
                />
              ) : (
                <VisibilityIcon
                  className="text-gray-500"
                  style={{ marginBottom: "12px" }}
                />
              )}
            </span>
          </div>
          <button
            className="w-full bg-blue-500 text-white p-2 mt-2 font-semibold rounded-md mb-4 hover:bg-blue-600"
            disabled={isLogin}
            onClick={handleLogin}
          >
            {isLogin ? "Login..." : "Login"}
          </button>
          <button
            className="w-full bg-gray-300 text-gray-800 p-2 font-semibold rounded-md mb-2 hover:bg-gray-400"
            onClick={handleForgotPassword}
          >
            Forgot Password
          </button>
          <div className="text-center mb-2 font-light">OR</div>
          <>
            <style>
              {`
          .gradient-hover-animation {
            background-size: 200% 100%;
            background-image: linear-gradient(to right, #EBEEEE 50%, #c9d9fd 50%);
            transition: background-position 1s;
          }

          .gradient-hover-animation:hover {
            background-position: -100% 0;
          }
        `}
            </style>
            <button
              type="button"
              disabled={isContinuewithGoogle}
              className=" flex items-center justify-center w-full bg-gray-100 p-2 font-semibold rounded-md hover:bg-gray-300 gradient-hover-animation"
              onClick={handleGoogleLogin}
            >
              <img
                className="w-6 h-6 mr-2"
                src={googleLogo}
                alt="Google_logo"
                srcset=""
              />
              {isContinuewithGoogle ? "Continue..." : "Continue with Google"}
            </button>
          </>
          <div className="text-center mt-3 font-light">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold hover:underline">
              Create Account
            </Link>
          </div>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default Login;
