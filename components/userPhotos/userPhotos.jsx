import React, { Component } from 'react';
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField} from '@mui/material';
import { Link } from 'react-router-dom';
import './userPhotos.css';
import axios from 'axios';
import TopBar from '../topBar/TopBar';

class UserPhotos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      user: null,
      comment: null,
      newComment: '', // Updated state name
      addComment: false, // Updated state name
      currentPhotoId: null, // Updated state name
    };
    // Bind event handlers to the instance
    this.handleShowAddComment = this.handleShowAddComment.bind(this);
    this.handleNewCommentChange = this.handleNewCommentChange.bind(this);
    this.handleCancelAddComment = this.handleCancelAddComment.bind(this);
    this.handleSubmitAddComment = this.handleSubmitAddComment.bind(this);
  }

  // Function to fetch user photos and details
  async fetchUserPhotosAndDetails() {
    const { userId } = this.props.match.params;

    try {
      const photosResponse = await axios.get(`/photosOfUser/${userId}`);
      this.setState({ photos: photosResponse.data });

      const userDetailsResponse = await axios.get(`/user/${userId}`);
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
  }

  // Event handler to show the add comment dialog
  handleShowAddComment(photoId) {
    this.setState({
      addComment: true,
      currentPhotoId: photoId,
    });
  }

  // Event handler for changing the new comment text
  handleNewCommentChange(event) {
    this.setState({
      newComment: event.target.value,
    });
  }

  // Event handler for canceling the add comment dialog
  handleCancelAddComment() {
    this.setState({
      addComment: false,
      newComment: '',
      currentPhotoId: null,
    });
  }

  // Event handler for submitting the new comment
  async handleSubmitAddComment() {
    const { currentPhotoId, newComment } = this.state;

    try {
      await axios.post(`/commentsOfPhoto/${currentPhotoId}`, { comment: newComment });
      console.log('Comment added successfully');
      // Update state to close the dialog and reset newComment
      this.setState({
        addComment: false,
        newComment: '',
        currentPhotoId: null,
      });
      // Refetch user photos and details to update comments
      this.fetchUserPhotosAndDetails();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
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

  render() {
    const { user, comment, photos, addComment, newComment } = this.state;

    return (
      <div>
        {/* Render User Details Button */}
        <Button
          component={Link}
          to={`/users/${this.props.match.params.userId}`}
          variant="contained"
          className="ButtonLink"
        >
          User Details
        </Button>

        {/* Render User Photos Header */}
        <Typography variant="h4" className="UserPhotosHeader">
          User Photos
        </Typography>

        {/* Render Photos */}
        <div className="photo-list">
          {photos.map((photo) => (
            <div key={photo._id} className="photo-comment-container">
              <img
                src={`/images/${photo.file_name}`}
                alt={`User's pic is not available`}
                className="photo-image"
              />
              {/* Render Comments */}
              {photo.comments && photo.comments.length > 0 && (
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Comments:</p>
                  {photo.comments.map((comment) => (
                    <div key={comment._id} className="photo-comment-container" style={{ marginTop: '16px' }}>
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
              {/* Add Comment Button */}
              <Button variant="contained" onClick={() => this.handleShowAddComment(photo._id)}>
                Add Comment
              </Button>
            </div>
          ))}
        </div>

        {/* Render User Comment */}
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

        {/* Render Add Comment Dialog */}
        <Dialog open={addComment}>
          <DialogTitle>Add Comment</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter a new comment for the photo.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="comment"
              label="Comment"
              multiline
              rows={4}
              fullWidth
              variant="standard"
              onChange={this.handleNewCommentChange}
              value={newComment}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCancelAddComment}>Cancel</Button>
            <Button onClick={this.handleSubmitAddComment}>Add</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default UserPhotos;
