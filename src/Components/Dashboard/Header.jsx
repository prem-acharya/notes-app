import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import Notes from "../../assets/logo1.png";
import { firestore as db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"; // Import additional Firestore functions
import { useAuth } from "../Authentication/AuthContext";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { signOut, getAuth } from "firebase/auth";
import ClearIcon from "@mui/icons-material/Clear";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingBar from "react-top-loading-bar"; // Import LoadingBar
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import MovieIcon from "@mui/icons-material/Movie";
import MusicVideoIcon from "@mui/icons-material/MusicVideo";
import DescriptionIcon from "@mui/icons-material/Description";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import TableChartIcon from "@mui/icons-material/TableChart";
import GifBoxIcon from "@mui/icons-material/GifBox";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import TerminalIcon from "@mui/icons-material/Terminal";
import FolderIcon from "@mui/icons-material/Folder"; // Import FolderIcon for folders
import { useNavigate } from 'react-router-dom';

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [username, setUsername] = useState("");
  const { currentUser } = useAuth(); // Use the useAuth hook to get the current user
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [progress, setProgress] = useState(0); // State for loading bar progress
  const auth = getAuth();
  const [searchValue, setSearchValue] = useState(""); // Add this line
  const [searchResults, setSearchResults] = useState([]); // State to hold both files and folders
  const [isFocused, setIsFocused] = useState(false); // State to manage input focus
  const navigate = useNavigate();

  const user = auth.currentUser;

  const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const handleAvatarClick = () => {
    setShowUserInfo((prevShowUserInfo) => !prevShowUserInfo);
  };

  const handleSignOut = () => {
    setProgress(100); // Start the loading process
  
    // Simulate a delay to ensure the loading bar is visible
    setTimeout(() => {
      signOut(auth)
        .then(() => {
          // toast.info("Signed out successfully");
          setTimeout(() => setProgress(100), 500);
        })
        .catch((error) => {
          // toast.error("Error signing out");
          setTimeout(() => setProgress(100), 500);
        });
    }, 500);
  };

  useEffect(() => {
    if (currentUser) {
      const fetchUsername = async () => {
        const userRef = doc(db, "users", currentUser.uid); // Use the uid from the currentUser
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUsername(userSnap.data().username); // Adjust field name as necessary
        } else {
          toast.info("No such document!");
          // console.log("No such document!");
        }
      };

      fetchUsername();
    }
  }, [currentUser]); // Depend on currentUser to re-run the effect when it changes

  useEffect(() => {
    if (currentUser && searchValue.trim() !== "") {
      const fetchSearchResults = async () => {
        try {
          // Query for files
          const filesQuery = query(collection(db, "files"), where("userId", "==", currentUser.uid));
          const filesSnapshot = await getDocs(filesQuery);
          const files = filesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), type: 'file' }));

          // Query for folders (assuming folders are stored in a "folders" collection)
          const foldersQuery = query(collection(db, "folders"), where("userId", "==", currentUser.uid));
          const foldersSnapshot = await getDocs(foldersQuery);
          const folders = foldersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), type: 'folder' }));

          // Combine files and folders
          const combinedResults = [...folders, ...files]; // Note that folders are added first

          // Filter based on the current searchValue
          const searchLower = searchValue.toLowerCase();
          const filteredResults = combinedResults.filter((item) =>
            item.name.toLowerCase().startsWith(searchLower)
          );

          // Sort so that folders appear first
          const sortedResults = filteredResults.sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') {
              return -1;
            }
            if (a.type === 'file' && b.type === 'folder') {
              return 1;
            }
            return a.name.localeCompare(b.name); // Optionally, sort by name within each type
          });

          setSearchResults(sortedResults);
        } catch (error) {
          toast.error("Error fetching search results");
        }
      };

      fetchSearchResults();
    } else {
      setSearchResults([]);
    }
  }, [currentUser, searchValue]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
    }, 100);
  };

  const isDesktopOrLaptop = useMediaQuery({ query: "(min-width: 768px)" });
  const isTablet = useMediaQuery({ query: "(max-width: 1024px)" });
  const isMobile = useMediaQuery({ query: "(max-width: 525px)" });

  // Function to get the appropriate file icon based on file extension
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <PictureAsPdfIcon className="text-blue-400" />;
      case "png":
      case "jpg":
      case "jpeg":
        return <ImageIcon className="text-blue-400" />;
      case "mp4":
        return <MovieIcon className="text-blue-400" />;
      case "mp3":
        return <MusicVideoIcon className="text-blue-400" />;
      case "docx":
        return <DescriptionIcon className="text-blue-400" />;
      case "pptx":
        return <SlideshowIcon className="text-blue-400" />;
      case "xlsx":
        return <TableChartIcon className="text-blue-400" />;
      case "gif":
        return <GifBoxIcon className="text-blue-400" />;
      case "zip":
        return <FolderZipIcon className="text-blue-400" />;
      case "py":
      case "c":
      case "html":
      case "c#":
      case "cpp":
      case "css":
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "json":
      case "dart":
      case "md":
      case "yaml":
      case "cc":
      case "php":
        return <TerminalIcon className="text-blue-400" />;
      default:
        return <InsertDriveFileIcon className="text-blue-400" />;
    }
  };

  return (
    <>
      <LoadingBar color="#0066ff" progress={progress} height={4} />
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
        <div className="relative"> {/* Make the search container relative */}
          <div className="flex bg-white items-center px-4 py-1 rounded-full shadow">
            <SearchIcon className="text-gray-500" />
            <input
              type="text"
              placeholder="Search Your Notes"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={`bg-transparent outline-none p-2 ${
                isMobile ? "px-0" : isTablet ? "px-10" : "px-56"
              } rounded-full`}
            />
            {searchValue && (
              <ClearIcon
                className="text-gray-500 cursor-pointer"
                onClick={() => setSearchValue('')}
              />
            )}
          </div>
          {isFocused && searchValue && searchResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md">
              {searchResults.map((result) => (
                <div key={result.id} className="p-3 hover:bg-blue-100 cursor-pointer rounded-md flex items-center" onClick={() => navigate(`/${result.type === 'file' ? 'documents' : 'folders'}/${result.id}`)}>
                  {result.type === 'file' ? getFileIcon(result.name) : <FolderIcon className="text-blue-400" />}
                  <span className="ml-2">{result.name}</span>
                </div>
              ))}
            </div>
          )}
          {isFocused && searchValue && searchResults.length === 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white cursor-pointer shadow-lg rounded-md p-3">
              <div className="text-gray-700">Not found</div>
            </div>
          )}
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
            {" "} {/* Wrap the icon and dropdown in a relative div */}
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
                  Username:{" "}
                  <div className="text-blue-500 ml-1" title={username}>
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
    </>
  );
};

export default Header
