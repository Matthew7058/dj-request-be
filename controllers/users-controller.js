const {
    fetchAllUsers,
    fetchUserById,
} = require('../models/users-model');

exports.getAllUsers = (req, res, next) => {
    fetchAllUsers()
    .then((users) => { res.status(200).send({ users }); })
    .catch(next);
};  

exports.getUserById = (req, res, next) => {
    const { id } = req.params;
    fetchUserById(id)
    .then((user) => { res.status(200).send({ user }); })
    .catch(next);
};