const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.userId = decoded.id;
    next();
  });
}

// SQLite Database Setup
const db = new sqlite3.Database('./measurements.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT,
      createdAt TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS measurements (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      glicemia INTEGER NOT NULL,
      insulina REAL NOT NULL,
      observations TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);
}

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const createdAt = new Date().toISOString();

    db.run(
      `INSERT INTO users (id, email, password, name, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [userId, email, hashedPassword, name || '', createdAt],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: 'Failed to register user' });
        }

        const token = jwt.sign({ id: userId, email }, JWT_SECRET, {
          expiresIn: '7d',
        });
        res.json({ userId, token, email, name: name || '' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!row) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    try {
      const passwordMatch = await bcrypt.compare(password, row.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: row.id, email: row.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      res.json({
        userId: row.id,
        token,
        email: row.email,
        name: row.name,
      });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// Get or create user
app.post('/api/user/register', (req, res) => {
  const { deviceId } = req.body;

  if (!deviceId) {
    return res.status(400).json({ error: 'deviceId is required' });
  }

  const userId = uuidv4();
  const createdAt = new Date().toISOString();

  db.run(
    `INSERT OR IGNORE INTO users (id, deviceId, createdAt) VALUES (?, ?, ?)`,
    [userId, deviceId, createdAt],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to register user' });
      }

      // Get the user (either newly created or existing)
      db.get(
        `SELECT id FROM users WHERE deviceId = ?`,
        [deviceId],
        (err, row) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to get user' });
          }
          res.json({ userId: row.id });
        }
      );
    }
  );
});

// Add a measurement (protected route)
app.post('/api/measurements', verifyToken, (req, res) => {
  const { date, time, glicemia, insulina, observations } = req.body;
  const userId = req.userId;

  if (!date || !time || glicemia === undefined || insulina === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO measurements (id, userId, date, time, glicemia, insulina, observations, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, date, time, glicemia, insulina, observations || '', now, now],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save measurement' });
      }
      res.json({ id, userId, date, time, glicemia, insulina, observations });
    }
  );
});

// Get all measurements for a user (protected route)
app.get('/api/measurements', verifyToken, (req, res) => {
  const userId = req.userId;

  db.all(
    `SELECT * FROM measurements WHERE userId = ? ORDER BY date ASC, time ASC`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch measurements' });
      }
      res.json(rows || []);
    }
  );
});

// Update a measurement (protected route)
app.put('/api/measurements/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { date, time, glicemia, insulina, observations } = req.body;
  const userId = req.userId;

  if (!date || !time || glicemia === undefined || insulina === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const now = new Date().toISOString();

  db.run(
    `UPDATE measurements SET date = ?, time = ?, glicemia = ?, insulina = ?, observations = ?, updatedAt = ?
     WHERE id = ? AND userId = ?`,
    [date, time, glicemia, insulina, observations || '', now, id, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update measurement' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Measurement not found' });
      }
      res.json({ success: true });
    }
  );
});

// Delete a measurement (protected route)
app.delete('/api/measurements/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  db.run(
    `DELETE FROM measurements WHERE id = ? AND userId = ?`,
    [id, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete measurement' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Measurement not found' });
      }
      res.json({ success: true });
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});
