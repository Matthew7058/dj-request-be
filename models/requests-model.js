const db = require('../db/connection');
const { fetchSessionById, fetchLiveSessionByUserId } = require('./sessions-model');

exports.fetchRequestsBySessionId = (sessionId) => {
    return fetchSessionById(sessionId)
      .then(() => {
        return db.query('SELECT * FROM requests WHERE session_id = $1;', [sessionId]);
      })
      .then((result) => {
        if (result.rows.length === 0)
          return Promise.reject({ status: 404, msg: 'Session has no requests' });
        return result.rows;
      });
};

exports.fetchRequestById = (requestId) => {
    return db
      .query('SELECT * FROM requests WHERE id = $1;', [requestId])
      .then((result) => {
        if (result.rows.length === 0)
          return Promise.reject({ status: 404, msg: 'Request not found' });
        return result.rows[0];
      });
};

exports.insertRequest = (sessionId, requestBody) => {
    const { title, artist, requestor_name, status, approve_reject_reason, votes } = requestBody;
    if (!title || !artist || !requestor_name)
      return Promise.reject({ status: 400, msg: 'Invalid request body' });

    const statusValue = status !== undefined ? status : 'pending';
    const votesValue = votes !== undefined ? votes : 0;

    return fetchSessionById(sessionId)
      .then(() => {
        return db.query(
          `INSERT INTO requests (session_id, title, artist, requestor_name, status, approve_reject_reason, votes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;`,
          [sessionId, title, artist, requestor_name, statusValue, approve_reject_reason || null, votesValue]
        );
      })
      .then((result) => result.rows[0]);
};

exports.updateRequestStatusById = (requestId, updateBody) => {
    const { status, approve_reject_reason } = updateBody;
    if (!status || typeof status !== 'string')
      return Promise.reject({ status: 400, msg: 'Invalid status update' });

    return exports.fetchRequestById(requestId)
      .then(() => {
        return db.query(
          `UPDATE requests
            SET status = $1,
                approve_reject_reason = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *;`,
          [status, approve_reject_reason || null, requestId]
        );
      })
      .then((result) => result.rows[0]);
};

exports.updateRequestVotesById = (requestId, updateBody) => {
    const { inc_votes } = updateBody;
    if (inc_votes === undefined || typeof inc_votes !== 'number')
      return Promise.reject({ status: 400, msg: 'Invalid vote increment' });

    return exports.fetchRequestById(requestId)
      .then(() => {
        return db.query(
          `UPDATE requests
            SET votes = votes + $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;`,
          [inc_votes, requestId]
        );
      })
      .then((result) => result.rows[0]);
};

exports.fetchRequestsForLiveSessionByUserId = (userId) => {
    return fetchLiveSessionByUserId(userId)
      .then((session) => {
        return db.query('SELECT * FROM requests WHERE session_id = $1;', [session.id]);
      })
      .then((result) => {
        if (result.rows.length === 0)
          return Promise.reject({ status: 404, msg: 'Session has no requests' });
        return result.rows;
      });
};

exports.deleteRequestById = (requestId) => {
    return exports.fetchRequestById(requestId)
      .then(() => {
        return db.query('DELETE FROM comments WHERE request_id = $1;', [requestId]);
      })
      .then(() => {
        return db.query('DELETE FROM requests WHERE id = $1 RETURNING *;', [requestId]);
      })
      .then((result) => result.rows[0]);
};

exports.deleteAllRequestsInSession = (sessionId) => {
    return exports.fetchRequestsBySessionId(sessionId)
      .then(() => {
        return db.query(
          `DELETE FROM comments
            WHERE request_id IN (SELECT id FROM requests WHERE session_id = $1);`,
          [sessionId]
        );
      })
      .then(() => {
        return db.query('DELETE FROM requests WHERE session_id = $1 RETURNING *;', [sessionId]);
      })
      .then((result) => result.rows);
};
