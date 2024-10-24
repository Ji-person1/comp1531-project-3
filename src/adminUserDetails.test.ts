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
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}});
        UserToken = JSON.parse(res.body.toString())
    })

    test('invalid user token', () => {
        const res = request('GET', SERVER_URL + '/v1/admin/auth/details', 
            {qs: {token: -UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
    });

    test('no token', () => {
        const res = request('GET', SERVER_URL + '/v1/admin/auth/details', 
            {qs: {token: ''}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
    });
});

describe('Success cases', () => {
    let UserToken: {token: number}
    let UserTokenTwo: {token: number}
    beforeEach(() => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}});
        const resTwo = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "z5394791@unsw.edu.au", password: "6789mnbv", nameFirst: "Zim", nameLast: "Zheng"}});
        UserToken = JSON.parse(res.body.toString())
        UserTokenTwo = JSON.parse(resTwo.body.toString())
    })

    test('Success case: A', () => {
        const res = request('GET', SERVER_URL + '/v1/admin/auth/details', 
            {qs: {token: UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({
            user: {
                userId: expect.any(Number),
                name: "Jim Zheng",
                email: "jim.zheng123@icloud.com",
                numSuccessfulLogins: 0,
                numFailedPasswordsSinceLastLogin: 0
            }
        });
        expect(res.statusCode).toStrictEqual(200);
    });

    test('Success case: B', () => {
        const res = request('GET', SERVER_URL + '/v1/admin/auth/details', 
            {qs: {token: UserTokenTwo.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({
            user: {
                userId: expect.any(Number),
                name: "Zim Zheng",
                email: "z5394791@unsw.edu.au",
                numSuccessfulLogins: 0,
                numFailedPasswordsSinceLastLogin: 0
            }
        });
        expect(res.statusCode).toStrictEqual(200);
    });

    test('Success case: login', () => {
        let loginToken: {token: number}
        const resOne = request('POST', SERVER_URL + '/v1/admin/auth/login', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd"}});
        loginToken = JSON.parse(resOne.body.toString())
        const res = request('GET', SERVER_URL + '/v1/admin/auth/details', 
            {qs: {token: loginToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({
            user: {
                userId: expect.any(Number),
                name: "Jim Zheng",
                email: "jim.zheng123@icloud.com",
                numSuccessfulLogins: 1,
                numFailedPasswordsSinceLastLogin: 0
            }
        });
        expect(res.statusCode).toStrictEqual(200);
    });
});