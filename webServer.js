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
mongoose.connect("mongodb://root:example@127.0.0.1:27017/project6?authSource=admin", {
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
  next();
};

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

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
app.get("/user/:id",checkSession, function (request, response) {
  const userId = request.params.id;

  User.findById(userId)
       .select('-__v')
      .then(user => {
          if (!user) {
              return response.status(400).send("User not found");
          }
          response.status(200).json(user);
      })
      .catch(err => {
          console.error("Error fetching user:", err);
          response.status(500).send("Internal Server Error");
      });
});


/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get('/photosOfUser/:id', checkSession,async function (request, response) {
  const userId = request.params.id;

  try {
    const userExists = await User.findById(userId);
    if (!userExists) {
      response.status(404).send("User not found");
      return;
    }

    const photos = await Photo.find({ user_id: userId }).lean();
    if (photos.length === 0) {
      response.status(404).send("Photos not found");
      return;
    }

    // to run them in parallel
    const photosWithComments = await Promise.all(photos.map(async (photo) => {
      const commentsWithUser = await Promise.all(photo.comments.map(async (comment) => {
        const user = await User.findById(comment.user_id, '_id first_name last_name').lean();
        if (user) {
          comment.user = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name
          };
        }
        delete comment.user_id;
        return comment;
      }));

      photo.comments = commentsWithUser;
      return photo;
    }));

    response.status(200).json(photosWithComments);
  } catch (error) {
    console.error("Error processing request:", error);
    response.status(500).send("Internal Server Error");
  }
});




app.post("/admin/login", async function (request, response) {
  const { login_name } = request.body;

  try {
    if (!login_name) {
      return response.status(400).send("Username is required");
    }

    const user = await User.findOne({ login_name: login_name});
    if (!user) {
      return response.status(404).send("User does not exist");
    }

     request.session.userId = user._id;

    response.status(200).send("Login successful");
  } catch (error) {
    console.error("Error during login:", error);
    response.status(500).send("Internal Server Error");
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





const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});