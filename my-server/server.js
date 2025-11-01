// This is your server.js file
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
// Removed: const bcrypt = require('bcrypt'); 

const app = express();
const port = 3001;

// --- 1. Middleware ---
app.use(cors());
app.use(express.json());

// --- 2. Database Connection ---
const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Your user
  password: 'Pa16Mi16MySQL', // Your password
  database: 'mythreyee_24011102062' // Your database
});

dbConnection.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
    return;
  }
  console.log('Successfully connected to database with ID', dbConnection.threadId);
});

// --- 3. JWT Secret ---
const JWT_SECRET = 'your-super-secret-key-123'; // Change this to a random string

// --- 4. Auth Middleware ---
const protectRoute = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  try {
    // We need the full decoded token for the job check
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; 
    req.user = decoded; // Attach the full user payload
    next(); 
  } catch (ex) {
    console.error("Invalid token:", ex.message);
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// --- 5. API Endpoints ---

// --- AUTH ENDPOINTS ---

// POST /api/register - Register a new user
app.post('/api/register', (req, res) => {
  const { name, email, password, description, headline, summary, age } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  
  const plainPassword = password;
  
  const query = 'INSERT INTO users (name, email, password, description, headline, summary, age) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  dbConnection.query(query, [name, email, plainPassword, description, headline, summary, age], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists.' });
      }
      console.error('Database error on register:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'User registered successfully!' });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const query = 'SELECT * FROM users WHERE email = ?'; 
  dbConnection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error on login:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = results[0];

    const isMatch = (password === user.password); 

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // --- Login Successful: Create a JWT ---
    const tokenPayload = {
      userId: user.user_id,
      email: user.email,
      name: user.name,
      description: user.description
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful!',
      token: token,
      user: tokenPayload
    });
  });
});

// --- POST ENDPOINTS ---

// GET /api/posts (FIXED for SQL Syntax Error)
app.get('/api/posts', protectRoute, (req, res) => {
  const sortOrder = req.query.sort === 'oldest' ? 'ASC' : 'DESC';

  // CRITICAL FIX: Clean single-line query
  const query = "SELECT posts.post_id, posts.content, posts.content_sent_at, posts.user_id, users.name FROM posts JOIN users ON posts.user_id = users.user_id ORDER BY posts.content_sent_at " + sortOrder;
  
  dbConnection.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching posts:', err);
      return res.status(500).json({ error: "Failed to fetch posts due to database error." });
    }
    res.json(results);
  });
});

// POST /api/posts - MODIFIED TO HANDLE HASHTAGS
app.post('/api/posts', protectRoute, (req, res) => {
  const { content, hashtags } = req.body; 
  const userId = req.userId;

  if (!content) {
    return res.status(400).json({ error: 'Post content is required.' });
  }
  
  // 1. Process hashtags
  const hashtagList = hashtags
    ? hashtags.split(',').map(tag => tag.trim().replace(/^#/, ''))
    .filter(tag => tag.length > 0)
    : [];
  
  // 2. Insert the main post to get the POST_ID
  const postQuery = 'INSERT INTO posts (content, content_sent_at, user_id) VALUES (?, NOW(), ?)';
  
  dbConnection.query(postQuery, [content, userId], (err, results) => {
    if (err) {
      console.error("Database error on post creation:", err);
      return res.status(500).json({ error: err.message });
    }
    
    const postId = results.insertId;
    
    if (hashtagList.length > 0) {
      // 3. Prepare values for bulk insertion into 'hashtags' table
      const hashtagValues = hashtagList.map(tag => [tag, postId]);
      const hashtagQuery = 'INSERT INTO hashtags (hashtag, post_id) VALUES ?';

      dbConnection.query(hashtagQuery, [hashtagValues], (err_h, results_h) => {
        if (err_h) {
          console.error("Database error on hashtag insertion:", err_h);
        }
        res.status(201).json({ message: 'Post created successfully!', postId: postId });
      });
    } else {
      res.status(201).json({ message: 'Post created successfully!', postId: postId });
    }
  });
});

// GET /api/posts/:postId - Get a single post by ID (Needed for PostViewPage)
app.get('/api/posts/:postId', protectRoute, (req, res) => {
    const postId = req.params.postId;
    
    const query = "SELECT p.post_id, p.content, p.content_sent_at, p.user_id, u.name FROM posts p JOIN users u ON p.user_id = u.user_id WHERE p.post_id = ?";
    
    dbConnection.query(query, [postId], (err, results) => {
        if (err) {
            console.error('Database error fetching single post:', err);
            return res.status(500).json({ error: 'Failed to fetch post.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Post not found.' });
        }
        res.json(results[0]);
    });
});

app.get('/api/posts/:postId/hashtags', protectRoute, (req, res) => {
  const postId = req.params.postId;
  const query = 'SELECT hashtag FROM hashtags WHERE post_id = ?';
  
  dbConnection.query(query, [postId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/api/posts/:postId/comments', protectRoute, (req, res) => {
  const postId = req.params.postId;
  const query = `
    SELECT c.comment_id, c.comment_content, c.created_at, c.commenter_id, u.name
    FROM comments c
    JOIN users u ON c.commenter_id = u.user_id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `;
  
  dbConnection.query(query, [postId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post('/api/posts/:postId/comments', protectRoute, (req, res) => {
  const postId = req.params.postId;
  const { comment_content } = req.body;
  const commenterId = req.userId;

  if (!comment_content) {
    return res.status(400).json({ error: 'Comment content is required.' });
  }
  
  const query = 'INSERT INTO comments (comment_content, created_at, post_id, commenter_id) VALUES (?, NOW(), ?, ?)';
  
  dbConnection.query(query, [comment_content, postId, commenterId], (err, results) => {
    if (err) {
      console.error("Database error on comment creation:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Comment added!', insertId: results.insertId });
  });
});

// --- USER & PROFILE ENDPOINTS ---

// GET /api/search/users - Search for users by name
app.get('/api/search/users', protectRoute, (req, res) => {
    const searchQuery = req.query.q; 
    
    if (!searchQuery || searchQuery.trim() === '') {
        return res.status(200).json([]); // Return empty array if no query is provided
    }

    // CRITICAL FIX: The query is now a single, clean string
    const query = "SELECT user_id, name, headline, summary, description FROM users WHERE name LIKE ? LIMIT 20";
    
    const searchParam = `%${searchQuery}%`;

    dbConnection.query(query, [searchParam], (err, results) => {
        if (err) {
            console.error('Database error on user search:', err);
            return res.status(500).json({ error: 'Failed to execute search query.' });
        }
        res.json(results);
    });
});

// GET /api/search/posts - Search post content
app.get('/api/search/posts', protectRoute, (req, res) => {
    const searchQuery = req.query.q; 
    
    if (!searchQuery || searchQuery.trim() === '') {
        return res.status(200).json([]);
    }

    // CRITICAL FIX: Clean single-line query
    const query = "SELECT p.post_id, p.content, p.content_sent_at, u.name FROM posts p JOIN users u ON p.user_id = u.user_id WHERE p.content LIKE ? ORDER BY p.content_sent_at DESC LIMIT 20";
    
    const searchParam = `%${searchQuery}%`;

    dbConnection.query(query, [searchParam], (err, results) => {
        if (err) {
            console.error('Database error on post search:', err);
            return res.status(500).json({ error: 'Failed to execute post search query.' });
        }
        res.json(results);
    });
});


// GET /api/search/hashtags - Search posts by hashtag name
app.get('/api/search/hashtags', protectRoute, (req, res) => {
    const searchQuery = req.query.q; 
    
    if (!searchQuery || searchQuery.trim() === '') {
        return res.status(200).json([]);
    }

    // Clean the search query (remove # if present)
    const cleanTag = searchQuery.trim().replace(/^#/, '');

    // CRITICAL FIX: Clean single-line query
    const query = "SELECT DISTINCT p.post_id, p.content, p.content_sent_at, u.name FROM posts p JOIN users u ON p.user_id = u.user_id JOIN hashtags h ON h.post_id = p.post_id WHERE h.hashtag = ? ORDER BY p.content_sent_at DESC LIMIT 20";
    
    dbConnection.query(query, [cleanTag], (err, results) => {
        if (err) {
            console.error('Database error on hashtag search:', err);
            return res.status(500).json({ error: 'Failed to execute hashtag search query.' });
        }
        res.json(results);
    });
});


// GET /api/users/:userId - Get User Profile (CRITICAL FIX APPLIED)
app.get('/api/users/:userId', protectRoute, (req, res) => {
    const userId = req.params.userId;
    const currentUserId = req.userId; // The person who is VIEWING

    // CRITICAL FIX 1: Clean single-line query for user data
    const userQuery = "SELECT user_id, name, headline, summary, description FROM users WHERE user_id = ?";
    
    dbConnection.query(userQuery, [userId], (err, userResults) => {
        if (err) {
            console.error('Database error fetching user profile:', err);
            return res.status(500).json({ error: 'Database error fetching user data.' });
        }
        if (userResults.length === 0) return res.status(404).json({ error: 'User not found.' });

        const userProfile = userResults[0];

        // Case 1: User is viewing their own profile
        if (parseInt(userId) === currentUserId) {
            userProfile.connectionStatus = 'self';
            return res.json(userProfile);
        }
        
        // Case 2: User is viewing someone else's profile
        // CRITICAL FIX 2: Clean single-line query for connection status
        const connectionQuery = "SELECT status, connection1_id FROM connections WHERE (connection1_id = ? AND connection2_id = ?) OR (connection1_id = ? AND connection2_id = ?)";
        
        dbConnection.query(connectionQuery, [currentUserId, userId, userId, currentUserId], (err, connectionResults) => {
            if (err) {
                console.error('Database error fetching connection status:', err);
                return res.status(500).json({ error: 'Database error fetching connection status.' });
            }

            if (connectionResults.length === 0) {
                userProfile.connectionStatus = 'not_connected';
                return res.json(userProfile);
            } 
            
            const connection = connectionResults[0];
            
            if (connection.status === 'accepted') {
                userProfile.connectionStatus = 'connected';
                return res.json(userProfile);
            
            } else if (connection.status === 'pending') {
                if (connection.connection1_id === currentUserId) {
                    userProfile.connectionStatus = 'pending_sent';
                } else {
                    userProfile.connectionStatus = 'pending_received';
                }
                return res.json(userProfile);
            
            } else {
                userProfile.connectionStatus = 'not_connected';
                return res.json(userProfile);
            }
        });
    });
});


app.get('/api/users/:userId/connections', protectRoute, (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT COUNT(*) as count 
    FROM connections 
    WHERE (connection1_id = ? OR connection2_id = ?) AND status = 'accepted'
  `;
  dbConnection.query(query, [userId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});
// ...
// --- CONNECTION ENDPOINTS ---

app.get('/api/connections', protectRoute, (req, res) => {
  const userId = req.userId;
  const query = `
    SELECT u.user_id, u.name, u.headline
    FROM users u
    JOIN connections c ON (u.user_id = c.connection2_id OR u.user_id = c.connection1_id)
    WHERE (c.connection1_id = ? OR c.connection2_id = ?) AND c.status = 'accepted' AND u.user_id != ?
  `;
  
  dbConnection.query(query, [userId, userId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/connections/all', protectRoute, (req, res) => {
  const userId = req.userId;
  const query = `
    SELECT 
      u.user_id, 
      u.name, 
      u.headline,
      MAX(c.status) as status,
      MAX(CASE WHEN c.connection1_id = ? THEN 'sent' ELSE 'received' END) as request_direction
    FROM users u
    LEFT JOIN connections c 
      ON (c.connection1_id = u.user_id AND c.connection2_id = ?) OR (c.connection1_id = ? AND c.connection2_id = u.user_id)
    WHERE u.user_id != ?
    GROUP BY u.user_id, u.name, u.headline
  `;
  
  dbConnection.query(query, [userId, userId, userId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const processedResults = results.map(user => {
      let connectionStatus = 'not_connected';
      if (user.status === 'accepted') {
        connectionStatus = 'connected';
      } else if (user.status === 'pending') {
        connectionStatus = user.request_direction === 'sent' ? 'pending_received' : 'pending_sent';
      }
      return {
        user_id: user.user_id,
        name: user.name,
        headline: user.headline,
        status: connectionStatus
      };
    });
    res.json(processedResults);
  });
});

app.post('/api/connections/request', protectRoute, (req, res) => {
  const requesterId = req.userId;
  const { receiverId } = req.body;

  if (requesterId === receiverId) {
    return res.status(400).json({ error: 'Cannot connect with yourself.' });
  }

  // This query assumes your 'status' column is VARCHAR/TEXT
  const query = 'INSERT INTO connections (connection1_id, connection2_id, status, created_at) VALUES (?, ?, "pending", NOW())';
  
  dbConnection.query(query, [requesterId, receiverId], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(201).json({ message: 'Connection request already exists or sent.' });
      }
      console.error("Database error on /api/connections/request:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Connection request sent.' });
  });
});

app.post('/api/connections/accept', protectRoute, (req, res) => {
  const receiverId = req.userId; // You are the receiver
  const { requesterId } = req.body; // The person who sent it
  
  const query = 'UPDATE connections SET status = "accepted" WHERE connection1_id = ? AND connection2_id = ? AND status = "pending"';
  
  dbConnection.query(query, [requesterId, receiverId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'No pending request found.' });
    }
    res.json({ message: 'Connection accepted.' });
  });
});
// ...
// --- MESSAGING ENDPOINTS ARE UNCHANGED ---

app.get('/api/messages/conversations', protectRoute, (req, res) => {
  const userId = req.userId;
  const query = `
    WITH UserConversations AS (
      SELECT 
        CASE
          WHEN sender_id = ? THEN receiver_id
          ELSE sender_id
        END AS other_user_id
      FROM messages
      WHERE sender_id = ? OR receiver_id = ?
      GROUP BY other_user_id
    )
    SELECT 
      uc.other_user_id AS user_id, 
      u.name, 
      (SELECT content 
        FROM messages 
        WHERE (sender_id = ? AND receiver_id = uc.other_user_id) OR (sender_id = uc.other_user_id AND receiver_id = ?)
        ORDER BY content_sent_at DESC
        LIMIT 1) AS last_message
    FROM UserConversations uc
    JOIN users u ON uc.other_user_id = u.user_id
  `;

  dbConnection.query(query, [userId, userId, userId, userId, userId], (err, results) => {
    if (err) {
      console.error('Error fetching conversations:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/api/messages/:otherUserId', protectRoute, (req, res) => {
  const userId = req.userId;
  const otherUserId = parseInt(req.params.otherUserId);

  if (isNaN(otherUserId)) {
    return res.status(400).json({ error: 'Invalid user ID.' });
  }

  const query = `
    SELECT message_id, content, content_sent_at, sender_id, receiver_id
    FROM messages
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY content_sent_at ASC
  `;
  
  dbConnection.query(query, [userId, otherUserId, otherUserId, userId], (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post('/api/messages', protectRoute, (req, res) => {
  const senderId = req.userId;
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({ error: 'Receiver ID and content are required.' });
  }

  const query = 'INSERT INTO messages (content, content_sent_at, sender_id, receiver_id) VALUES (?, NOW(), ?, ?)';
  
  dbConnection.query(query, [content, senderId, receiverId], (err, results) => {
    if (err) {
      console.error('Error sending message:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message_id: results.insertId,
      content: content,
      content_sent_at: new Date().toISOString(),
      sender_id: senderId,
      receiver_id: parseInt(receiverId)
    });
  });
});
// ...
// --- JOB ENDPOINTS ---

// GET /api/jobs - Get all job listings (CRITICAL FIX APPLIED)
app.get('/api/jobs', protectRoute, (req, res) => {
  // FINAL FIX: Define the entire query as a single, clean string
  const query = "SELECT j.job_id, j.title, j.company, j.location, j.description, j.created_at, j.contact_email, j.contact_phone, j.application_link, u.name as posted_by_name FROM jobs j JOIN users u ON j.posted_by = u.user_id ORDER BY j.created_at DESC";
  
  dbConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching jobs:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// POST /api/jobs - Post a new job (CRITICAL FIX APPLIED)
app.post('/api/jobs', protectRoute, (req, res) => {
  const postedBy = req.userId;
  const userDescription = req.user.description;

  // 1. Enforce the business rule
  if (userDescription !== '0') {
    return res.status(403).json({ error: 'Access denied. Only employers (description=0) can post jobs.' });
  }

  // 2. Get data for the 'jobs' table
  const { title, company, location, description, contact_email, contact_phone, application_link } = req.body; 

  if (!title || !company || !location || !description) {
    return res.status(400).json({ error: 'Title, company, location, and description are required.' });
  }

  // 3. Insert the job (using a clean, single-line string to prevent syntax errors)
  const query = "INSERT INTO jobs (title, company, location, description, posted_by, created_at, contact_email, contact_phone, application_link) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?)";
  
  // Include contact fields in the parameters list
  dbConnection.query(query, 
    [title, company, location, description, postedBy, contact_email, contact_phone, application_link], 
    (err, results) => {
    if (err) {
      console.error('Error posting job:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Job posted successfully!', jobId: results.insertId });
  });
});

// --- 6. Start the Server ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});