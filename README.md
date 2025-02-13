# Simple User Authentication System

## Project Overview

**Title:** Building a Simple User Authentication System  
**Level:** Beginner  
**Duration:** 2-3 weeks  
**Project Category:** Backend Development  
**Technologies:** Node.js (Express.js), PostgreSQL, JWT (JSON Web Token), bcrypt

## Objectives

- Understand how user authentication works in backend systems.
- Learn how to securely store user credentials.
- Implement login, signup, and token-based authentication.

## Skills Involved

- REST API development
- Secure password storage (hashing with bcrypt)
- JWT-based authentication

## Project Description

This project aims to create a backend authentication system that allows users to register, log in, and access protected routes using JWT tokens.

## Project Features

- **User Signup:** Users can create an account with a username and password.
- **User Login:** Users can log in with their credentials and receive a JWT token.
- **Password Hashing:** Securely store passwords using bcrypt.
- **Protected Routes:** Users can only access certain API endpoints if they are logged in.

## Steps to Complete

1. **Set Up the Development Environment:**

   - Install Express.js and other required dependencies.

2. **Create Database Models:**

   - Define the user schema in PostgreSQL.

3. **Implement API Routes:**

   - `POST /register`: Registers a new user (stores hashed password).
   - `POST /login`: Authenticates user and returns a JWT token.
   - `GET /profile`: Returns user details (protected route).

4. **Secure the API:**

   - Implement JWT authentication middleware to protect routes.

5. **Test the API:**

   - Use Postman to test the authentication system.

6. **(Optional) Password Reset Feature:**
   - Allow users to reset their password via email.

## Deliverables

- A working authentication system with signup, login, and JWT-based authentication.
- API documentation explaining how to use the service.
- A GitHub repository with the source code.

## Evaluation Criteria

- Proper user authentication and session management.
- Secure password hashing and token handling.
- API documentation and clean code structure.

## Resources

- [Flask JWT Authentication](https://flask-jwt-extended.readthedocs.io/en/stable/)
- [Express & JWT Authentication](https://www.digitalocean.com/community/tutorials)
- [bcrypt for Password Hashing](https://www.npmjs.com/package/bcrypt)
- [Postman API Testing Guide](https://learning.postman.com/docs/)

## Instructions and Guidelines

- Store passwords securely using bcrypt.
- Validate user inputs to prevent security issues.
- Ensure JWT tokens expire after a set period for security.
- Test authentication using tools like Postman.
