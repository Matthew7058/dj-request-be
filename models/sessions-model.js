const db = require('../db/connection');
const { fetchUserById } = require('./users-model');

exports.fetchAllSessionsByUserId = (userId) => {
    return db
      .query('SELECT * FROM sessions WHERE user_id = $1;', [userId])
      .then((result) => {
        if (result.rows.length === 0)
          return Promise.reject({ status: 404, msg: 'User not found' });
        return result.rows;
      });
};

exports.fetchLiveSessionByUserId = (userId) => {
    return fetchUserById(userId)
      .then(() => {
        return db.query('SELECT * FROM sessions WHERE user_id = $1 AND is_live = TRUE;', [userId]);
      })
      .then((result) => {
        if (result.rows.length === 0)
          return Promise.reject({ status: 404, msg: 'User has no live session' });
        return result.rows[0];
      });
};

exports.fetchSessionById = (sessionId) => {
    return db
      .query('SELECT * FROM sessions WHERE id = $1;', [sessionId])
      .then((result) => {
        if (result.rows.length === 0)
          return Promise.reject({ status: 404, msg: 'Session not found' });
        return result.rows[0];
      });
};

exports.deleteSessionById = (sessionId) => {
    return exports.fetchSessionById(sessionId)
      .then(() => {
        return db.query(
          `DELETE FROM comments
            WHERE request_id IN (SELECT id FROM requests WHERE session_id = $1);`,
          [sessionId]
        );
      })
      .then(() => {
        return db.query('DELETE FROM requests WHERE session_id = $1;', [sessionId]);
      })
      .then(() => {
        return db.query('DELETE FROM sessions WHERE id = $1 RETURNING *;', [sessionId]);
      })
      .then((result) => result.rows[0]);
};
