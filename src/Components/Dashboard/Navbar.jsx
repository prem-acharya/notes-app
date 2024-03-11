import { useState } from "react";
import SearchIcon from "@material-ui/icons/Search";
import { Avatar } from "@material-ui/core";
import logo from "../../assets/logo1.png";
import { Link } from "react-router-dom";
import { signOut, getAuth } from "firebase/auth";
import ClearIcon from "@material-ui/icons/Clear";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
// import HelpOutlineIcon from "@material-ui/icons/HelpOutline";

const Header = () => {
  const [showUserInfo, setShowUserInfo] = useState(false);
  const auth = getAuth();

  const user = auth.currentUser;

  const truncatedEmail = user?.email.substring(0, 22);

  const handleAvatarClick = () => {
    setShowUserInfo(!showUserInfo);
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="grid grid-cols-[300px_auto_200px] items-center p-5 px-20 h-15 border-b border-gray-300">
      <div className="flex items-center">
        <img src={logo} alt="Notes App" className="w-10" />
        <span className="text-2xl ml-2 text-gray-500">Notes App</span>
      </div>
      <div className="flex items-center w-full bg-gray-200 p-3 rounded-full">
        <SearchIcon className="text-gray-600" />
        <input
          type="text"
          placeholder="Search Here"
          className="bg-transparent border-none outline-none flex-1"
        />
        {/* <FormatAlignCenterIcon /> */}
      </div>
      <div className="flex items-center ml-auto space-x-4">
        <div className="relative">
          <Avatar className="cursor-pointer" onClick={handleAvatarClick} />
          {showUserInfo && (
            <div className="absolute right-0 mt-2 p-10 bg-sky-50 shadow-lg rounded-md flex flex-col items-center">
              <ClearIcon
                className="absolute top-0 right-0 mt-1 mr-2 cursor-pointer"
                onClick={() => setShowUserInfo(false)}
              />
              <div className="text-blue-500 font-semibold mb-1">{truncatedEmail}...</div>
              <Avatar className="mb-4 mt-2" style={{ width: "80px", height: "80px" }} />
              <div className="text-gray-700 mb-4">Welcome to Notes App</div>
              <div className="bg-blue-400 font-semibold hover:bg-blue-600 rounded-full p-2">
              <Link
                to="/"
                onClick={handleSignOut}
                className="flex items-center text-white"
              >
                <ExitToAppIcon className="mr-2" />
                Sign Out
              </Link>
              </div>
            </div>
          )}
        </div>
        {/* <div className="flex items-center ml-2">
          <HelpOutlineIcon />
        </div> */}
      </div>
    </div>
  );
};

export default Header;
