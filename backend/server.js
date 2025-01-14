const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

const app = express();

// Middleware
app.use(cors()); // Allow requests from different origins (frontend)
app.use(express.json()); // Parse incoming JSON requests

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'sqluser1', // Your MySQL username
  password: 'password', // Your MySQL password
  database: 'Frithcode3', // Your MySQL database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    return;

  }
  console.log('Connected to MySQL');
});

// Welcome Route
app.get('/api/register', (req, res) => {
  res.send('Welcome to the Registration API');
});

// Handle Registration (POST request for /api/register)
app.post('/api/register', async (req, res) => {
  const { fullname, email, username, password } = req.body;

  // Check if any fields are missing
  if (!fullname || !email || !username || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds (recommended value)

    // Insert the user into the database with the hashed password
    const query = 'INSERT INTO sqluser1 (fullname, email, username, password) VALUES (?, ?, ?, ?)'; 
    db.query(query, [fullname, email, username, hashedPassword], (err, result) => {
      if (err) {
        // Log the error for debugging
        console.error('Error inserting data into the database:', err);
        return res.status(500).json({ success: false, message: 'Registration failed' });
      }

      // Send a success response if registration is successful
      res.json({ success: true, message: 'Registration successful' });
    });
  } catch (error) {
    // Catch any errors during the hashing process or other steps
    console.error('Error during registration:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/login', (req, res) => {
  res.send('Welcome to the login API');
});


// Handle Login (POST request for /api/login)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Check if both adminId and password are provided
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'username and Password are required' });
  }

  // Query the database to find the user
  const query = 'SELECT * FROM sqluser1 WHERE username = ?'; // Assuming 'id' is your Admin ID column
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or Password' });
    }

    const user = results[0];

    // Compare the provided password with the stored hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'username ID or Password' });
      }

      // If passwords match, login is successful
      res.json({ success: true, message: 'Login successful' });
    });
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
