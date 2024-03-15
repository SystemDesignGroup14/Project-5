import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import "./TopBar.css";
import FetchModel from "../../lib/fetchModelData";

function TopBar(props) {
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
        <Typography variant="h5" color="inherit">
          SSDI Group 12
        </Typography>
        <Typography variant="h5" color="inherit">
          {props.currentpageLabelOnTopBar
            ? props.currentpageLabelOnTopBar
            : " "}
        </Typography>

        <Typography variant="h5" component="div" color="inherit">
          Version: {appVersion.version}
        </Typography>
      </Toolbar>
    </AppBar>
  ) : (
    <div />
  );
}

export default TopBar;
