require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Datenbank initialisieren
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Fehler beim Öffnen der Datenbank:', err.message);
  } else {
    console.log('Verbunden mit der SQLite-Datenbank.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      verified INTEGER DEFAULT 0,
      verification_token TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      text TEXT,
      group_id TEXT,
      deadline TEXT,
      done INTEGER DEFAULT 0,
      done_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      name TEXT,
      color TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
  }
});

// E-Mail-Transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail', // Oder dein E-Mail-Service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Registrierung
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    db.run(`INSERT INTO users (email, password, verification_token) VALUES (?, ?, ?)`,
      [email, hashedPassword, token], function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'E-Mail bereits registriert' });
          }
          return res.status(500).json({ error: 'Datenbankfehler' });
        }

        // E-Mail senden
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'E-Mail-Bestätigung',
          html: `<p>Klicke <a href="http://localhost:${PORT}/verify?token=${token}">hier</a> um deine E-Mail zu bestätigen.</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('E-Mail-Fehler:', error);
            return res.status(500).json({ error: 'Fehler beim Senden der E-Mail' });
          }
          res.json({ message: 'Registrierung erfolgreich. Überprüfe deine E-Mail.' });
        });
      });
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// E-Mail-Bestätigung
app.get('/verify', (req, res) => {
  const { token } = req.query;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.send('<h1>Ungültiger oder abgelaufener Token</h1>');
    }

    db.run(`UPDATE users SET verified = 1, verification_token = NULL WHERE email = ?`, [decoded.email], function(err) {
      if (err) {
        return res.send('<h1>Fehler bei der Bestätigung</h1>');
      }
      res.send('<h1>E-Mail erfolgreich bestätigt! Du kannst dich jetzt anmelden.</h1>');
    });
  });
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Ungültige Anmeldedaten' });
    }

    if (!user.verified) {
      return res.status(400).json({ error: 'E-Mail nicht bestätigt' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Ungültige Anmeldedaten' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token, user: { email: user.email } });
  });
});

// Middleware für Authentifizierung
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Zugriff verweigert' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Ungültiger Token' });
    }
    req.user = user;
    next();
  });
};

// Geschützte Route (Beispiel)
app.get('/protected', authenticate, (req, res) => {
  res.json({ message: 'Willkommen!', user: req.user });
});

// Aufgaben und Gruppen APIs
app.get('/data', authenticate, (req, res) => {
  const userId = req.user.id;
  db.all(`SELECT * FROM groups WHERE user_id = ?`, [userId], (err, groups) => {
    if (err) return res.status(500).json({ error: 'Fehler beim Laden der Gruppen' });
    db.all(`SELECT * FROM tasks WHERE user_id = ?`, [userId], (err, tasks) => {
      if (err) return res.status(500).json({ error: 'Fehler beim Laden der Aufgaben' });
      res.json({ groups, tasks });
    });
  });
});

app.post('/data', authenticate, (req, res) => {
  const userId = req.user.id;
  const { groups, tasks } = req.body;

  // Gruppen speichern
  db.run(`DELETE FROM groups WHERE user_id = ?`, [userId], () => {
    groups.forEach(g => {
      db.run(`INSERT INTO groups (id, user_id, name, color) VALUES (?, ?, ?, ?)`, [g.id, userId, g.name, g.color]);
    });
  });

  // Aufgaben speichern
  db.run(`DELETE FROM tasks WHERE user_id = ?`, [userId], () => {
    tasks.forEach(t => {
      db.run(`INSERT INTO tasks (id, user_id, text, group_id, deadline, done, done_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, userId, t.text, t.groupId, t.deadline, t.done ? 1 : 0, t.doneAt, t.createdAt]);
    });
    res.json({ message: 'Daten gespeichert' });
  });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});</content>
<parameter name="filePath">c:\Users\hgued\projekt\server.js