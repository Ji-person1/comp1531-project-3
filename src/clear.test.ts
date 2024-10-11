import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

const ERROR = { error: expect.any(String) };

describe('Function tests', () => {
    let UserToken: {token: number}
    let quizId: {quizId: number}
    beforeEach(() => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}})
        UserToken = JSON.parse(res.body.toString())
        const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserToken.token, name: "first quiz", description: "a test quiz"}});
        quizId = JSON.parse(quizRes.body.toString())
        request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
    }); 

    test('Return type check', () => {
        const res = request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
        expect(JSON.parse(res.body.toString())).toStrictEqual({});
        expect(res.statusCode).toStrictEqual(200);
    });

    test('User details should be error if empty datastore', () => {
        const res = request('GET', SERVER_URL + '/v1/admin/auth/details', 
            {json: {token: -UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
    });

    test('Quiz list should be invalid if empty datastore', () => {
        const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', 
            {json: {token: UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
    });

    test('Quiz info should be error if empty datastore', () => {
        const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`, 
            {json: {token: UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
    });
});