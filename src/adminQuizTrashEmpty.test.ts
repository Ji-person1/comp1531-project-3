import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Error Cases', () => {
    let UserToken: {token: number}
    let quizId: {quizId: number}
    beforeEach(() => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}})
        UserToken = JSON.parse(res.body.toString())
        const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserToken.token, name: "functional quiz", description: "a test quiz"}});
        quizId = JSON.parse(quizRes.body.toString())
    }); 

    test('Invalid token', () => {
        const quizArray = [quizId.quizId]
        const response = request('DELETE', `${SERVER_URL}/v1/admin/quiz/trash/empty`, {
            qs: { token: -UserToken.token, quizIds: quizArray },
            timeout: TIMEOUT_MS
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body.toString())).toEqual(ERROR);
    });

    test('Empty token', () => {
        const quizArray = [quizId.quizId]
        const response = request('DELETE', `${SERVER_URL}/v1/admin/quiz/trash/empty`, {
            qs: { token: '', quizIds: quizArray },
            timeout: TIMEOUT_MS
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body.toString())).toEqual(ERROR);
    });

    test('Quiz ID not in the trash', () => {
        const quizArray = [quizId.quizId]
        const response = request('DELETE', `${SERVER_URL}/v1/admin/quiz/trash/empty`, {
            qs: { token: UserToken.token, quizIds: quizArray },
            timeout: TIMEOUT_MS
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body.toString())).toEqual(ERROR);
    });

    test('Quiz does not belong to the user', () => {
        const quizArray = [quizId.quizId]
        request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`, 
            {qs: {token: UserToken.token}});
        const resTwo = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "z5394791@unsw.edu.au", password: "1234abcd", nameFirst: "Mij", nameLast: "Zeng"}})
        const UserTokenTwo = JSON.parse(resTwo.body.toString())

        const response = request('DELETE', `${SERVER_URL}/v1/admin/quiz/trash/empty`, {
            qs: { token: UserTokenTwo.token, quizIds: quizArray },
            timeout: TIMEOUT_MS
        });

        expect(JSON.parse(response.body.toString())).toEqual(ERROR);
        expect(response.statusCode).toBe(403);
    });
});

describe('Success Cases', () => {
    let UserToken: {token: number}
    let quizId: {quizId: number}
    let quizIdTwo: {quizId: number}
    let quizIdThree: {quizId: number}
    beforeEach(() => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}})
        UserToken = JSON.parse(res.body.toString())
        const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserToken.token, name: "first quiz", description: "a test quiz"}});
        quizId = JSON.parse(quizRes.body.toString())
        const quizResTwo = request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserToken.token, name: "second quiz", description: "a test quiz"}});
        quizIdTwo = JSON.parse(quizResTwo.body.toString())
        const quizResThree = request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserToken.token, name: "third quiz", description: "a test quiz"}});
        quizIdThree = JSON.parse(quizResThree.body.toString())
        request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`, 
            {qs: {token: UserToken.token}});
        request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizIdTwo.quizId}`, 
            {qs: {token: UserToken.token}});
        request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizIdThree.quizId}`, 
            {qs: {token: UserToken.token}});
    }); 

    test('Successful trash empty', () => {
        const quizIds = [quizId.quizId, quizIdTwo.quizId, quizIdThree.quizId];

        const response = request('DELETE', `${SERVER_URL}/v1/admin/quiz/trash/empty`, {
            qs: { token: UserToken.token, quizIds: JSON.stringify(quizIds) },
            timeout: TIMEOUT_MS
        });

        expect(JSON.parse(response.body.toString())).toEqual({});
        expect(response.statusCode).toBe(200);
    });
});