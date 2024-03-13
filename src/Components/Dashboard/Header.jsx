import React from "react";
import { useMediaQuery } from 'react-responsive';
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import Notes from "../../assets/logo1.png";

const Header = () => {
  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 768px)' });
  const isTablet = useMediaQuery({ query: '(max-width: 1024px)' });
  const isMobile = useMediaQuery({ query: '(max-width: 525px)' });

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
            isMobile ? 'px-4' : isTablet ? 'px-10' : 'px-56'
          } rounded-full`}
        />
      </div>
      <div className="flex items-center">
        {(isDesktopOrLaptop || !isTablet) && <div className="">Hello, User</div>}
        <AccountCircleIcon
          className="text-gray-500 mx-2 hover:text-blue-500"
          style={{ fontSize: "3rem" }}
        />
      </div>
    </div>
  );
};

export default Header;
