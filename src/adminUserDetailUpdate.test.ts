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
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/details', 
            {json: {token: -UserToken.token, email: "hayden.smith@unsw.edu.au", nameFirst: "Hayden", nameLast: "Smith"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
    });
    
    test('invalid email', () => {
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/details', 
            {json: {token: UserToken.token, email: "No", nameFirst: "Hayden", nameLast: "Smith"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('invalid first name', () => {
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/details', 
            {json: {token: UserToken.token, email: "hayden.smith@unsw.edu.au", nameFirst: "!!", nameLast: "Smith"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('invalid last name', () => {
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/details', 
            {json: {token: UserToken.token, email: "hayden.smith@unsw.edu.au", nameFirst: "Hayden", nameLast: "!!"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('Too long first name name', () => {
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/details', 
            {json: {token: UserToken.token, email: "hayden.smith@unsw.edu.au", nameFirst: "a".repeat(30), nameLast: "Smith"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('Too short first name name', () => {
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/details', 
            {json: {token: UserToken.token, email: "hayden.smith@unsw.edu.au", nameFirst: "a", nameLast: "Smith"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('Too long last name', () => {
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/details', 
            {json: {token: UserToken.token, email: "hayden.smith@unsw.edu.au", nameFirst: "Hayden", nameLast: "a".repeat(30)}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('Too short last name', () => {
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/details', 
            {json: {token: UserToken.token, email: "hayden.smith@unsw.edu.au", nameFirst: "Hayden", nameLast: "a"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test.todo("implement a test once we have logout implemented")
});

describe('Success cases', () => {
    let UserToken: {token: number}
    beforeEach(() => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}});
        UserToken = JSON.parse(res.body.toString())
    })

    test('correct with one account', () => {
        const res = request('GET', SERVER_URL + '/v1/admin/auth/details', 
            {json: {token: UserToken.token}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({
            user: {
                userId: expect.any(Number),
                name: "Jim Zheng",
                email: "jim.zheng123@icloud.com",
                numSuccessfulLogins: 0,
                numFailedPasswordsSinceLastLogin: 0
            }
        });
        const resTwo = request('PUT', SERVER_URL + '/v1/admin/auth/details', 
            {json: {token: UserToken.token, email: "hayden.smith@unsw.edu.au", nameFirst: "Hayden", nameLast: "Smith"}});
        expect(JSON.parse(resTwo.body.toString())).toStrictEqual({});
        expect(resTwo.statusCode).toStrictEqual(200);
        const resThree = request('GET', SERVER_URL + '/v1/admin/auth/details', 
            {json: {token: UserToken.token}});
        expect(JSON.parse(resThree.body.toString())).toStrictEqual({
            user: {
                userId: expect.any(Number),
                name: "Hayden Smith",
                email: "hayden.smith@unsw.edu.au",
                numSuccessfulLogins: 0,
                numFailedPasswordsSinceLastLogin: 0
            }
        });
    });
});