import React, { useState, useEffect } from "react";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import "./TopBar.css";
import axios from "axios";

function TopBar({ currentLoggedInUser, currentpageLabelOnTopBar, handleLogout }) {
  const [appVersion, setAppVersion] = useState(undefined);

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
  }, []); // Empty dependency array means this runs once after initial render
  
  

  return appVersion ? (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar className="topbar">
        {/* <Typography variant="h5" color="inherit">
          SSDI Group 12
        </Typography> */}
        <Typography variant="h5" color="inherit">
          SSDI Group 12
          {currentLoggedInUser ? (
            <div style={{ color: "lightgreen" }}>
              {" "}
              Hi {currentLoggedInUser}{" "}
            </div>
          ) : (
            " Please Login"
          )}
        </Typography>

        <Typography variant="h5" color="inherit">
          {currentpageLabelOnTopBar
            ? currentpageLabelOnTopBar
            : " "}
        </Typography>

        <Typography variant="h5" component="div" color="inherit">
          Version: {appVersion.version}
        </Typography>
        {currentLoggedInUser ? (
        <Button variant="contained" onClick={handleLogout}>Logout</Button>
        ):("")
        }        
      </Toolbar>
    </AppBar>
  ) : (
    <div />
  );
}

export default TopBar;
