Workverse: Professional Networking Platform

Workverse is a full-stack professional networking application built with Node.js (Express) for the backend API and database interaction, and React for the modern, dynamic frontend. It uses MySQL for persistence.

The application was recently rebranded and updated with file upload functionality, blue theme integration, and critical bug fixes for connection status synchronization.

✨ Features

User Authentication (JWT): Secure registration and login using JSON Web Tokens.

Networking: Users can send, accept, and manage connections.

Real-time Feed: Display of user posts with sorting options.

Image Uploads: Users can upload profile pictures and include images in their posts (files stored locally via Multer, paths stored in MySQL).

Comments & Hashtags: Full functionality for commenting on posts and searching by hashtags.

Role-Based Access: Employers (description=0) are the only users permitted to post job listings.

Messaging: Direct messaging between connected users.

⚙️ Technical Stack

Frontend: React (Vite)

Backend: Node.js, Express

Database: MySQL / MariaDB

Libraries: mysql2, jsonwebtoken (JWT), cors, and multer (for file handling).

🚀 Getting Started

Follow these steps to set up the Workverse application locally.

Prerequisites

You must have the following installed on your system:

Node.js (v16+) and npm

MySQL or MariaDB server running

Git

1. Database Setup

The backend connects to a database named duplinkedin.

Create the Database (if you haven't already):

CREATE DATABASE duplinkedin;
USE duplinkedin;


Run SQL Schema: Ensure all tables (users, posts, comments, connections, jobs, hashtags) are created. Critically, the users and posts tables require the following columns for image support and proper connection logic:

-- Essential commands for image support and connection fix
ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(255) DEFAULT NULL;
ALTER TABLE posts ADD COLUMN image_url VARCHAR(255) DEFAULT NULL;
-- The 'connections' table status must be TINYINT (0=pending, 1=accepted)


2. Project Setup

Clone the Repository (using your new repository URL):

git clone [https://github.com/YourUsername/Workverse-App.git](https://github.com/YourUsername/Workverse-App.git)
cd Workverse-App


Install Dependencies & Create Folders:

# Assuming standard structure:
# ------------------------------------------------
cd my-server
npm install
mkdir uploads # CRITICAL: This folder must exist for image uploads (Multer target)
cd ..

cd client
npm install
cd ..
# ------------------------------------------------


Configure Database Credentials:
Open my-server/server.js and verify the dbConnection block matches your local MySQL configuration:

// my-server/server.js
const dbConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'YourMySQLPassword', // <--- Update this
    database: 'duplinkedin'
});


3. Run the Application

You need two separate terminals for the backend and frontend.

Terminal 1: Start Backend (API)

cd my-server
node server.js


The server should start on http://localhost:3001.

Terminal 2: Start Frontend (React)

cd client
npm run dev


The client application will typically open in your browser on http://localhost:5173 (or port 3000).

💡 Important Notes

Image Access: The server is configured to serve images from the local /uploads folder via the URL prefix /uploads. If you access the app from a different machine or domain, you must update the base URL in your frontend and configure the server accordingly.

Connection Logic: The connections logic enforces the rule that connection1_id is always the lower user ID to prevent duplicate requests and simplify database constraints.
