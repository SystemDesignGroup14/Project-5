/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const async = require("async");
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(session({ secret: "secretKey", resave: false, saveUninitialized: false }));
app.use(bodyParser.json());

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

mongoose.Promise = require("bluebird");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {

useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected...'))
.catch(err => console.error(err));

const db= mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log("We're connected to the database!");
});

// Session check middleware
const checkSession = (req, res, next) => {
  if (!req.session.userId) {
      // Instead of redirecting, send a 401 status code
      return res.status(401).send('Unauthorized - No active session found');
  }
  return next();
};

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '/images');
    // console.log('Upload directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use the original filename from the client-side
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });


/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user - adds a new user
 */
app.post("/user", function (request, response) {
  const first_name = request.body.first_name || "";
  const last_name = request.body.last_name || "";
  const location = request.body.location || "";
  const description = request.body.description || "";
  const occupation = request.body.occupation || "";
  const login_name = request.body.login_name || "";
  const password = request.body.password || "";
  if (first_name === "") {
    console.error("Error in /user", first_name);
    response.status(400).send("first_name is required");
    return;
  }
  if (last_name === "") {
    console.error("Error in /user", last_name);
    response.status(400).send("last_name is required");
    return;
  }
  if (login_name === "") {
    console.error("Error in /user", login_name);
    response.status(400).send("login_name is required");
    return;
  }
  if (password === "") {
    console.error("Error in /user", password);
    response.status(400).send("password is required");
    return;
  }

  User.exists({login_name: login_name}, function (err, returnValue){
    if (err){
      console.error("Error in /user", err);
      response.status(500).send();
    } else if (returnValue) {
        console.error("Error in /user", returnValue);
        response.status(400).send();
      } else {
        User.create(
            {
              _id: new mongoose.Types.ObjectId(),
              first_name: first_name,
              last_name: last_name,
              location: location,
              description: description,
              occupation: occupation,
              login_name: login_name,
              password: password
            })
            .then((user) => {
              request.session.user_id = user._id;
              session.user_id = user._id;
              response.end(JSON.stringify(user));
            })
            .catch(errr => {
              console.error("Error in /user", errr);
              response.status(500).send();
            });
      }
  });
});




/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list",checkSession ,function (request, response) {
  User.find({},'_id first_name last_name', function (err, users) {
    if (err) {
      console.error("Error fetching users:", err);
      response.status(500).send("Internal Server Error");
      return;
    }
    response.status(200).json(users);
  });
});


/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", checkSession, function (request, response) {
  const userId = request.params.id;

  if (!mongoose.isValidObjectId(userId)) {
    return response.status(400).send("Invalid user ID");
  }

  User.findById(userId)
    .select('-__v')
    .then(user => {
      if (!user) {
        return response.status(400).send("User not found");
      }
      const userResponse = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        location: user.location,
        description: user.description,
        occupation: user.occupation
      };

      response.status(200).json(userResponse);
    })
    .catch(err => {
      console.error("Error fetching user:", err);
      response.status(500).send("Internal Server Error");
    });
    // return;
});

app.get("/user/list", checkSession, function (request, response) {
  console.log('API CALL');
  const projection = {
    _id:1,
    first_name:1,
    last_name:1
  };
    User.find({}, projection, function (err, userDetails) {
      if (err) {
        console.error("Error in /user/list:", err);
        response.status(500).send(JSON.stringify(err));
      } else if (userDetails.length === 0) {
        response.status(400).send("Missing user list");
      } else {
        response.end(JSON.stringify(userDetails));
      }
    });
});


/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get('/photosOfUser/:id', checkSession, async (req, response) => {
  const userId = req.params.id;
  const currentLoggedUserId = req.query.currentLoggedUserId;
  console.log( `params: ${currentLoggedUserId}` );

  if (!mongoose.isValidObjectId(userId)) {
    return response.status(400).send("Invalid user ID");
  }

  try {
    const userExists = await User.findById(userId);
    if (!userExists) {
      return response.status(404).send("User not found");
    }

    let current_photos = await Photo.find({ user_id: userId }).lean();
    let photos = [];
    // if( userId === currentLoggedUserId ){
    //   photos = current_photos;
    // } else{
    //   current_photos.forEach( (photo => {
    //     if(( !photo.isPrivate && photo.sharingList.includes( currentLoggedUserId )) ){
    //       photos.push(photo);
    //     }
    //   }) );
    // }

    if (userId === currentLoggedUserId) {
      console.log(`userId: ${userId}, ${currentLoggedUserId}`);
      photos = current_photos;
    } else {
      current_photos.forEach((photo) => {
        if (
          (!photo.isPrivate && (photo.sharingList.includes(currentLoggedUserId) || photo.sharingList.length === 0))
        ){
          photos.push( photo );
        }
      });
    }
    
    const promises = photos.map(photo => Promise.all(photo.comments.map(async comment => {
        const user = await User.findById(comment.user_id, '_id first_name last_name');
        return {
          ...comment,
          user: {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name
          }
        };
      }))
      .then(commentsWithUser => {
        photo.comments = commentsWithUser; // Assign the enhanced comments back to the photo
        // photo.num_likes = photo.num_likes; // Assign the number of likes to the photo
        return photo;
      })
    );

    photos = await Promise.all(promises); // Ensure all photos have their comments enhanced

    photos.sort((a, b) => {
      if (a.num_likes !== b.num_likes) {
        return b.num_likes - a.num_likes; // Sort descending order
      } else {
        return b.date_time - a.date_time; // Sort  date_time in descending order (most recent first)
      }
    });

    return response.status(200).json(photos);
  } catch (error) {
    console.error("Error processing request:", error);
    return response.status(500).send("Internal Server Error");
  }
});

app.put('/likephoto/:id', checkSession, async (req, response) => {
  const photoId = req.params.id;
  const userId = req.session.userId;

  if (!mongoose.isValidObjectId(photoId) || !mongoose.isValidObjectId(userId)) {
    return response.status(400).send("Invalid ID");
  }

  try {
    // Check if the photo exists
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return response.status(404).send("Photo not found");
    }

    // Determine if the user has already liked the photo
    const alreadyLiked = photo.likes.some(like => like.user_id.equals(userId));

    if (alreadyLiked) {
      // Unlike the photo
      await Photo.updateOne(
        { _id: photoId },
        {
          $pull: { likes: { user_id: userId } },
          $inc: { num_likes: -1 }
        }
      );
      // Remove like from currentLoggedInUser's likedPhotos
      await User.updateOne(
        { _id: userId },
        { $pull: { likedPhotos: { photo_id_of_photo_owner: photoId } } }
      );
    } else {
      // Like the photo
      await Photo.updateOne(
        { _id: photoId },
        {
          $push: { likes: { user_id: userId, date_time: new Date() } },
          $inc: { num_likes: 1 }
        }
      );
      // Add like to currentLoggedInUser's likedPhotos
      await User.updateOne(
        { _id: userId },
        {
          $push: { likedPhotos: { _id: new mongoose.Types.ObjectId(), photo_id_of_photo_owner: photoId, user_id_of_photo_owner: photo.user_id } }
        }
      );
    }

    return response.status(200).json({ message: `Photo ${alreadyLiked ? 'unliked' : 'liked'}` });
  } catch (error) {
    console.error("Error processing request:", error);
    return response.status(500).send("Internal Server Error");
  }
});







app.post("/admin/login", async function (request, response) {
  const { login_name,password } = request.body;

  try {
    if (!login_name || !password) {
      return response.status(400).send("Username and password is required");
    }
    const user = await User.findOne({ login_name: login_name});
    console.log("user:", user);
    if (!user) {
      return response.status(400).send("Username  does not exist");
    }
    if (user.password !== password) {
      return response.status(400).send("Incorrect password");
    }
     request.session.userId = user._id;
    
    return response.status(200).send(user);
  } catch (error) {
    console.error("Error during login:", error);
    return response.status(500).send("Internal Server Error");
  }

});

app.post("/admin/logout", function (request, response) {
  if (request.session) {
      request.session.destroy(err => {
          if (err) {
              console.error("Logout error:", err);
              response.status(500).send("Error logging out");
          } else {
              response.status(200).send("Logout successful");
          }
      });
  } else {
      response.status(400).send("Not logged in");
  }
});



// Upload photo endpoint
app.post('/photos/new', checkSession, upload.single('uploadedphoto'), async (req, res) => {
  console.log("3");
  //let response;
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  
  try {

    const sharingList = JSON.parse(req.body.sharingList || "[]");
    const isPrivate = req.body.isPrivate;

    const newPhoto = new Photo({
      file_name: req.file.filename,
      user_id: req.session.userId,
      date_time: new Date(),
      comments: [],
      sharingList: sharingList,
      isPrivate: isPrivate
    });
    
    // newPhoto.save().then((photo) => {
      
    //   res.status(200).send('ok');
    //   console.log("4");
    // });
    await newPhoto.save();
    return res.status(200).send('Photo uploaded successfully');
  } catch (error) {
    console.error('Error uploading photo:', error);
    return res.status(500).send('Internal Server Error');
  }
});


app.post("/commentsOfPhoto/:photo_id", checkSession, async (req, res) => {
  const { photo_id } = req.params;
  const { comment } = req.body;
  const userId = req.session.userId;

  if (!comment) {
    return res.status(400).send("Comment text is required");
  }

  try {
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return res.status(404).send("Photo not found");
    }

    // Add the comment to the photo's comments array
    photo.comments.push({
      comment: comment,
      date_time: new Date(),
      user_id: userId
    });

    await photo.save();

    return res.status(200).send("Comment added successfully");
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.delete("/deleteaccount", checkSession, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).send("Unauthorized - No active session found");
  }

  try {
    // Retrieve the user document to access liked photos
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Remove all likes by this user from other photos using an atomic operation
    const likedPhotos = user.likedPhotos || [];
    const updatePromises = likedPhotos.map(async likedPhoto => {
        await Photo.updateOne(
            { _id: likedPhoto.photo_id_of_photo_owner },
            { $pull: { likes: { user_id: userId } }, $inc: { num_likes: -1 } }
        );
    });

    await Promise.all(updatePromises);


    // Fetch the list of photo filenames before deleting them from the database
    const photos = await Photo.find({ user_id: userId });

    // Delete the user's photos
    await Photo.deleteMany({ user_id: userId });

    // Delete the photo files from the /images folder
    for (const photo of photos) {
      const filePath = path.join(__dirname, '/images', photo.file_name);
      fs.unlink(filePath, err => {
        if (err) {
          console.error("Failed to delete photo file:", err);
        }
      });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Destroy the session after deleting the account
    req.session.destroy(err => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).send("Error logging out");
      }
      res.status(200).send("Account and related data deleted successfully");
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.delete("/deletecommentbyid", checkSession, async (req, res) => {
  const userId = req.session.userId;
  const commentId = req.body.commentId;

  if (!userId) {
    return res.status(401).send("Unauthorized - No active session found");
  }

  try {
    // Locate the photo containing the comment and pull (remove) the comment from the array
    const updateResult = await Photo.updateOne(
      { "comments._id": commentId, "comments.user_id": userId },
      { $pull: { comments: { _id: commentId } } }
    );

    // Check if the comment was successfully found and deleted
    if (updateResult.modifiedCount === 0) {
      return res.status(404).send("Comment not found or does not belong to user");
    }

    return res.status(200).send("Comment deleted successfully");
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/deletephotobyid", checkSession, async (req, res) => {
  const userId = req.session.userId;
  const photoId = req.body.photoId;
  if (!userId) {
    return res.status(401).send("Unauthorized - No active session found");
  }

  try {
    // Check if file belongs to the actual user and then delete
    const photo = await Photo.findOne({ user_id: userId, _id: photoId }).exec();
    if (!photo) {
      return res.status(404).send("Photo not found or does not belong to user");
    }
    // delete file in local
    const filePath = path.join(__dirname, '/images', photo.file_name);
    fs.unlink(filePath, async err => {
      if (err) {
        console.error("Failed to delete photo file:", err);
        return res.status(500).send("Failed to delete photo file");
      }
      // delete the user's photo record in the database
      await Photo.deleteOne({ _id: photo._id });

      return res.status(200).send("Photo deleted successfully");
    });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).send("Internal Server Error");
  }
});




const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});