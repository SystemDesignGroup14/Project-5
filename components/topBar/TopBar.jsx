import React, { useState, useEffect, useRef } from "react";
import "./TopBar.css";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Autocomplete,
  TextField,
  Checkbox,
  FormControlLabel,AppBar, Button, Toolbar, Typography, Snackbar
} from "@mui/material";

function TopBar({ currentLoggedInUser, currentpageLabelOnTopBar, handleLogout,handleDeleteAccount }) {
  const [appVersion, setAppVersion] = useState(undefined);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const fileInputRef = useRef(null);
  const [userData, setUserData] = useState({
    app_version: undefined,
    photo_upload_show: false,
    photo_upload_error: false,
    photo_upload_success: false,
    availableUsers: [],
    userList: [],
    userData: ""
  });
  const [isPrivate,setIsPrivate] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [userList, setUserList] = useState([]);
  const [sharingList, setSharingList] = useState([]);

  const fetchAvailableUsers = () => {
    axios
      .get("/user/list")
      .then((response) => {
        console.log( response.data );
        const users = response.data.map((user) => user.first_name);
        setUserData(response.data);
        console.log(userData.userList);
        setAvailableUsers(users);
        console.log( users );
      })
      .catch((error) => {
        console.error("Error fetching user list:", error);
      });
  };

  const handleSharingListChange = (event, value) => {

    setUserList(value);
    setSharingList( userData
      .filter((user) => value.includes(user.first_name))
      .map((user) => user._id)  );
  };

  const handlePrivateCheckboxChange = () => {
    setIsPrivate(!isPrivate);
  };

  useEffect(() => {
    if(currentLoggedInUser){
      fetchAvailableUsers();
    }
    const fetchAppVersion = async () => {
      try {
        const response = await axios.get("/test/info");
        setAppVersion(response.data);
      } catch (error) {
        console.error("Error fetching app version:", error);
      }
    };

    fetchAppVersion();
  }, [currentLoggedInUser]);

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
      console.log(userData);
      if( isPrivate ){
        formData.append("sharingList", JSON.stringify([]));
      } else {
        formData.append("sharingList", JSON.stringify(sharingList));
      }
      formData.append("isPrivate", isPrivate);
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
        setUserList([]);
        setSharingList([]);
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

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    setOpenDialog(false);
    handleDeleteAccount();
  };


  const handleDialogClose = () => {
    setOpenDialog(false);
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
              <Autocomplete
                    multiple
                    id="userList"
                    options={availableUsers}
                    value={userList}
                    onChange={handleSharingListChange}
                    disabled={isPrivate}
                    onFocus={fetchAvailableUsers}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Sharing List (Usernames)"
                        variant="standard"
                      />
                    )}
                  />
                  

                <FormControlLabel
                control={(
                  <Checkbox
                    checked={isPrivate}
                    onChange={handlePrivateCheckboxChange}
                    sx={{ marginRight: -0.2 }}
                  />
                )}
                label="Owner Only"
              />
              </>

            )}

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

            { currentLoggedInUser  && (
            <Typography variant="h5" color="inherit">
              {currentpageLabelOnTopBar || " "}
            </Typography> 
            )}
            <Typography variant="h5" component="div" color="inherit">
              Version: {appVersion.version}
            </Typography>

            {currentLoggedInUser && ( 
            <Button variant="contained" onClick={handleDialogOpen}>
                   Delete Account
            </Button>
            
            )}

            {currentLoggedInUser && (
              <Button variant="contained" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Toolbar>
        </AppBar>
      )}

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{"Confirm Account Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

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