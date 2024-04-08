import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import verify from "../../assets/Verified.gif";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import signup from "../../assets/Signup.gif";
import LoadingBar from "react-top-loading-bar"; // Import LoadingBar

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showconfirmPassword, setShowconfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [progress, setProgress] = useState(0); // State for loading bar progress
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) {
        navigate("/dashboard");
        setProgress(100);
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
    setProgress(30);
    setIsSigningUp(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do Not Match!");
      setIsSigningUp(false);
      setTimeout(() => setProgress(100), 500);
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      setIsSigningUp(false);
      setTimeout(() => setProgress(100), 500);
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
      toast.success("Verification Email Sent!");
      setIsEmailSent(true);
    } catch (error) {
      toast.error("Signup Failed: Email is Already Registered!");
    } finally {
      setIsSigningUp(false);
      setTimeout(() => setProgress(100), 500);
    }
  };

  const navigateToLogin = () => {
    setProgress(100);
    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  document.title = "SignUp - Notes App";

  return (
    <>
      <LoadingBar color="#0066ff" progress={progress} height={4} />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col lg:flex-row rounded-xl bg-white shadow-custom overflow-hidden">
          <div className="hidden lg:block lg:w-1/2">
            <img
              className="object-cover w-full h-full"
              src={signup}
              alt="SignUp"
            />
          </div>
          <div className="w-full lg:max-w-md p-8 md:p-12 lg:p-24">
            {!isEmailSent ? (
              <form className="m-[-20px]" onSubmit={handleSignup}>
                <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
                <p className="text-sm mb-8">
                  Capture, Upload, Organize Your Notes!
                </p>
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
                <div className="text-center mt-3 font-light">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={navigateToLogin}
                    className="font-semibold hover:underline"
                  >
                    Login
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">
                  Verify Your Email
                </h2>
                <p className="font-semibold">
                  Please check your email inbox for the verification link.
                </p>
                <p className="mt-4">
                  Verification email sent to:{" "}
                  <span className="text-blue-500 font-semibold cursor-pointer" title={email}>
                  {email.slice(0, 30)}
                  {email.length > 30 ? "..." : ""}
                  </span>
                </p>
                <div>
                  <img src={verify} alt="Email verification" />
                </div>
                <p className="mt-2 font-light">
                  Have an account?{" "}
                  <button
                    type="button"
                    onClick={navigateToLogin}
                    className="font-semibold hover:underline"
                  >
                    Login
                  </button>
                </p>
              </div>
            )}
            <ToastContainer />
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
