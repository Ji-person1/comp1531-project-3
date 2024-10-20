import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;


const ERROR = { error: expect.any(String) };

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
})

describe('Error cases', () => {
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

    test('identical quiz restoration', () => {
        request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`, 
            {json: {token: UserToken.token}});
        request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserToken.token, name: "functional quiz", description: "a test quiz"}});
        const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/restore`, 
            {json: {token: UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('quiz not in trash', () => {
        const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/restore`, 
            {json: {token: UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('Invalid token', () => {
        request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`, 
            {json: {token: UserToken.token}});
        const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/restore`, 
            {json: {token: UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
    });

    test('Invalid quizId', () => {
        request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`, 
            {json: {token: UserToken.token}});
        const res = request('POST', SERVER_URL + `/v1/admin/quiz/${-quizId.quizId}/restore`, 
            {json: {token: UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
    });
});

describe('Success cases', () => {
    let UserToken: {token: number}
    let UserTokenTwo: {token: number}
    let quizId: {quizId: number}
    let quizIdTwo: {quizId: number}
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
    }); 

    test('Basic return success check', () => {
        request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`, 
            {json: {token: UserToken.token}});
        const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/restore`, 
            {json: {token: UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({});
        expect(res.statusCode).toStrictEqual(200);
    });

    test('Ssuccess check with a quizinfo', () => {
        request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`, 
            {json: {token: UserToken.token}});
        request('POST', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/restore`, 
            {json: {token: UserToken.token}});
        const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quizIdTwo.quizId}`, 
            {json: {token: UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({
            quizId: quizIdTwo.quizId,
            name: "second quiz",
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: "a test quiz",
            numQuestions: 0,
            questions: []
        });
        expect(res.statusCode).toStrictEqual(200);
    });
});