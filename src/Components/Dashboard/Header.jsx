import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import Notes from "../../assets/logo1.png";
import { firestore as db } from "../../firebase"; // Adjust the path as necessary
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../Authentication/AuthContext"; // Adjust the path as necessary

const Header = () => {
  const [username, setUsername] = useState("");
  const { currentUser } = useAuth(); // Use the useAuth hook to get the current user

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
      {isMobile && <MenuIcon className="text-gray-500" />}
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
            isMobile ? "px-4" : isTablet ? "px-10" : "px-56"
          } rounded-full`}
        />
      </div>
      <div className="flex items-center">
        {(isDesktopOrLaptop || !isTablet) && (
          <div className="flex">
            Hello,<div className="text-blue-500 ml-1 font-medium">{username.toUpperCase()}</div>
          </div>
        )}
        <AccountCircleIcon
          className="text-blue-300 mx-2"
          style={{ fontSize: "3rem" }}
        />
      </div>
    </div>
  );
};

export default Header;
