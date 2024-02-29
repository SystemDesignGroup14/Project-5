import React, { Component } from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './TopBar.css';
import FetchModel from '../../lib/fetchModelData';

class TopBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appVersion: undefined,
    };
  }

  componentDidMount() {
    this.fetchAppVersion();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.appVersion === undefined) {
      this.fetchAppVersion();
    }
  }

  fetchAppVersion = async () => {
    try {
      const response = await FetchModel("/test/info");
      this.setState({ appVersion: response.data });
    } catch (error) {
      console.error('Error fetching app version:', error);
    }
  };

  renderAppBar = () => {
    const { appVersion } = this.state;
    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className='topbar'>
          <Typography variant="h5" color="inherit">
            SSDI Group 12
          </Typography>
          <Typography variant="h5" color="inherit">
          {this.props.currentpageLabelOnTopBar ? this.props.currentpageLabelOnTopBar : " "}
          </Typography>
          <Typography variant="h5" component="div" color="inherit">
            Version: {appVersion.__v}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  };

  render() {
    return this.state.appVersion ? this.renderAppBar() : <div />;
  }
}

export default TopBar;
