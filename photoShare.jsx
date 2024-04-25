import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { Grid, Typography, Paper, Snackbar } from "@mui/material";
import axios from "axios";
import TopBar from "./components/topBar/TopBar";
import UserList from "./components/userList/userList";
import UserDetail from "./components/userDetail/userDetail";
import UserPhotos from "./components/userPhotos/userPhotos";
import LoginRegister from "./components/loginRegister/loginRegister";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      labelOnTopBar: undefined,
      isLoggedIn: false,
      loggedInUserId: undefined,
      currentLoggedInUser: undefined,
      snackbarOpen: false,
      snackbarMessage: '',
    };
    // Bind necessary methods
    this.changeLabelOnTopBar = this.changeLabelOnTopBar.bind(this);
    this.changeCurrentLoggedInUser = this.changeCurrentLoggedInUser.bind(this);
    this.toggleLogin = this.toggleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleDeleteAccount = this.handleDeleteAccount.bind(this);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
  }

  changeLabelOnTopBar(label) {
    this.setState({ labelOnTopBar: label });
  }

  changeCurrentLoggedInUser(username, loggedInUserId) {
    this.setState({
      currentLoggedInUser: username,
      loggedInUserId: loggedInUserId,
    });
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
          loggedInUserId: undefined,
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

  handleDeleteAccount() {
    console.log("Delete account button is clicked!");
    axios.delete("/deleteaccount")
      .then(() => {
        console.log("Account Deleted Successfully!");
        this.setState({
          isLoggedIn: false,
          loggedInUserId: undefined,
          currentLoggedInUser: undefined,
          snackbarOpen: true,
          snackbarMessage: "Account Deleted Successfully!",
        });
      }).catch((error) => {
        console.log("Unable to delete account", error);
        this.setState({
          snackbarOpen: true,
          snackbarMessage: "Account Deletion failed",
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
                handleDeleteAccount={this.handleDeleteAccount}
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
                    render={(props) =>
                      this.state.isLoggedIn ? (
                        <UserDetail
                          {...props}
                          labelOnTopBar={this.changeLabelOnTopBar}
                        />
                      ) : (
                        <Redirect to="/admin/login" />
                      )
                    }
                  />
                  <Route
                    path="/photos/:userId"
                    render={(props) =>
                      this.state.isLoggedIn ? (
                        <UserPhotos
                          {...props}
                          labelOnTopBar={this.changeLabelOnTopBar}
                          loggedInUserId={this.state.loggedInUserId}
                        />
                      ) : (
                        <Redirect to="/admin/login" />
                      )
                    }
                  />
                  <Route
                    path="/admin/login"
                    render={(props) =>
                      this.state.isLoggedIn ? (
                        <Redirect to="/" />
                      ) : (
                        <LoginRegister
                          {...props}
                          toggleLogin={this.toggleLogin}
                          changeCurrentLoggedInUser={this.changeCurrentLoggedInUser}
                          handleLogout={this.handleLogout}
                        />
                      )
                    }
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
