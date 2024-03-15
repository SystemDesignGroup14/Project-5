import React, { Component } from 'react';
import { Typography, List, ListItem, Divider, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './userList.css';
import axios from "axios";
class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
    };
  }

  componentDidMount() {
    this.fetchUserList();
  }

  fetchUserList() {
    
    axios.get('/user/list')
      .then((response) => {
        this.setState({ users: response.data });
        console.log('User list:', response.data);
      })
      .catch((error) => {
        console.error('Error fetching user list:', error);
      });
  }

  renderUserList() {
    return this.state.users.map(user => (
      <div key={user._id}> 
        <ListItem>
          <Button
            component={Link}
            to={`/users/${user._id}`} 
            className="userLink" 
          >
            {user.first_name}
          </Button>
        </ListItem>
        <Divider />
      </div>
    ));
  }
  

  render() {
    return (
      <div>
      <div className="usersLayout">
        <Typography variant="h6" className="listTitle">
          Users
        </Typography>
        <List>
          {this.renderUserList()}
        </List>
       
      </div>
      </div>
    );
  }
}

export default UserList;
