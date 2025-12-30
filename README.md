Workverse: Professional Networking Platform

Full-Stack Career Networking & Job Discovery Platform

WorkVerse is a professional networking ecosystem designed to facilitate secure professional connections, content sharing, and job discovery. Built with a focus on Data Integrity and Scalable API Design, the platform implements a robust relational database to manage complex social graphs, real-time messaging, and role-based access control.

Key Features

Security & Identity
JWT Authentication: Secure login/registration flow with JSON Web Token-based protected routes.
RBAC (Role-Based Access Control): Distinct workflows and permissions for Employers (Job Posting) and Employees (Job Seeking).

Content & Engagement
Dynamic Feed: Multi-media post creation with Hashtag indexing and chronological Commenting systems.
Advanced Search: Integrated search functionality across Users, Posts, and Hashtags.

Social Graph & Messaging
Bidirectional Connections: A request-based networking system with conflict resolution for pending and received requests.
Real-Time Messaging: One-to-one private chat system with conversation previews and historical message retrieval.

Job Portal
Employer Suite: Tools for creating and managing job listings with integrated contact information.
Job Discovery: A centralized portal for users to find opportunities filtered by professional relevance.
System Architecture

WorkVerse is built using a decoupled Client-Server Architecture:

Tech Stack
Layer	Technology
Frontend-	React, JavaScript, HTML5, CSS3
Backend-	Node.js, Express.js
Database-	MySQL (Relational Schema)
Auth-	JWT (JSON Web Tokens)
File Handling-	Multer (Profile & Post Images)
Database Design- (Normalized)

The system utilizes a highly normalized MySQL schema to ensure data consistency:

Users:
Master table for profiles and authentication.

Connections:
Managed via ordered User IDs to prevent duplicate relationship entries.

Hashtags:
Many-to-one mapping for optimized content discovery.

Messages/Comments:
Relational tables with foreign key constraints to maintain data integrity.

Future Roadmap
Recommendation Engine: Applying ML algorithms to suggest relevant jobs and connections.
WebSockets: Upgrading the messaging system for real-time, low-latency communication.
Analytics Dashboard: Providing recruiters with insights into post engagement and profile visits.
