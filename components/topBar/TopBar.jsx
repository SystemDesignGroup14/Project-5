import React, { useState, useEffect, useRef } from "react";
import { AppBar, Button, Toolbar, Typography, Snackbar } from "@mui/material";
import "./TopBar.css";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useHistory } from "react-router-dom";

function TopBar({ currentLoggedInUser, currentpageLabelOnTopBar, handleLogout }) {
  const [appVersion, setAppVersion] = useState(undefined);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const fileInputRef = useRef(null);
  const history = useHistory(); 

  useEffect(() => {
    const fetchAppVersion = async () => {
      try {
        const response = await axios.get("/test/info");
        setAppVersion(response.data);
      } catch (error) {
        console.error("Error fetching app version:", error);
      }
    };

    fetchAppVersion();
  }, []);

  const handleAddPhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop();
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const date = String(currentDate.getDate()).padStart(2, '0');
      const hour = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const seconds = String(currentDate.getSeconds()).padStart(2, '0');
      const milliseconds = String(currentDate.getMilliseconds()).padStart(3, '0');
      const filename = `${currentLoggedInUser}_${year}_${month}_${date}_${hour}_${minutes}_${seconds}_${milliseconds}.${fileExtension}`;
      const formData = new FormData();
      formData.append("uploadedphoto", file, filename);
      let response;
      try {
         response = await axios.post("/photos/new", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Photo uploaded successfully:", response.data);
        setSnackbarMessage('Photo uploaded successfully!');
        setSnackbarOpen(true);
        
      } catch (error) {
        console.error("Error uploading photo:", error);
        setSnackbarMessage('Error uploading photo');
        setSnackbarOpen(true);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
      {appVersion && (
        <AppBar className="topbar-appBar" position="absolute">
          <Toolbar className="topbar">
            <Typography variant="h5" color="inherit">
              SSDI Group 12
              {currentLoggedInUser ? (
                <div style={{ color: "lightgreen" }}>
                  Hi {currentLoggedInUser}
                </div>
              ) : (
                " Please Login"
              )}
            </Typography>

            {currentLoggedInUser && (
              <>
                <Button variant="contained" onClick={handleAddPhotoClick}>
                  Add Photo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </>
            )}
           { currentLoggedInUser &&
            <Typography variant="h5" color="inherit">
              {currentpageLabelOnTopBar || " "}
            </Typography>
           }
            <Typography variant="h5" component="div" color="inherit">
              Version: {appVersion.version}
            </Typography>

            {currentLoggedInUser && (
              <Button variant="contained" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Toolbar>
        </AppBar>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </div>
  );
}

export default TopBar;
