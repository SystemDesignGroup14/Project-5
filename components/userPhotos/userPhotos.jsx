import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './userPhotos.css';
import TopBar from '../topBar/TopBar';
import FetchModel from '../../lib/fetchModelData';

function UserPhotos({ match }) {
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState(null);

  useEffect(() => {
    fetchUserPhotosAndDetails();
  }, [match.params.userId]);

  const fetchUserPhotosAndDetails = async () => {
    const { userId } = match.params;

    try {
      const photosResponse = await FetchModel(`/photosOfUser/${userId}`);
      setPhotos(photosResponse.data);

      const userDetailsResponse = await FetchModel(`/user/${userId}`);
      const userDetails = userDetailsResponse.data;

      setUser(userDetails);
      setComment(userDetails ? userDetails.comment : null);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const topNameValue = user ? `photos of ${user.first_name} ${user.last_name}` : '';

  return (
    <div>
      <TopBar currentpageLabelOnTopBar={topNameValue} />

      <Button
        component={Link}
        to={`/users/${match.params.userId}`}
        variant="contained"
        className="ButtonLink"
      >
        User Details
      </Button>

      <Typography variant="h4" className="UserPhotosHeader">
        User Photos
      </Typography>

      <div className="photo-list">
        {photos.map((photo) => (
          <div key={photo._id} className="photo-item">
            <img
              src={`/images/${photo.file_name}`}
              alt={`User ${match.params.userId}'s Photo`}
              className="photo-image"
            />

            <div className="user-photo-box" style={{ marginTop: '16px' }}>
              <Typography variant="caption" className="user-photo-title">
                Date Taken
              </Typography>

              <Typography variant="body1" className="user-photo-value">
                {photo.date_time}
              </Typography>
            </div>

            {photo.comments && photo.comments.length > 0 && (
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Comments:</p>

                {photo.comments.map((comment) => (
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
            )}
          </div>
        ))}
      </div>

      {user ? (
        <div>
          {comment && (
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
      ) : (
        <Typography variant="body1" className="user-detail-box loading-text">
          Loading user details...
        </Typography>
      )}
    </div>
  );
}

export default UserPhotos;
