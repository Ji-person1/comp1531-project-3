import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizTransfer', () => {
    let user1Token: string;
    let user2Token: string;
    let quizId: number;

    beforeEach(() => {
        // Register two users
        const resUser1 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: "swastik1@gmail.com",
                password: "password123",
                nameFirst: "Swastik",
                nameLast: "Mishra"
            },
            timeout: TIMEOUT_MS
        });
        user1Token = JSON.parse(resUser1.body.toString()).token;

        const resUser2 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: "Swastik2@gmail.com",
                password: "password456",
                nameFirst: "Neo",
                nameLast: "Mishra"
            },
            timeout: TIMEOUT_MS
        });
        user2Token = JSON.parse(resUser2.body.toString()).token;

        // Create a quiz for user1
        const resQuiz = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
            json: {
                token: user1Token,
                name: "Test Quiz",
                description: "This is a test quiz"
            },
            timeout: TIMEOUT_MS
        });
        quizId = JSON.parse(resQuiz.body.toString()).quizId;
    });

    test('Successful transfer', () => {
        const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/transfer`, {
            json: {
                token: user1Token,
                userEmail: "Swastik2@gmail.com"
            },
            timeout: TIMEOUT_MS
        });
        const data = JSON.parse(res.body.toString());
        expect(data).toEqual({});
        expect(res.statusCode).toBe(200);
        expect(data).toEqual({});

        // Verify that user2 now owns the quiz
        const resQuizInfo = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizId}`, {
            json: { token: user2Token },
            timeout: TIMEOUT_MS
        });
        const quizInfo = JSON.parse(resQuizInfo.body.toString());
        expect(quizInfo.name).toBe("Test Quiz");
    });

    test('Invalid token', () => {
        const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/transfer`, {
            json: {
                token: 'invalid_token',
                userEmail: "Swastik2@gmail.com"
            },
            timeout: TIMEOUT_MS
        });
        expect(res.statusCode).toBe(401);
        expect(JSON.parse(res.body.toString())).toEqual(ERROR);
    });

    test('Quiz does not exist', () => {
        const res = request('POST', `${SERVER_URL}/v1/admin/quiz/999/transfer`, {
            json: {
                token: user1Token,
                userEmail: "Swastik2@gmail.com"
            },
            timeout: TIMEOUT_MS
        });
        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res.body.toString())).toEqual(ERROR);
    });

    test('User is not the owner of the quiz', () => {
        const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/transfer`, {
            json: {
                token: user2Token,
                userEmail: "Swastik1@gmail.com"
            },
            timeout: TIMEOUT_MS
        });
        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res.body.toString())).toEqual(ERROR);
    });

    test('Target user does not exist', () => {
        const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/transfer`, {
            json: {
                token: user1Token,
                userEmail: "nonexistent@gmail.com"
            },
            timeout: TIMEOUT_MS
        });
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body.toString())).toEqual(ERROR);
    });

    test('Target user is the current owner', () => {
        const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/transfer`, {
            json: {
                token: user1Token,
                userEmail: "Swastik1@gmail.com"
            },
            timeout: TIMEOUT_MS
        });
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body.toString())).toEqual(ERROR);
    });

    test('Quiz name conflict with target user', () => {
        // First, create a quiz with the same name for user2
        request('POST', `${SERVER_URL}/v1/admin/quiz`, {
            json: {
                token: user2Token,
                name: "Test Quiz",
                description: "This is another test quiz"
            },
            timeout: TIMEOUT_MS
        });

        const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/transfer`, {
            json: {
                token: user1Token,
                userEmail: "Swastik2@gmail.com"
            },
            timeout: TIMEOUT_MS
        });
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body.toString())).toEqual(ERROR);
    });
});