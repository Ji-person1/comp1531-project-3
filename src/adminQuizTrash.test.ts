import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Error Cases', () => {
    let UserToken: { token: number };

    beforeEach(() => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            { json: { email: "Swapnav.saikia123@icloud.com", password: "1234abcd", nameFirst: "Swapnav", nameLast: "Saikia" } });
        UserToken = JSON.parse(res.body.toString());
        request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserToken.token, name: "functional quiz", description: "a test quiz"}});
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
    let UserToken: {token: number}
    let UserTokenTwo: {token: number}
    let quizId: {quizId: number}
    let quizIdTwo: {quizId: number}
    let quizIdThree: {quizId: number}
    beforeEach(() => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}})
        UserToken = JSON.parse(res.body.toString())
        const resTwo = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "z5394791@unsw.edu.au", password: "1234abcd", nameFirst: "Mij", nameLast: "Zeng"}})
        UserTokenTwo = JSON.parse(resTwo.body.toString())
        const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserToken.token, name: "first quiz", description: "a test quiz"}});
        quizId = JSON.parse(quizRes.body.toString())
        const quizResTwo = request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserToken.token, name: "second quiz", description: "a test quiz"}});
        quizIdTwo = JSON.parse(quizResTwo.body.toString())
        const quizResThree = request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserTokenTwo.token, name: "third quiz", description: "a test quiz"}});
        quizIdThree = JSON.parse(quizResThree.body.toString())
        request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`, 
            {qs: {token: UserToken.token}});
        request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizIdTwo.quizId}`, 
            {qs: {token: UserToken.token}});
    });

    test('Valid token', () => {
        const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', {
            qs: { token: UserToken.token }, 
            timeout: TIMEOUT_MS
        });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body.toString())).toStrictEqual({quizzes: [
            {
                quizId: expect.any(Number),
                name: "first quiz"
            },
            {
                quizId: expect.any(Number),
                name: "second quiz"
            }
        ]});
        expect(res.statusCode).toStrictEqual(200);
    });
});