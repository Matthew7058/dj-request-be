const endpointsJson = require("../endpoints.json")
const app = require('../app')
const request = require('supertest')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const testData = require('../db/data/test-data')

beforeEach(() => seed(testData))
afterAll(() => db.end())

describe('GET /api', () => {
    it('should return a 200 status code and all endpoints', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({ body: { endpoints }}) => {
            expect(endpoints).toEqual(endpointsJson)
        })
    })
})

describe('GET /api/users', () => {
    it('should return a 200 status code and all users', () => {
        return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body: { users }}) => {
            expect(users).toHaveLength(testData.usersData.length)
            users.forEach((user, index) => {
                expect(user).toMatchObject(testData.usersData[index])
                expect(user).toHaveProperty('id')
                expect(user).toHaveProperty('session_count')
                expect(user).toHaveProperty('session_limit')
                expect(user).toHaveProperty('created_at')
            })
        })
    })
})

describe('GET /api/users/:id', () => {
    it('should return a 200 status code and the user with the given id', () => {
        return request(app)
        .get('/api/users/1')
        .expect(200)
        .then(({ body: { user }}) => {
            expect(user).toMatchObject(testData.usersData[0])
            expect(user).toHaveProperty('id')
            expect(user).toHaveProperty('session_count')
            expect(user).toHaveProperty('session_limit')
            expect(user).toHaveProperty('created_at')
        })
    })
    it('should return a 404 status code and an error message if the user does not exist', () => {
        return request(app)
        .get('/api/users/999')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('User not found')
        })
    })
})

describe('GET /api/users/:id/sessions', () => {
    it('should return a 200 status code and all sessions for the user with the given id', () => {
        return request(app)
        .get('/api/users/1/sessions')
        .expect(200)
        .then(({ body: { sessions }}) => {
            expect(sessions).toHaveLength(2)
        })
    })
    it('should return a 404 status code and an error message if the user does not exist', () => {
        return request(app)
        .get('/api/users/999/sessions')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('User not found')
        })
    })
})

describe('GET /api/users/:userId/sessions/live', () => {
    it('should return a 200 status code and the live session for the user with the given id', () => {
        return request(app)
        .get('/api/users/1/sessions/live')
        .expect(200)
        .then(({ body: { session }}) => {
            expect(session).toMatchObject(testData.sessionsData[0])
        })
    })
    it('should return a 404 status code and an error message if the user does not exist', () => {
        return request(app)
        .get('/api/users/999/sessions/live')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('User not found')
        })
    })
    it('should return a 404 status code and an error message if the user has no live session', () => {
        return request(app)
        .get('/api/users/2/sessions/live')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('User has no live session')
        })
    })
})

describe('GET /api/users/:userId/sessions/live/requests', () => {
    it("should return a 200 status code and all requests for the user's live session", () => {
        return request(app)
        .get('/api/users/1/sessions/live/requests')
        .expect(200)
        .then(({ body: { requests }}) => {
            expect(requests).toHaveLength(7)
            requests.forEach((request) => {
                expect(request.session_id).toBe(1)
                expect(request).toHaveProperty('id')
                expect(request).toHaveProperty('title')
                expect(request).toHaveProperty('artist')
                expect(request).toHaveProperty('requestor_name')
                expect(request).toHaveProperty('status')
                expect(request).toHaveProperty('votes')
                expect(request).toHaveProperty('created_at')
                expect(request).toHaveProperty('updated_at')
            })
        })
    })

    it('should return a 404 status code and an error message if the user does not exist', () => {
        return request(app)
        .get('/api/users/999/sessions/live/requests')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('User not found')
        })
    })

    it('should return a 404 status code and an error message if the user has no live session', () => {
        return request(app)
        .get('/api/users/2/sessions/live/requests')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('User has no live session')
        })
    })

    it('should return a 404 status code and an error message if the live session has no requests', () => {
        return db.query('UPDATE sessions SET is_live = TRUE WHERE id = 2;')
        .then(() => {
            return request(app)
            .get('/api/users/2/sessions/live/requests')
            .expect(404)
        })
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Session has no requests')
        })
    })
})

describe('GET /api/sessions/:id/requests', () => {
    it('should return a 200 status code and all requests for the session with the given id', () => {
        return request(app)
        .get('/api/sessions/1/requests')
        .expect(200)
        .then(({ body: { requests }}) => {
            expect(requests).toHaveLength(7)
            requests.forEach((request) => {
                expect(request).toHaveProperty('requestor_name')
            })
        })
    })
    it('should return a 404 status code and an error message if the session does not exist', () => {
        return request(app)
        .get('/api/sessions/999/requests')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Session not found')
        })
    })
    it('should return a 404 status code and an error message if the session has no requests', () => {
        return request(app)
        .get('/api/sessions/2/requests')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Session has no requests')
        })
    })
})

describe('GET /api/sessions/:id/comments', () => {
    it('should return a 200 status code and all comments for the session with the given id', () => {
        return request(app)
        .get('/api/sessions/1/comments')
        .expect(200)
        .then(({ body: { comments }}) => {
            expect(comments).toHaveLength(5)
            comments.forEach((comment) => {
                expect(comment).toHaveProperty('id')
                expect(comment).toHaveProperty('request_id')
                expect([1, 5]).toContain(comment.request_id)
                expect(comment).toHaveProperty('comment')
                expect(comment).toHaveProperty('author')
                expect(comment).toHaveProperty('role')
                expect(comment).toHaveProperty('pinned')
                expect(comment).toHaveProperty('created_at')
                expect(comment).toHaveProperty('updated_at')
            })
        })
    })
    it('should return a 404 status code and an error message if the session does not exist', () => {
        return request(app)
        .get('/api/sessions/999/comments')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Session not found')
        })
    })
    it('should return a 404 status code and an error message if the session has no comments', () => {
        return request(app)
        .get('/api/sessions/2/comments')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Session has no comments')
        })
    })
})

describe('GET /api/requests/:requestId/comments', () => {
    it('should return a 200 status code and all comments for the request with the given id', () => {
        return request(app)
        .get('/api/requests/1/comments')
        .expect(200)
        .then(({ body: { comments }}) => {
            expect(comments).toHaveLength(2)
            comments.forEach((comment) => {
                expect(comment).toHaveProperty('id')
                expect(comment.request_id).toBe(1)
                expect(comment).toHaveProperty('comment')
                expect(comment).toHaveProperty('author')
                expect(comment).toHaveProperty('role')
                expect(comment).toHaveProperty('pinned')
                expect(comment).toHaveProperty('created_at')
                expect(comment).toHaveProperty('updated_at')
            })
        })
    })
    it('should return a 404 status code and an error message if the request does not exist', () => {
        return request(app)
        .get('/api/requests/999/comments')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Request not found')
        })
    })
    it('should return a 404 status code and an error message if the request has no comments', () => {
        return request(app)
        .get('/api/requests/4/comments')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Request has no comments')
        })
    })
})

describe('POST /api/sessions/:sessionId/requests', () => {
    it('should create a new request for the given session', () => {
        const newRequest = { title: 'New Track', artist: 'New Artist', requestor_name: 'New Requestor' }

        return request(app)
        .post('/api/sessions/1/requests')
        .send(newRequest)
        .expect(201)
        .then(({ body: { request }}) => {
            expect(request.session_id).toBe(1)
            expect(request).toMatchObject({
                title: 'New Track',
                artist: 'New Artist',
                requestor_name: 'New Requestor',
                status: 'pending',
                votes: 0,
                approve_reject_reason: null
            })
            expect(request).toHaveProperty('id')
            expect(request).toHaveProperty('created_at')
            expect(request).toHaveProperty('updated_at')
        })
    })

    it('should return a 404 if the session does not exist', () => {
        return request(app)
        .post('/api/sessions/999/requests')
        .send({ title: 'New Track', artist: 'New Artist', requestor_name: 'New Requestor' })
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Session not found')
        })
    })

    it('should return a 400 if the request body is invalid', () => {
        return request(app)
        .post('/api/sessions/1/requests')
        .send({ title: 'Missing requestor', artist: 'New Artist' })
        .expect(400)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Invalid request body')
        })
    })
})

describe('POST /api/requests/:requestId/comments', () => {
    it('should create a new comment for the given request', () => {
        const newComment = { comment: 'Great choice', author: 'Tester' }

        return request(app)
        .post('/api/requests/1/comments')
        .send(newComment)
        .expect(201)
        .then(({ body: { comment }}) => {
            expect(comment.request_id).toBe(1)
            expect(comment).toMatchObject({
                comment: 'Great choice',
                author: 'Tester',
                role: 'user',
                pinned: false
            })
            expect(comment).toHaveProperty('id')
            expect(comment).toHaveProperty('created_at')
            expect(comment).toHaveProperty('updated_at')
        })
    })

    it('should return a 404 if the request does not exist', () => {
        return request(app)
        .post('/api/requests/999/comments')
        .send({ comment: 'Great choice', author: 'Tester' })
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Request not found')
        })
    })

    it('should return a 400 if the comment body is invalid', () => {
        return request(app)
        .post('/api/requests/1/comments')
        .send({})
        .expect(400)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Invalid comment body')
        })
    })
})

describe('PATCH /api/requests/:requestId/status', () => {
    it('should update the status and reason for a request', () => {
        return request(app)
        .patch('/api/requests/2/status')
        .send({ status: 'approved', approve_reject_reason: 'Sounds good' })
        .expect(200)
        .then(({ body: { request }}) => {
            expect(request.status).toBe('approved')
            expect(request.approve_reject_reason).toBe('Sounds good')
            expect(request).toHaveProperty('updated_at')
        })
    })

    it('should return a 404 if the request does not exist', () => {
        return request(app)
        .patch('/api/requests/999/status')
        .send({ status: 'approved' })
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Request not found')
        })
    })

    it('should return a 400 if the status is missing or invalid', () => {
        return request(app)
        .patch('/api/requests/2/status')
        .send({})
        .expect(400)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Invalid status update')
        })
    })
})

describe('PATCH /api/requests/:requestId/votes', () => {
    it('should increment the votes for a request', () => {
        return request(app)
        .patch('/api/requests/5/votes')
        .send({ inc_votes: 2 })
        .expect(200)
        .then(({ body: { request }}) => {
            expect(request.votes).toBe(6)
        })
    })

    it('should return a 404 if the request does not exist', () => {
        return request(app)
        .patch('/api/requests/999/votes')
        .send({ inc_votes: 1 })
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Request not found')
        })
    })

    it('should return a 400 if inc_votes is missing or invalid', () => {
        return request(app)
        .patch('/api/requests/5/votes')
        .send({ inc_votes: 'two' })
        .expect(400)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Invalid vote increment')
        })
    })
})

describe('PATCH /api/comments/:commentId/pinned', () => {
    it('should update the pinned status of a comment', () => {
        return request(app)
        .patch('/api/comments/1/pinned')
        .send({ pinned: true })
        .expect(200)
        .then(({ body: { comment }}) => {
            expect(comment.pinned).toBe(true)
            expect(comment).toHaveProperty('updated_at')
        })
    })

    it('should return a 404 if the comment does not exist', () => {
        return request(app)
        .patch('/api/comments/999/pinned')
        .send({ pinned: true })
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Comment not found')
        })
    })

    it('should return a 400 if pinned is missing or invalid', () => {
        return request(app)
        .patch('/api/comments/1/pinned')
        .send({ pinned: 'yes' })
        .expect(400)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Invalid pinned update')
        })
    })
})

describe('DELETE /api/sessions/:sessionId', () => {
    it('should delete a session and its related data', () => {
        return request(app)
        .delete('/api/sessions/3')
        .expect(204)
        .then(() => {
            return request(app)
            .get('/api/sessions/3/requests')
            .expect(404)
            .then(({ body: { msg }}) => {
                expect(msg).toBe('Session not found')
            })
        })
    })

    it('should return a 404 if the session does not exist', () => {
        return request(app)
        .delete('/api/sessions/999')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Session not found')
        })
    })
})

describe('DELETE /api/requests/:requestId', () => {
    it('should delete a request and its comments', () => {
        return request(app)
        .delete('/api/requests/2')
        .expect(204)
        .then(() => {
            return request(app)
            .get('/api/requests/2/comments')
            .expect(404)
            .then(({ body: { msg }}) => {
                expect(msg).toBe('Request not found')
            })
        })
    })

    it('should return a 404 if the request does not exist', () => {
        return request(app)
        .delete('/api/requests/999')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Request not found')
        })
    })
})

describe('DELETE /api/comments/:commentId', () => {
    it('should delete a comment', () => {
        return request(app)
        .delete('/api/comments/1')
        .expect(204)
    })

    it('should return a 404 if the comment does not exist', () => {
        return request(app)
        .delete('/api/comments/999')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Comment not found')
        })
    })
})

describe('DELETE /api/sessions/:sessionId/requests', () => {
    it('should delete all requests and related comments for a session', () => {
        return request(app)
        .delete('/api/sessions/3/requests')
        .expect(204)
        .then(() => {
            return request(app)
            .get('/api/sessions/3/requests')
            .expect(404)
            .then(({ body: { msg }}) => {
                expect(msg).toBe('Session has no requests')
            })
        })
    })

    it('should return a 404 if the session does not exist', () => {
        return request(app)
        .delete('/api/sessions/999/requests')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Session not found')
        })
    })

    it('should return a 404 if the session has no requests', () => {
        return request(app)
        .delete('/api/sessions/2/requests')
        .expect(404)
        .then(({ body: { msg }}) => {
            expect(msg).toBe('Session has no requests')
        })
    })
})
