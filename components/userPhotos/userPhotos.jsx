import React, { Component } from 'react';
import { Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './userPhotos.css';
import FetchModel from '../../lib/fetchModelData';


const renderComments = (comments) => {
  return (
    <div>
      <p style={{ margin: 0, fontWeight: 'bold' }}>Comments:</p>
      {comments.map((comment) => (
        <div key={comment._id} className="user-photo-box" style={{ marginTop: '16px' }}>
          <p>{comment.comment}</p>
          <p>
            <b>Commented ON:</b> {comment.date_time}
          </p>
          <p>
            <b>Commented BY:</b>
            <Link to={`/users/${comment.user._id}`}>
              {comment.user.first_name} {comment.user.last_name}
            </Link>
          </p>
        </div>
      ))}
    </div>
  );
};


const renderPhotos = (photos, renderCommentsCallback) => {
  return photos.map((photo) => (
    <div key={photo._id} className="photo-comment-container">
      <img
        src={`/images/${photo.file_name}`}
        alt={`User's pic is not available`}
        className="photo-image"
      />
      {photo.comments && photo.comments.length > 0 && renderCommentsCallback(photo.comments)}
    </div>
  ));
};

class UserPhotos extends Component {

  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      user: null,
      comment: null,
    };
  }

  componentDidMount() {
    this.fetchUserPhotosAndDetails();
  }

  componentDidUpdate(prevProps) {
    const { userId } = this.props.match.params;
    if (prevProps.match.params.userId !== userId) {
      this.fetchUserPhotosAndDetails();
    }
  }

  fetchUserPhotosAndDetails = async () => {
    const { userId } = this.props.match.params;

    try {
      const photosResponse = await FetchModel(`/photosOfUser/${userId}`);
      this.setState({ photos: photosResponse.data });

      const userDetailsResponse = await FetchModel(`/user/${userId}`);
      if (userDetailsResponse.data) {
        const userDetails = userDetailsResponse.data;
        this.setState({
          user: userDetails,
          comment: userDetails.comment,
        });
        this.props.labelOnTopBar(`Photos of: ${userDetails.first_name} ${userDetails.last_name}`);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  render() {
    const { user, comment, photos } = this.state;

    return (
      <div>
        <Button
          component={Link}
          to={`/users/${this.props.match.params.userId}`}
          variant="contained"
          className="ButtonLink"
        >
          User Details
        </Button>

        <Typography variant="h4" className="UserPhotosHeader">
          User Photos
        </Typography>

        <div className="photo-list">{renderPhotos(photos, renderComments)}</div>

        {user && comment && (
          <div className="user-photo-box" style={{ marginTop: '16px' }}>
            <Typography variant="caption" className="user-photo-title">
              Comment
            </Typography>
            <Typography variant="body1" className="user-photo-value">
              {comment}
            </Typography>
          </div>
        )}
      </div>
    );
  }
}

export default UserPhotos;
