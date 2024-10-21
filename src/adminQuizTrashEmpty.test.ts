import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Error Cases', () => {
    const validQuizIds = [3, 4, 5];
    let UserToken: { token: number };

    beforeEach(() => {
        const loginRes = request('POST', SERVER_URL + '/v1/admin/auth/login', {
            json: { email: "swapnav.saikia123@icloud.com", password: "1234abcd" },
            timeout: TIMEOUT_MS
        });

        if (loginRes.statusCode === 200) {
            UserToken = JSON.parse(loginRes.body.toString());
        } else {
            const registerRes = request('POST', SERVER_URL + '/v1/admin/auth/register', {
                json: { email: "swapnav.saikia123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng" },
                timeout: TIMEOUT_MS
            });
            UserToken = JSON.parse(registerRes.body.toString());
        }
    });

    test('Invalid token', () => {
        const invalidToken = 999999;  

        const response = request('DELETE', `${SERVER_URL}/v1/admin/quiz/trash/empty`, {
            qs: { token: invalidToken, quizIds: JSON.stringify(validQuizIds) },
            timeout: TIMEOUT_MS
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body.toString())).toEqual(ERROR);
    });

    test('Empty token', () => {
        const emptyToken = 0; 

        const response = request('DELETE', `${SERVER_URL}/v1/admin/quiz/trash/empty`, {
            qs: { token: emptyToken, quizIds: JSON.stringify(validQuizIds) },
            timeout: TIMEOUT_MS
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body.toString())).toEqual(ERROR);
    });

    test('Quiz ID not in the trash', () => {
        const nonTrashQuizIds = [999]; 

        const response = request('DELETE', `${SERVER_URL}/v1/admin/quiz/trash/empty`, {
            qs: { token: UserToken.token, quizIds: JSON.stringify(nonTrashQuizIds) },
            timeout: TIMEOUT_MS
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body.toString())).toEqual(ERROR);
    });

    test('Quiz does not belong to the user', () => {
        const unauthorizedQuizIds = [9999]; 

        const response = request('DELETE', `${SERVER_URL}/v1/admin/quiz/trash/empty`, {
            qs: { token: UserToken.token, quizIds: JSON.stringify(unauthorizedQuizIds) },
            timeout: TIMEOUT_MS
        });

        expect(response.statusCode).toBe(403);
        expect(JSON.parse(response.body.toString())).toEqual(ERROR);
    });
});

describe('Success Cases', () => {
    let UserToken: { token: number };
    
    beforeEach(() => {
        const loginRes = request('POST', SERVER_URL + '/v1/admin/auth/login', {
            json: { email: "swapnav.saikia123@icloud.com", password: "1234abcd" },
            timeout: TIMEOUT_MS
        });

        if (loginRes.statusCode === 200) {
            UserToken = JSON.parse(loginRes.body.toString());
        } else {
            const registerRes = request('POST', SERVER_URL + '/v1/admin/auth/register', {
                json: { email: "swapnav.saikia123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng" },
                timeout: TIMEOUT_MS
            });
            UserToken = JSON.parse(registerRes.body.toString());
        }
    });

    test('Successful trash empty', () => {
        const quizIds = [3, 4, 5];

        const response = request('DELETE', `${SERVER_URL}/v1/admin/quiz/trash/empty`, {
            qs: { token: UserToken.token, quizIds: JSON.stringify(quizIds) },
            timeout: TIMEOUT_MS
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body.toString())).toEqual({});
    });
});