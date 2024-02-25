import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@mui/material';
import './TopBar.css';

/**
 * Define TopBar, a React componment of project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    
  }

  render() {
    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className="appbar">
          <Typography variant="h5" color="inherit">
              Ssdi Group 12
          </Typography>
          <Typography variant="h5" color="inherit">
              {this.props.currentpageLabelOnTopBar ? this.props.currentpageLabelOnTopBar : " "}
          </Typography>
          
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
