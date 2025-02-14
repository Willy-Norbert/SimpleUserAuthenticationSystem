
# my project is hosted on Render
the link for it is https://simpleuserauthenticationsystem.onrender.com/

# Simple User Authentication System

This is a backend authentication system built using **Node.js (Express.js)**, **PostgreSQL**, **JWT (JSON Web Token)**, **bcrypt**, and tested using **Postman** but I also added simple front end for better checking system. 

## Features

- **User Signup:** Users can register with a username and password, and passwords are securely hashed using bcrypt.
- **User Login:** Users can log in with their credentials and receive a JWT token for authenticated access.
- **Password Hashing:** Passwords are stored securely using bcrypt hashing.
- **Protected Routes:** Users can access protected routes only after successful login and token validation.
- **Optional Password Reset:** Users can reset their passwords via email (optional feature).

## How to View / Test the API

You can test the API using tools like **Postman**. Here are the available endpoints:

- **POST /register:** Registers a new user.
- **POST /login:** Logs in the user and returns a JWT token.
- **GET /profile:** Returns the user details (protected route).

## Technologies Used

- **Node.js (Express.js)** for backend API development.
- **PostgreSQL** for database.
- **JWT (JSON Web Token)** for token-based authentication.
- **bcrypt** for password hashing.
- **Postman** for API testing.

## Libraries Installed

Here are the libraries used in this project and their installation commands:

1. **Express** for creating the backend API:
   ```bash
   npm install express
   ```

2. **PostgreSQL** for the database:
   ```bash
   npm install pg
   ```

3. **JWT (JSON Web Token)** for token-based authentication:
   ```bash
   npm install jsonwebtoken
   ```

4. **bcrypt** for password hashing:
   ```bash
   npm install bcrypt
   ```

5. **dotenv** for managing environment variables:
   ```bash
   npm install dotenv
   ```

6. **cors** for enabling Cross-Origin Request Sharing (CORS):
   ```bash
   npm install cors
   ```

7. **body-parser** for parsing incoming request bodies:
   ```bash
   npm install body-parser
   ```

8. **nodemon** for automatic server restarts during development:
   ```bash
   npm install --save-dev nodemon
   ```

## Installation

1. Clone the repository to your local machine:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install the required dependencies:
   ```bash
   npm install 
   ```
3. Install other required dependencies for better auto run:
   ```bash
   npm install nodemn
   ```

4. Set up PostgreSQL and create the necessary database and tables.

5. Configure environment variables (e.g., JWT secret key, database connection settings).

6. Start the server:
   ```bash
   npm start
   ```

7. Test the API using Postman or any other API testing tool.

## How to Deploy

You can deploy the backend using services like **Render**, **Heroku**, or **Vercel**. Follow the respective deployment guides for these platforms.

## Resources

- [Flask JWT Authentication](https://flask-jwt-extended.readthedocs.io/en/stable/)
- [Express & JWT Authentication](https://www.digitalocean.com/community/tutorials)
- [bcrypt for Password Hashing](https://www.npmjs.com/package/bcrypt)
- [Postman API Testing Guide](https://learning.postman.com/docs/)

