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
    beforeEach(() => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}})
        UserToken = JSON.parse(res.body.toString())
    }); 

    test('Invalid id with no quizzes', () => {
        const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', 
            {json: {token: -UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
    });

    test('Invalid id with no quizzes', () => {
        request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserToken, name: "Quiz test", description: "a test quiz"}});
        const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', 
            {json: {token: -UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
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
            {json: {token: UserToken.token, name: "functional quiz", description: "a test quiz"}});
        quizId = JSON.parse(quizRes.body.toString())
    }); 
    test('Correct basic case', () => {
        const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', 
            {json: {token: UserToken.token, name: "functional quiz", description: "a test quiz"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({quizzes: [
            {
                quizId: quizId.quizId,
                name: "functional quiz"
            }
        ]});
        expect(res.statusCode).toStrictEqual(200);
    });

    test('multiple quizzes', () => {
        const responseQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserToken.token, name: "Usable quiz", description: "a test quiz"}});
        const QuizTwo = JSON.parse(responseQuiz.body.toString())
        const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', 
            {json: {token: UserToken.token, name: "functional quiz", description: "a test quiz"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({quizzes: [
            {
                quizId: quizId.quizId,
                name: "functional quiz"
            },
            {
                quizId: QuizTwo.quizId,
                name: "Usable quiz"
            }
        ]});
        expect(res.statusCode).toStrictEqual(200);
    });
});