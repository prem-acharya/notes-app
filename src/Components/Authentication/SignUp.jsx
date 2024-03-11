import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, firestore, googleProvider } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import verify from "../../assets/Verified.gif";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const [theme, setTheme] = useState("light");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showconfirmPassword, setShowconfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const prefersDarkMode =
  //     window.matchMedia &&
  //     window.matchMedia("(prefers-color-scheme: dark)").matches;
  //   setTheme(prefersDarkMode ? "dark" : "light");
  // }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isEmailSent) {
      const intervalId = setInterval(async () => {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(intervalId);
          navigate("/dashboard");
        }
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [isEmailSent, navigate]);

  const checkPasswordStrength = (password) => {
    if (password.length >= 6) {
      if (/[a-zA-Z]/.test(password) && /\d/.test(password)) {
        if (
          /[@$]/.test(password) &&
          /[A-Z]/.test(password) &&
          /[a-z]/.test(password)
        ) {
          setPasswordStrength("Strong");
        } else {
          setPasswordStrength("Medium");
        }
      } else {
        setPasswordStrength("Weak");
      }
    } else {
      setPasswordStrength("Weak");
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setIsSigningUp(true);
    
    if (password !== confirmPassword) {
      toast.error("Passwords do Not Match ❌");
      setIsSigningUp(false);
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters ❌");
      setIsSigningUp(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendEmailVerification(userCredential.user);
      await setDoc(doc(firestore, "users", userCredential.user.uid), {
        username: username,
        email: email,
      });
      // toast.success("Signup successful 🥳", { duration: 8000 });
      toast.success("Verification Email Sent 📧");
      setIsEmailSent(true);
    } catch (error) {
      toast.error("Signup Failed: Email is Already Registered");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;
  
      // Check if the user is new (just signed up)
      if (user.metadata.creationTime === user.metadata.lastSignInTime) {
        // Set additional information in Firestore
        await setDoc(doc(firestore, "users", user.uid), {
          username: user.displayName,
          email: user.email,
        });
      }
  
      toast.success("Google SignUp Successful 🥳");
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      toast.error("Google SignUp Failed");
    }
  };
  
    

  return (
    <div>
      {!isEmailSent ? (
        <form onSubmit={handleSignup}>
          <div
            className="max-w-md mx-auto mt-24 p-6 rounded-md shadow-xl bg-white" >
            <div className="text-2xl font-semibold mb-4">Signup</div>
            <input
              className="w-full mb-3 p-2 text-slate-800 border rounded-md"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="w-full mb-3 p-2 text-slate-800 border rounded-md"
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
                onChange={handlePasswordChange}
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
            <div className="relative">
              <input
                className="w-full mb-3 p-2 bg-white shadow-sm text-slate-800 border rounded-md"
                type={showconfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                onClick={() => setShowconfirmPassword(!showconfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-4"
              >
                {showconfirmPassword ? (
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
            <div className="flex font-light">
              Password strength:
              <div
                className={`ml-1 font-semibold ${
                  passwordStrength === "Weak"
                    ? "text-red-500"
                    : passwordStrength === "Medium"
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                {passwordStrength}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSigningUp}
              className="w-full bg-blue-500 text-white p-2 mt-4 font-semibold rounded-md mb-2 hover:bg-blue-600"
            >
              {isSigningUp ? "Signing up..." : "Signup"}
            </button>
            <div className="text-center mb-2 font-light">
              OR
            </div>
            <button
              type="button"
              className="w-full bg-gray-500 text-white p-2 font-semibold rounded-md hover:bg-gray-700"
              onClick={handleGoogleSignup}
            >
              Signup with Google
            </button>
            <div className="text-center mt-4 font-light">
              Back to{" "}
              <Link to="/login" className="font-semibold hover:underline">
                Login
              </Link>
            </div>
          </div>
        </form>
      ) : (
        <div className="max-w-md mx-auto mt-24 p-6 text-center bg-white rounded-md shadow-custom">
          <div className="text-2xl font-semibold mb-4">Verify Your Email</div>
          <div className="font-semibold">
            Please check your email inbox for the verification link.
          </div>
          <div className="mt-2">
            Verification email sent to:{" "}
            <strong className="text-blue-500">{email}</strong>
          </div>
          <div>
            <img src={verify} alt="Email verification" />
          </div>
          <div className="mt-2 font-light">
            Have an account?{" "}
            <Link to="/login" className="font-semibold hover:underline">
              Log In
            </Link>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Signup;
