import React from 'react';
import { Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './userDetail.css';
import FetchModel from '../../lib/fetchModelData';

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
          selectedUser: "Details of: "+response.data.first_name +" " + response.data.last_name
        });
        this.props.labelOnTopBar(this.state.selectedUser);
      })
      .catch((error) => console.error('There is an error:', error));
  };

  static renderDetail = (label, value) => (
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
        {this.state.user ? (
          <div>
            <div>
              <Button
                component={Link}
                to={`/photos/${this.state.user._id}`}
                variant="contained"
                color="primary"
              >
                User Photos
              </Button>
            </div>
            {this.renderDetail('First Name', this.state.user.first_name)}
            {this.renderDetail('Last Name', this.state.user.last_name)}
            {this.renderDetail('Location', this.state.user.location)}
            {this.renderDetail('Description', this.state.user.description)}
            {this.renderDetail('Occupation', this.state.user.user.occupation)}
          </div>
        ) : (
          <Typography variant="body1" className="box">Loading user details...</Typography>
        )}
      </div>
    );
  }
}

export default UserDetail;
