import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { Typography, TextField, Button, Box } from '@mui/material';
import './LoginRegister.css';
import axios from 'axios';

function LoginRegister({ toggleLogin, changeCurrentLoggedInUser }) {
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [occupation, setOccupation] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("/admin/login", { login_name: loginName, password: password });
      console.log(response.data);
      if (response.data) {
        toggleLogin(true);
        changeCurrentLoggedInUser(`${response.data.first_name} ${response.data.last_name}`);
      } else {
        toggleLogin(false);
        setLoginError('Login failed, please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toggleLogin(false);
      setLoginError('Failed to login, please check your username and password.');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post("/user", {
        first_name: firstName,
        last_name: lastName,
        login_name: loginName,
        password: password,
        location: location,
        description: description,
        occupation: occupation
      });
      console.log(response.data);
      setRegistrationSuccess(true);
      setShowRegistrationForm(false); // Hide registration form after successful registration
      setLoginError('');
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationSuccess(false);
      setRegistrationError('Failed to register, please try again.');
    }
  };

  useEffect(() => {
    const sessionCookie = Cookies.get('connect.sid');
    if (sessionCookie) {
      toggleLogin(true);
    }
  }, [toggleLogin]);

  return (
    <Box className="loginRegister" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Typography variant="h4" component="h1" gutterBottom>Login</Typography>
      <Box component="form" onSubmit={handleLogin} width="100%" maxWidth={360}>
        <TextField
          fullWidth
          variant="outlined"
          label="Username"
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          variant="outlined"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" className="loginButton">
          Login
        </Button>
        {loginError && (
          <Typography color="error" variant="body2">
            {loginError}
          </Typography>
        )}
      </Box>

      {/* Display Registration Form if showRegistrationForm is true */}
      {showRegistrationForm && (
        <Box component="form" onSubmit={handleRegister} width="100%" maxWidth={360}>
          <TextField
            fullWidth
            variant="outlined"
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Occupation"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Username"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" className="registerButton">
            Register
          </Button>
          {registrationError && (
            <Typography color="error" variant="body2">
              {registrationError}
            </Typography>
          )}
          {registrationSuccess && (
            <Typography color="success" variant="body2">
              Registration successful!
            </Typography>
          )}
        </Box>
      )}

      {/* Show Register Button if registration form is not displayed */}
      {!showRegistrationForm && (
        <Button variant="contained" onClick={() => setShowRegistrationForm(true)}>
          Register
        </Button>
      )}
    </Box>
  );
}

export default LoginRegister;
