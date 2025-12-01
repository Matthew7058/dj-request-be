const db = require('../db/connection');

exports.fetchAllUsers = () => {
    return db.query('SELECT * FROM users;').then((result) => result.rows);
};

exports.fetchUserById = (id) => {
    return db
      .query('SELECT * FROM users WHERE id = $1;', [id])
      .then((result) => {
        if (result.rows.length === 0)
          return Promise.reject({ status: 404, msg: 'User not found' });
        return result.rows[0];
      });
};