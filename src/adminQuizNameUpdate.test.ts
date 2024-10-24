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

    test('Invalid characters', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/name`, 
            {json: {token: UserToken.token, name: "1237_="}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('Name too short', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/name`, 
            {json: {token: UserToken.token, name: "a"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('Identical names', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/name`, 
            {json: {token: UserToken.token, name: "functional quiz"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });
    
    test('name used in another quiz', () => {
        request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserToken.token, name: "Very functional quiz", description: "a test quiz"}});
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/name`, 
            {json: {token: UserToken.token, name: "Very functional quiz"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('Name too long', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/name`, 
            {json: {token: UserToken.token, name: "a".repeat(50)}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('Invalid token', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/name`, 
            {json: {token: -UserToken.token, name: "Normal name"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
    });

    test('Quiz does not exist', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${-quizId.quizId}/name`, 
            {json: {token: UserToken.token, name: "Normal name"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(403);
    });

    test('not the owner of the quiz', () => {
        const resTwo = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "z5394791@unsw.edu.au", password: "1234abcd", nameFirst: "Mij", nameLast: "Zeng"}})
        const UserTokenTwo = JSON.parse(resTwo.body.toString())
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/name`, 
            {json: {token: UserTokenTwo.token, name: "Normal name"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(403);
    });
});

describe('Success cases', () => {
    let UserToken: {token: number}
    let quizId: {quizId: number}
    beforeEach(() => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}})
        UserToken = JSON.parse(res.body.toString())
        const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserToken.token, name: "first quiz", description: "a test quiz"}});
        quizId = JSON.parse(quizRes.body.toString())
    }); 

    test('Return type check', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/name`, 
            {json: {token: UserToken.token, name: "Normal name"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({});
        expect(res.statusCode).toStrictEqual(200);
    });

    test('Update check with quizinfo', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/name`, 
            {json: {token: UserToken.token, name: "Normal name"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({});
        expect(res.statusCode).toStrictEqual(200);
        const resTwo = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`, 
            {qs: {token: UserToken.token}});
        expect(JSON.parse(resTwo.body.toString())).toStrictEqual({
            quizId: quizId.quizId,
            name: "Normal name",
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: "a test quiz",
            numQuestions: 0,
            questions: []
        });
        expect(res.statusCode).toStrictEqual(200);
    });
});