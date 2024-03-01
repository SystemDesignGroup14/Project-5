import React from 'react';
import { Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './userDetail.css';
import FetchModel from '../../lib/fetchModelData';


const renderDetail = (label, value) => (
  <div className="box">
    <Typography variant="body1" className="heading">
      {label}
    </Typography>
    <Typography variant="body1" className="description">
      {value}
    </Typography>
  </div>
);

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
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
          selectedUser: `Details of: ${response.data.first_name} ${response.data.last_name}`,
        });
        
        this.props.labelOnTopBar(this.state.selectedUser);
      })
      .catch((error) => console.error('There is an error:', error));
  };

  render() {
    const { user } = this.state;

    return (
      <div>
        {user ? (
          <div>
            <Button
              component={Link}
              to={`/photos/${user._id}`}
              variant="contained"
              color="primary"
            >
              User Photos
            </Button>
            {renderDetail('First Name', user.first_name)}
            {renderDetail('Last Name', user.last_name)}
            {renderDetail('Location', user.location)}
            {renderDetail('Description', user.description)}
            {renderDetail('Occupation', user.occupation)}
          </div>
        ) : (
          <Typography variant="body1" className="box">Loading user details...</Typography>
        )}
      </div>
    );
  }
}

export default UserDetail;
