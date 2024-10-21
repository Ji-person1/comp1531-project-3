import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizUpdateQuestion', () => {
    let user1Token: string;
    let quizId: number;
    let questionId: number;

    beforeEach(() => {
        // Register user1 
        const resUser1 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: "swastik@example.com",
                password: "password123",
                nameFirst: "Swastik",
                nameLast: "Mishra"
            },
            timeout: TIMEOUT_MS
        });
        user1Token = JSON.parse(resUser1.body.toString()).token;

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

        // Create a question
        const resQuestion = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/question`, {
            json: {
                token: user1Token,
                question: "Who is the Rizzler?",
                duration: 30,
                points: 5,
                answers: [
                    { answer: "Duke Dennis", correct: true },
                    { answer: "Kai Cenat", correct: false }
                ]
            },
            timeout: TIMEOUT_MS
        });
        questionId = JSON.parse(resQuestion.body.toString()).questionId;
    });

    test('Successful question update', () => {
        const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId}`, {
            json: {
                token: user1Token,
                question: "What does it mean when someone takes your food?",
                duration: 45,
                points: 8,
                answers: [
                    { answer: "Fanum Tax", correct: true },
                    { answer: "bullying", correct: false },
                    { answer: "Sharing", correct: false }
                ]
            },
            timeout: TIMEOUT_MS
        });
        const data = JSON.parse(res.body.toString());
        expect(res.statusCode).toBe(200);
        expect(data).toEqual({});
    });

    test('Invalid token', () => {
        const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId}`, {
            json: {
                token: 'invalid_token',
                question: "Who is the Rizzler?",
                duration: 45,
                points: 8,
                answers: [
                    { answer: "Duke Dennis", correct: true },
                    { answer: "Kai Cenat", correct: false }
                ]
            },
            timeout: TIMEOUT_MS
        });
        expect(res.statusCode).toBe(401);
        expect(JSON.parse(res.body.toString())).toEqual(ERROR);
    });

    test('Quiz does not exist', () => {
        const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/999/question/${questionId}`, {
            json: {
                token: user1Token,
                question: "Who is the Rizzler?",
                duration: 45,
                points: 8,
                answers: [
                    { answer: "Duke Dennis", correct: true },
                    { answer: "Kai Cenat", correct: false }
                ]
            },
            timeout: TIMEOUT_MS
        });
        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res.body.toString())).toEqual(ERROR);
    });

    test('Question does not exist', () => {
        const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/999`, {
            json: {
                token: user1Token,
                question: "Who is the Rizzler?",
                duration: 45,
                points: 8,
                answers: [
                    { answer: "Duke Dennis", correct: true },
                    { answer: "Kai Cenat", correct: false }
                ]
            },
            timeout: TIMEOUT_MS
        });
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body.toString())).toEqual(ERROR);
    });
});