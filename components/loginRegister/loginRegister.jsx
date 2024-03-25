import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './LoginRegister.css';
import axios from 'axios';

function LoginRegister({ toggleLogin }) {
  const [loginName, setLoginName] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("/admin/login", { login_name: loginName });
      console.log(response);
      toggleLogin(true); // Call toggleLogin with true upon successful login, this helps in photoshare.jsx
    } catch (error) {
      console.error('There is an error:', error);
      //Todo : display error
    }
  };

  // Check if session cookie exists to determine if the user is logged in
  useEffect(() => {
    const sessionCookie = Cookies.get('connect.sid'); // The name 'connect.sid' is default for express-session
    if (sessionCookie) {
      toggleLogin(true); // Use toggleLogin to set login status
    }
  }, [toggleLogin]);

  return (
    <div className="loginRegister">
      <div className="login">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
          />
          <button type="submit" className="loginButton">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginRegister;
