import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './TopBar.css';
import FetchModel from '../../lib/fetchModelData';

const TopBar = (props) => {
  const [appVersion, setAppVersion] = useState(undefined);

  useEffect(() => {
    const fetchAppVersion = async () => {
      try {
        const response = await FetchModel("/test/info");
        setAppVersion(response.data);
      } catch (error) {
        console.error('Error fetching app version:', error);
      }
    };

    if (appVersion === undefined) {
      fetchAppVersion();
    }
  }, [appVersion]);

  return appVersion ? (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar className='topbar'>
        <Typography variant="h5" color="inherit">
          GROUP12
        </Typography>
        <Typography variant="h5" color="inherit">
          {props.topName}
        </Typography>
        <Typography variant="h5" component="div" color="inherit">
          Version: {appVersion.__v}
        </Typography>
      </Toolbar>
    </AppBar>
  ) : (
    <div />
  );
};

export default TopBar;
