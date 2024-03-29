# Group 12 Scrum Team
## Product Owner
Abheek Ranjan Das
## Scrum Master
Aravinda Reddy Gangalakunta 
## Developers
- Gokul Reddy Devarapalli
- Ramgopal Hyndav Bollepalli
- Danny Bylla

# Project 6: Full Stack Photo Sharing App

## Introduction

This project enhances our photo sharing application by integrating MongoDB for data persistence, allowing dynamic content management. We've encapsulated the environment setup using Docker Compose for ease of development and deployment.

## Setup

### Requirements

- Docker and Docker Compose optional
- Node.js (for local development)

### Getting Started

1. **Docker Compose Setup**: To spin up the MongoDB database , simply run:

```bash
docker-compose up -d
```

This command starts all required services as defined in our `docker-compose.yml` file, including the MongoDB instance and express.



You should see containers for both the MongoDB database and express.


## API Overview

With the integration of MongoDB, our app's API now directly interacts with a live database, enhancing data management and scalability. Here's a brief overview:

- **User List (`/user/list`)**: Fetches a list of all users from the MongoDB `User` collection, displaying essential details like name and occupation.

- **User Details (`/user/:id`)**: Retrieves detailed information about a specific user by their ID, including their photos and comments.

- **Photos of User (`/photosOfUser/:id`)**: Returns all photos uploaded by a specific user, along with comments on each photo, leveraging MongoDB for data retrieval.

### Example: Fetching User Details

```javascript
app.get("/user/:id", async (request, response) => {
  try {
    const user = await User.findById(request.params.id);
    if (!user) {
      return response.status(404).send("User not found");
    }
    response.json(user);
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});
```

This endpoint demonstrates how we interact with MongoDB to fetch and return user details, ensuring a dynamic and responsive application experience.






### Problem 1: Create the Photo Sharing Application
1. **UserList Component Implementation**
   - As a user, I want to see a list of all users so that I can navigate to their details.
2. **UserDetail Component Implementation**
   - As a user, I want to view details of a selected user so that I can know more about them.
3. **UserPhotos Component Implementation**
   - As a user, I want to view all photos of a selected user along with their comments so that I can engage with the content.
4. **TopBar Component Update**
   - As a user, I want to see my name on the left side of the TopBar and contextual information on the right side so that I know what content I'm viewing.

### Problem 2: Fetch model data from the web server
1. **FetchModel Implementation**
   - As a developer, I want to implement a function to fetch model data from the web server so that the app can operate with real data.
2. **Modify UserDetail Component**
   - As a developer, I want to update the UserDetail component to fetch user data from the server instead of using window.models.
3. **Modify UserList Component**
   - As a developer, I want to update the UserList component to fetch user list data from the server instead of using window.models.
4. **Modify UserPhotos Component**
   - As a developer, I want to update the UserPhotos component to fetch user photos and comments data from the server instead of using window.models.

### Problem 3: Database integration and endpoint conversion
1. **Integration with Database**
   - As a developer, I want our application to fetch data from a MongoDB database instead of static files, ensuring dynamic content delivery.
2. **Backend modifications handled successfully**
   - As a developer, I want to ensure that our backend modifications handle database interactions.
3. **Frontend integration with Axios**
   - As a developer, I want the frontend to use Axios for HTTP requests for modularity and added functionalities.

### Problem 5: User authentication and registration followed by photo commenting functionality
1. **Login Functionality**
   - As a developer, I want our application to have a robust user authentication system, enabling secure login and logout functionality to enhance user experience and security.
2. **Commenting Functionality**
   - As a developer, I want our application to include a commenting system, allowing users to engage with content by adding comments to photos.
3. **Photo Upload Feature**
   - As a developer, I want our application to support photo uploads, enabling users to share their photos and enhance community interaction.
4. **Enhanced registration functionality**
   - As a developer, I want to enhance our application's registration and login system, allowing for secure account creation and access management.
