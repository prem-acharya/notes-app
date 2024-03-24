import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import Notes from "../../assets/logo1.png";
import { firestore as db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../Authentication/AuthContext";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { signOut, getAuth } from "firebase/auth";
import ClearIcon from "@mui/icons-material/Clear";
// import { Link } from "react-router-dom";

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [username, setUsername] = useState("");
  const { currentUser } = useAuth(); // Use the useAuth hook to get the current user
  const [showUserInfo, setShowUserInfo] = useState(false);
  const auth = getAuth();

  const user = auth.currentUser;

  const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const handleAvatarClick = () => {
    setShowUserInfo((prevShowUserInfo) => !prevShowUserInfo);
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        // Handle sign-out success.
        // You might want to redirect the user to the login page here.
      })
      .catch((error) => {
        // Handle errors here.
      });
  };

  useEffect(() => {
    if (currentUser) {
      const fetchUsername = async () => {
        const userRef = doc(db, "users", currentUser.uid); // Use the uid from the currentUser
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUsername(userSnap.data().username); // Adjust field name as necessary
        } else {
          console.log("No such document!");
        }
      };

      fetchUsername();
    }
  }, [currentUser]); // Depend on currentUser to re-run the effect when it changes

  const isDesktopOrLaptop = useMediaQuery({ query: "(min-width: 768px)" });
  const isTablet = useMediaQuery({ query: "(max-width: 1024px)" });
  const isMobile = useMediaQuery({ query: "(max-width: 525px)" });

  return (
    <div className="flex justify-between items-center p-4 bg-blue-50">
      {isMobile && (
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <MenuIcon className="text-gray-500" />
        </button>
      )}
      <div className="flex ml-4 cursor-pointer">
        {(isDesktopOrLaptop || !isTablet) && (
          <>
            <img src={Notes} alt="Notes logo" className="w-10 h-10 mr-4" />
            <div className="text-2xl font-bold">Notes App</div>
          </>
        )}
      </div>
      <div className="flex bg-white items-center px-4 py-1 rounded-full">
        <SearchIcon className="text-gray-500" />
        <input
          type="text"
          placeholder="Search Your Notes"
          className={`bg-transparent outline-none p-2 ${
            isMobile ? "px-1" : isTablet ? "px-10" : "px-56"
          } rounded-full`}
        />
      </div>
      <div className="flex items-center">
        {(isDesktopOrLaptop || !isTablet) && (
          <div className="flex">
            Welcome,
            <div className="text-blue-500 ml-1 uppercase font-medium">
              {username}
            </div>
          </div>
        )}
        <div className="relative">
          {" "}
          {/* Wrap the icon and dropdown in a relative div */}
          {username ? (
            <div
              className="bg-blue-300 hover:bg-blue-400 text-white font-semibold rounded-full w-12 h-12 flex items-center justify-center mx-2 cursor-pointer"
              style={{ fontSize: "1.5rem" }}
              onClick={handleAvatarClick}
            >
              {getInitials(username)}
            </div>
          ) : (
            <AccountCircleIcon
              className="text-blue-300 hover:bg-blue-400 mx-2 cursor-pointer"
              style={{ fontSize: "3rem" }}
              onClick={handleAvatarClick}
            />
          )}
          {showUserInfo && (
            <div className="absolute z-50 cursor-pointer right-0 mr-2 w-64 p-4 bg-blue-50 shadow-2xl rounded-xl flex flex-col items-center">
              <ClearIcon
                className="absolute top-0 right-0 m-2 cursor-pointer"
                onClick={() => setShowUserInfo(false)}
              />
              <div
                className="mb-4 text-white w-24 h-24 uppercase bg-blue-300 hover:bg-blue-400 rounded-full flex items-center justify-center"
                style={{ fontSize: "5rem" }}
              >
                {username ? username[0] : <AccountCircleIcon />}
              </div>
              <div
                className="text-gray-700 hover:text-blue-500 font-medium mb-1"
                title={user.email}
              >
                {user.email.slice(0, 22)}
                {user.email.length > 22 ? "..." : ""}
              </div>
              <div className="flex text-gray-700 font-medium mb-4">
                Username: <div className="text-blue-500 ml-1" title={username}>
                {username.slice(0, 8)}
                {username.length > 8 ? "..." : ""}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-blue-400 font-semibold hover:bg-blue-500 rounded-full p-2 text-white flex items-center"
              >
                <ExitToAppIcon className="mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
