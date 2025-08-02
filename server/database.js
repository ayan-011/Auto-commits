const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'auto_commits.db');
let db;

const initializeDatabase = () => {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database');
      createTables();
    }
  });
};

const createTables = () => {
  // Users table to store user preferences
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      repository TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Commits table to store daily commits
  db.run(`
    CREATE TABLE IF NOT EXISTS commits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      repository TEXT NOT NULL,
      commit_sha TEXT NOT NULL,
      commit_message TEXT NOT NULL,
      author_name TEXT,
      author_email TEXT,
      commit_date DATETIME,
      html_url TEXT,
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const saveUserPreference = (username, repository) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO users (username, repository, updated_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [username, repository],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      }
    );
  });
};

const getDailyCommits = (username) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM commits 
       WHERE username = ? 
       ORDER BY fetched_at DESC 
       LIMIT 10`,
      [username],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const saveDailyCommits = (username, commits) => {
  return new Promise((resolve, reject) => {
    // First, delete old commits for this user
    db.run(
      'DELETE FROM commits WHERE username = ?',
      [username],
      (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Insert new commits
        const stmt = db.prepare(`
          INSERT INTO commits 
          (username, repository, commit_sha, commit_message, author_name, author_email, commit_date, html_url, fetched_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        commits.forEach(commit => {
          stmt.run([
            commit.username,
            commit.repository,
            commit.sha,
            commit.commit.message,
            commit.commit.author.name,
            commit.commit.author.email,
            commit.commit.author.date,
            commit.html_url,
            commit.fetched_at
          ]);
        });

        stmt.finalize((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }
    );
  });
};

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT username, repository FROM users', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const getUserPreference = (username) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT username, repository FROM users WHERE username = ?',
      [username],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
};

module.exports = {
  initializeDatabase,
  saveUserPreference,
  getDailyCommits,
  saveDailyCommits,
  getAllUsers,
  getUserPreference
}; 