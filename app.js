const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(
    cors({
      origin: 'http://localhost:5173',
      // credentials: true, // uncomment if you're using cookies/auth headers
    })
  );

const endpointsController = require('./controllers/endpoints-controller');
const usersController = require('./controllers/users-controller');
const sessionsController = require('./controllers/sessions-controller');
const requestsController = require('./controllers/requests-controller');
const commentsController = require('./controllers/comments-controller');

app.get('/api', endpointsController.getEndpoints);
app.get('/api/users', usersController.getAllUsers);
app.get('/api/users/:id', usersController.getUserById);
app.get('/api/users/:id/sessions', sessionsController.getAllSessionsByUserId);
app.get('/api/users/:userId/sessions/live', sessionsController.getLiveSessionByUserId);
app.get('/api/users/:userId/sessions/live/requests', requestsController.getRequestsForLiveSessionByUserId);
app.get('/api/sessions/:id/requests', requestsController.getRequestsBySessionId);
app.get('/api/sessions/:id/comments', commentsController.getCommentsBySessionId);
app.get('/api/requests/:requestId/comments', commentsController.getCommentsByRequestId);
app.post('/api/sessions/:sessionId/requests', requestsController.createRequest);
app.post('/api/requests/:requestId/comments', commentsController.createComment);
app.patch('/api/requests/:requestId/status', requestsController.updateRequestStatus);
app.patch('/api/requests/:requestId/votes', requestsController.updateRequestVotes);
app.patch('/api/comments/:commentId/pinned', commentsController.updateCommentPinned);
app.delete('/api/sessions/:sessionId', sessionsController.deleteSession);
app.delete('/api/requests/:requestId', requestsController.deleteRequest);
app.delete('/api/comments/:commentId', commentsController.deleteComment);
app.delete('/api/sessions/:sessionId/requests', requestsController.deleteAllRequestsInSession);
  
// Global error handling middleware
app.use((err, req, res, next) => {
if (err.status && err.msg) res.status(err.status).send({ msg: err.msg });
else {
    console.error(err);
    res.status(500).send({ msg: 'Internal Server Error' });
    }
});
  
module.exports = app;
