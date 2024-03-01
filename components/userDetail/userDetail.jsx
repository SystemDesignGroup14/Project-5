import React from 'react';
import { Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './userDetail.css';
import FetchModel from '../../lib/fetchModelData';
import TopBar from '../topBar/TopBar';

class UserDetail extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      selectedUser: ''
    };
  }

  componentDidMount() {
    this.getUserDetails();
  }

  componentDidUpdate(prevProps) {
    const { userId } = this.props.match.params;
    if (prevProps.match.params.userId !== userId) {
      this.getUserDetails();
    }
  }

  getUserDetails = () => {
    const { userId } = this.props.match.params;
    FetchModel(`/user/${userId}`)
      .then((response) => {
        this.setState({
          user: response.data,
          selectedUser: "Details of: "+response.data.first_name +" " + response.data.last_name
        });
        this.props.labelOnTopBar(this.state.selectedUser);
      })
      .catch((error) => console.error('There is an error:', error));
  };

  renderDetail = (label, value) => (
    <div className="box">
      <Typography variant="body1" className="heading">
        {label}
      </Typography>
      <Typography variant="body1" className="description">
        {value}
      </Typography>
    </div>
  );

  render() {

    return (
      <div>
        {user ? (
          <div>
            <div>
              <Button
                component={Link}
                to={`/photos/${user._id}`}
                variant="contained"
                color="primary"
              >
                User Photos
              </Button>
            </div>
            {this.renderDetail('First Name', user.first_name)}
            {this.renderDetail('Last Name', user.last_name)}
            {this.renderDetail('Location', user.location)}
            {this.renderDetail('Description', user.description)}
            {this.renderDetail('Occupation', user.occupation)}
          </div>
        ) : (
          <Typography variant="body1" className="box">Loading user details...</Typography>
        )}
      </div>
    );
  }
}

export default UserDetail;
