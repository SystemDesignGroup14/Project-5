import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import {Typography, TextField, Button, Box } from '@mui/material';
import './LoginRegister.css';
import axios from 'axios';

function LoginRegister({ toggleLogin }) {
  const [loginName, setLoginName] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("/admin/login", { login_name: loginName });
      console.log(response);
      toggleLogin(true); // Call toggleLogin with true upon successful login
    } catch (error) {
      console.error(error);
      setLoginError('Failed to login, please check your username');
    }
  };

  useEffect(() => {
    const sessionCookie = Cookies.get('connect.sid'); // The name 'connect.sid' is default for express-session
    if (sessionCookie) {
      toggleLogin(true); // Use toggleLogin to set login status
    }
  }, [toggleLogin]);

  return (
    <Box className="loginRegister" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>
      <Box component="form" onSubmit={handleLogin} width="100%" maxWidth={360}>
        <TextField
          fullWidth
          variant="outlined"
          label="Username"
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
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
    </Box>
  );
}

export default LoginRegister;
