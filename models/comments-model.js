const db = require('../db/connection');
const { fetchSessionById } = require('./sessions-model');
const { fetchRequestById } = require('./requests-model');

exports.fetchCommentsBySessionId = (sessionId) => {
    return fetchSessionById(sessionId)
      .then(() => {
        return db.query(
          `SELECT comments.*
            FROM comments
            JOIN requests ON comments.request_id = requests.id
            WHERE requests.session_id = $1;`,
          [sessionId]
        );
      })
      .then((result) => {
        if (result.rows.length === 0)
          return Promise.reject({ status: 404, msg: 'Session has no comments' });
        return result.rows;
      });
};

exports.fetchCommentsByRequestId = (requestId) => {
    return fetchRequestById(requestId)
      .then(() => {
        return db.query('SELECT * FROM comments WHERE request_id = $1;', [requestId]);
      })
      .then((result) => {
        if (result.rows.length === 0)
          return Promise.reject({ status: 404, msg: 'Request has no comments' });
        return result.rows;
      });
};

const fetchCommentById = (commentId) => {
    return db
      .query('SELECT * FROM comments WHERE id = $1;', [commentId])
      .then((result) => {
        if (result.rows.length === 0)
          return Promise.reject({ status: 404, msg: 'Comment not found' });
        return result.rows[0];
      });
};

exports.insertComment = (requestId, commentBody) => {
    const { comment, author, role, pinned } = commentBody;
    if (!comment || !author)
      return Promise.reject({ status: 400, msg: 'Invalid comment body' });
    if (pinned !== undefined && typeof pinned !== 'boolean')
      return Promise.reject({ status: 400, msg: 'Invalid comment body' });

    const pinnedValue = pinned !== undefined ? pinned : false;
    const roleValue = role !== undefined ? role : 'user';

    return fetchRequestById(requestId)
      .then(() => {
        return db.query(
          `INSERT INTO comments (request_id, comment, author, role, pinned)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;`,
          [requestId, comment, author, roleValue, pinnedValue]
        );
      })
      .then((result) => result.rows[0]);
};

exports.updateCommentPinnedById = (commentId, updateBody) => {
    const { pinned } = updateBody;
    if (typeof pinned !== 'boolean')
      return Promise.reject({ status: 400, msg: 'Invalid pinned update' });

    return fetchCommentById(commentId)
      .then(() => {
        return db.query(
          `UPDATE comments
            SET pinned = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;`,
          [pinned, commentId]
        );
      })
      .then((result) => result.rows[0]);
};

exports.deleteCommentById = (commentId) => {
    return fetchCommentById(commentId)
      .then(() => {
        return db.query('DELETE FROM comments WHERE id = $1 RETURNING *;', [commentId]);
      })
      .then((result) => result.rows[0]);
};

exports.fetchCommentById = fetchCommentById;
