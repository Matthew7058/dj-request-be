const {
    fetchAllSessionsByUserId,
    fetchLiveSessionByUserId,
    deleteSessionById
} = require('../models/sessions-model');

exports.getAllSessionsByUserId = (req, res, next) => {
    const { id } = req.params;
    fetchAllSessionsByUserId(id)
    .then((sessions) => { res.status(200).send({ sessions }); })
    .catch(next);
};

exports.getLiveSessionByUserId = (req, res, next) => {
    const { userId } = req.params;
    fetchLiveSessionByUserId(userId)
    .then((session) => { res.status(200).send({ session }); })
    .catch(next);
};

exports.deleteSession = (req, res, next) => {
    const { sessionId } = req.params;
    deleteSessionById(sessionId)
    .then(() => { res.status(204).send(); })
    .catch(next);
};
