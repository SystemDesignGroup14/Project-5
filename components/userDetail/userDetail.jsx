import React from 'react';
import { Typography, Button} from '@mui/material';
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
    const { userId }=this.props.match.params;
    if (prevProps.match.params.userId !== userId || !this.state.user) {
      this.getUserDetails();
    }
  }

  getUserDetails() {
    const { userId }=this.props.match.params;
    FetchModel(`/user/${userId}`)
      .then((response) => {
        this.setState({ user: response.data });
      })
      .catch((error) => {
        console.error('There is an error:', error);
      });
  }

  render() {
    const { user } = this.state;
    return (
      <div>
        {user ? (
          <div>
            <div>
              <Button component={Link} to={`/photos/${user._id}`} variant="contained" color="primary">
                  User Photos
              </Button>
            </div>

            <div className="box-first box">
              <Typography variant="body1" className="heading">
                First Name
              </Typography>
              <Typography variant="body1" className="description">
                {user.first_name}
              </Typography>
            </div>
            <div className="box">
              <Typography variant="body1" className="heading">
                Last Name
              </Typography>
              <Typography variant="body1" className="description">
                {user.last_name}
              </Typography>
            </div>
            <div className="box">
              <Typography variant="body1" className="heading">
                Location
              </Typography>
              <Typography variant="body1" className="description">
                {user.location}
              </Typography>
            </div>
            <div className="box">
              <Typography variant="body1" className="heading">
                Description
              </Typography>
              <Typography variant="body1" className="description">
                {user.description}
              </Typography>
            </div>
            <div className="box">
              <Typography variant="body1" className="heading">
                Occupation
              </Typography>
              <Typography variant="body1" className="description">
                {user.occupation}
              </Typography>
            </div>
          </div>
        ) : (
          <Typography variant="body1" className="box">
            Loading user details
          </Typography>
        )}
      </div>
    );
  }
}

export default UserDetail;