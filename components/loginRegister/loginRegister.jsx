import React, { useState, useEffect } from "react";
import "./LoginRegister.css";
import axios from "axios";

function LoginRegister() {


  const signin = () => {
    let login_name = document.getElementById("login_name").value;

    axios.post("/admin/login", {
      login_name: login_name,
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error('There is an error:', error);
    });
    
  };


  const handleLogin = (event) => {
    event.preventDefault(); // Prevent form submission
    signin(); // Call signin function
  };

  return (
    <div className="loginRegister">
      <div className="login">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input id="login_name" type="text" placeholder="Username" />
          <button type="submit" className="loginButton">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginRegister;
