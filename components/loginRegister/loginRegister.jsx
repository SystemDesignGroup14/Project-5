import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { Typography, TextField, Button, Box } from '@mui/material';
import './LoginRegister.css';
import axios from 'axios';

function LoginRegister({ toggleLogin, changeCurrentLoggedInUser }) {
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

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
    </Box>
  );
}

export default LoginRegister;
