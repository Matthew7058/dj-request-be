const {
    fetchCommentsBySessionId,
    fetchCommentsByRequestId,
    insertComment,
    updateCommentPinnedById,
    deleteCommentById
} = require('../models/comments-model');

exports.getCommentsBySessionId = (req, res, next) => {
    const { id } = req.params;
    fetchCommentsBySessionId(id)
    .then((comments) => { res.status(200).send({ comments }); })
    .catch(next);
};

exports.getCommentsByRequestId = (req, res, next) => {
    const { requestId } = req.params;
    fetchCommentsByRequestId(requestId)
    .then((comments) => { res.status(200).send({ comments }); })
    .catch(next);
};

exports.createComment = (req, res, next) => {
    const { requestId } = req.params;
    insertComment(requestId, req.body)
    .then((comment) => { res.status(201).send({ comment }); })
    .catch(next);
};

exports.updateCommentPinned = (req, res, next) => {
    const { commentId } = req.params;
    updateCommentPinnedById(commentId, req.body)
    .then((comment) => { res.status(200).send({ comment }); })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
    const { commentId } = req.params;
    deleteCommentById(commentId)
    .then(() => { res.status(204).send(); })
    .catch(next);
};
