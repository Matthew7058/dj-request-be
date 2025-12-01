const format = require('pg-format');
const db = require('../connection');

const seed = ({ usersData, sessionsData, requestsData, commentsData }) => {
    return db.query('DROP TABLE IF EXISTS comments;')
      .then(() => db.query('DROP TABLE IF EXISTS requests;'))
      .then(() => db.query('DROP TABLE IF EXISTS sessions;'))
      .then(() => db.query('DROP TABLE IF EXISTS users;'))
      .then(() => db.query('DROP TYPE IF EXISTS request_status;'))
      .then(() => db.query('DROP TYPE IF EXISTS user_role;'))

      .then(() => {
        return db.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                display_name VARCHAR(255) NOT NULL UNIQUE,
                pin CHAR(6) NOT NULL,
                session_count INTEGER NOT NULL DEFAULT 0,
                session_limit INTEGER NOT NULL DEFAULT 30,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)
      })
      .then(() => {
        return db.query(`
            CREATE TABLE sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                is_live BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)
      })
      .then(() => {
        return db.query(`
            CREATE TABLE requests (
                id SERIAL PRIMARY KEY,
                session_id INTEGER REFERENCES sessions(id),
                title VARCHAR(255) NOT NULL,
                artist VARCHAR(255) NOT NULL,
                status VARCHAR(255) DEFAULT 'pending',
                approve_reject_reason TEXT,
                votes INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)
      })
      .then(() => {
        return db.query(`
            CREATE TABLE comments (
                id SERIAL PRIMARY KEY,
                request_id INTEGER REFERENCES requests(id),
                comment TEXT NOT NULL,
                author VARCHAR(255) NOT NULL,
                role VARCHAR(255) DEFAULT 'user',
                pinned BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)
      })
      .then(() => {
        const insetUsersQuery = format(
            `INSERT INTO users (display_name, pin) VALUES %L RETURNING *;`,
            usersData.map(({ display_name, pin }) => [display_name, pin])
        )
        return db.query(insetUsersQuery)
      })
      .then(() => {
        const insetSessionsQuery = format(
            `INSERT INTO sessions (user_id, is_live) VALUES %L RETURNING *;`,
            sessionsData.map(({ user_id, is_live }) => [user_id, is_live])
        )
        return db.query(insetSessionsQuery)
      })
      .then(() => {
        const insetRequestsQuery = format(
            `INSERT INTO requests (session_id, title, artist, status, approve_reject_reason, votes) VALUES %L RETURNING *;`,
            requestsData.map(({ session_id, title, artist, status, approve_reject_reason, votes }) => [session_id, title, artist, status, approve_reject_reason, votes])
        )
        return db.query(insetRequestsQuery)
      })
      .then(() => {
        const insetCommentsQuery = format(
            `INSERT INTO comments (request_id, comment, author, role, pinned) VALUES %L RETURNING *;`,
            commentsData.map(({ request_id, comment, author, role, pinned }) => [request_id, comment, author, role, pinned])
        )
        return db.query(insetCommentsQuery)
      })
      .then(() => {
        console.log('Seeding complete!');
      })
      .catch((err) => {
        console.error('Seeding error:', err);
      });
};

module.exports = seed;
