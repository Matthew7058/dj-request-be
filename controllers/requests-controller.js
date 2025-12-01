const {
    fetchRequestsBySessionId,
    insertRequest,
    updateRequestStatusById,
    updateRequestVotesById,
    deleteRequestById,
    deleteAllRequestsInSession
} = require('../models/requests-model');

exports.getRequestsBySessionId = (req, res, next) => {
    const { id } = req.params;
    fetchRequestsBySessionId(id)
    .then((requests) => { res.status(200).send({ requests }); })
    .catch(next);
};

exports.createRequest = (req, res, next) => {
    const { sessionId } = req.params;
    insertRequest(sessionId, req.body)
    .then((request) => { res.status(201).send({ request }); })
    .catch(next);
};

exports.updateRequestStatus = (req, res, next) => {
    const { requestId } = req.params;
    updateRequestStatusById(requestId, req.body)
    .then((request) => { res.status(200).send({ request }); })
    .catch(next);
};

exports.updateRequestVotes = (req, res, next) => {
    const { requestId } = req.params;
    updateRequestVotesById(requestId, req.body)
    .then((request) => { res.status(200).send({ request }); })
    .catch(next);
};

exports.deleteRequest = (req, res, next) => {
    const { requestId } = req.params;
    deleteRequestById(requestId)
    .then(() => { res.status(204).send(); })
    .catch(next);
};

exports.deleteAllRequestsInSession = (req, res, next) => {
    const { sessionId } = req.params;
    deleteAllRequestsInSession(sessionId)
    .then(() => { res.status(204).send(); })
    .catch(next);
};
