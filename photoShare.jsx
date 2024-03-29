import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { Grid, Typography, Paper, Snackbar } from "@mui/material"; // Import Snackbar from MUI here
import axios from "axios";
import TopBar from "./components/topBar/TopBar";
import UserDetail from "./components/userDetail/userDetail";
import UserList from "./components/userList/userList";
import UserPhotos from "./components/userPhotos/userPhotos";
import LoginRegister from "./components/loginRegister/loginRegister";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      labelOnTopBar: undefined,
      isLoggedIn: false,
      currentLoggedInUser: undefined,
      snackbarOpen: false, // Initialize snackbarOpen state
      snackbarMessage: '', // Initialize snackbarMessage state
    };
    this.changeLabelOnTopBar = this.changeLabelOnTopBar.bind(this);
    this.changeCurrentLoggedInUser = this.changeCurrentLoggedInUser.bind(this);
    this.toggleLogin = this.toggleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this); // Bind handleSnackbarClose
  }

  changeLabelOnTopBar(label) {
    this.setState({ labelOnTopBar: label });
  }

  changeCurrentLoggedInUser(username) {
    this.setState({ currentLoggedInUser: username });
  }

  toggleLogin(isLoggedIn) {
    this.setState({ isLoggedIn });
  }

  handleLogout() {
    axios
      .post("/admin/logout")
      .then(() => {
        console.log("Logout successful");
        this.setState({
          isLoggedIn: false,
          currentLoggedInUser: undefined,
          snackbarOpen: true,
          snackbarMessage: "Logout successful",
        });
      })
      .catch((error) => {
        console.error("Logout error:", error);
        this.setState({
          snackbarOpen: true,
          snackbarMessage: "Logout failed",
        });
      });
  }

  handleSnackbarClose() {
    this.setState({ snackbarOpen: false });
  }

  render() {
    return (
      <HashRouter>
        <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <TopBar
                currentpageLabelOnTopBar={this.state.labelOnTopBar}
                currentLoggedInUser={this.state.currentLoggedInUser}
                handleLogout={this.handleLogout}
              />
            </Grid>
            <div className="main-topbar-buffer" />
            {this.state.isLoggedIn && (
              <Grid item sm={3}>
                <Paper className="main-grid-item">
                  <UserList />
                </Paper>
              </Grid>
            )}
            <Grid item sm={this.state.isLoggedIn ? 9 : 12}>
              <Paper className="main-grid-item">
                <Switch>
                  <Route exact path="/">
                    {this.state.isLoggedIn ? (
                      <Typography variant="body1">
                        Welcome to your photosharing app!
                      </Typography>
                    ) : (
                      <Redirect to="/admin/login" />
                    )}
                  </Route>
                  <Route
                    path="/users/:userId"
                    render={ (props) =>{
                      return this.state.isLoggedIn ? (
                        <UserDetail
                          {...props}
                          labelOnTopBar={this.changeLabelOnTopBar} />
                      ) : (
                        <Redirect to="/admin/login" />
                      );
                    }}
                      />
                  <Route
                    path="/photos/:userId"
                    render={ (props) =>
                      {
                        return this.state.isLoggedIn ? (
                          <UserPhotos
                            {...props}
                            labelOnTopBar={this.changeLabelOnTopBar} />
                        ) : (
                          <Redirect to="/admin/login" />
                        );
                      }}
                  />
                  <Route
                    path="/admin/login"
                    render={(props) =>
                      {
                        return this.state.isLoggedIn ? (
                          <Redirect to="/" />
                        ) : (
                          <LoginRegister
                            {...props}
                            toggleLogin={this.toggleLogin}
                            changeCurrentLoggedInUser={this.changeCurrentLoggedInUser}
                            handleLogout={this.handleLogout} />
                        );
                      }}
                  />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
          <Snackbar
            open={this.state.snackbarOpen}
            autoHideDuration={6000}
            onClose={this.handleSnackbarClose}
            message={this.state.snackbarMessage}
          />
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
