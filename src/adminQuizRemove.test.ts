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

    test('Invalid token', () => {
        const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`, 
            {qs: {token: -UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
    });

    test('Invalid quizId', () => {
        const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${-quizId.quizId}`, 
            {qs: {token: UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('Not the owner of the quiz', () => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "z5394791@unsw.edu.au", password: "1234abcd", nameFirst: "Mij", nameLast: "Zeng"}})
        const UserTokenTwo = JSON.parse(res.body.toString())
        const errRes = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`, 
            {qs: {token: UserTokenTwo.token}});
        expect(JSON.parse(errRes.body.toString())).toStrictEqual(ERROR);
        expect(errRes.statusCode).toStrictEqual(400);
    });
});

describe('Success cases', () => {
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
    }); 

    test('Basic return success check', () => {
        const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`, 
            {qs: {token: UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({});
        expect(res.statusCode).toStrictEqual(200);
    });

    test('List check', () => {
        const resFirst = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizIdTwo.quizId}`, 
            {qs: {token: UserToken.token}});
        expect(JSON.parse(resFirst.body.toString())).toStrictEqual({});
        expect(resFirst.statusCode).toStrictEqual(200);
        const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', 
            {qs: {token: UserToken.token, name: "functional quiz", description: "a test quiz"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({quizzes: [
            {
                quizId: quizId.quizId,
                name: "first quiz"
            }
        ]});
        expect(res.statusCode).toStrictEqual(200);
    });

    test('Post deletion error on the list function', () => {
        request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizIdThree.quizId}`, 
            {qs: {token: UserTokenTwo.token}});
        const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', 
            {qs: {token: UserTokenTwo.token, name: "functional quiz", description: "a test quiz"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({quizzes: []});
        expect(res.statusCode).toStrictEqual(200);
    });
});