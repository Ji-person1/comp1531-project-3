import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

const ERROR = { error: expect.any(String) };
beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Error Cases', () => {
    let UserToken: { token: string };

    beforeEach(() => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            { json: { email: "Swapnav.saikia123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng" } });
        UserToken = JSON.parse(res.body.toString());
    });

    test('Invalid token', () => {
        const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', {
            qs: { token: 'invalidToken' }, 
            timeout: TIMEOUT_MS
        });

        expect(res.statusCode).toBe(401);
        expect(JSON.parse(res.body.toString())).toEqual(ERROR); 
    });

    test('Empty token', () => {
        const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', {
            qs: { token: '' }, 
            timeout: TIMEOUT_MS
        });

        expect(res.statusCode).toBe(401);
        expect(JSON.parse(res.body.toString())).toEqual(ERROR);
    });
});

describe('Success Cases', () => {
    let UserToken: { token: string };

    beforeEach(() => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            { json: { email: "Swapnav.saikia123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng" } });
        UserToken = JSON.parse(res.body.toString());
    });

    test('Valid token', () => {
        expect(UserToken).toHaveProperty('token');
        expect(typeof UserToken.token).toBe('string');

        const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', {
            qs: { token: UserToken.token }, 
            timeout: TIMEOUT_MS
        });

        expect(res.statusCode).toBe(200);

        const body = JSON.parse(res.body.toString());
        expect(body).toHaveProperty('quizzes');
        expect(body.quizzes.length).toBeGreaterThanOrEqual(0); 

        if (body.quizzes.length > 0) {
            expect(body.quizzes[0]).toHaveProperty('quizId');
            expect(body.quizzes[0]).toHaveProperty('name');
        }
    });
});