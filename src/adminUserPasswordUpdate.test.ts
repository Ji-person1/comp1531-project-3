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
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/password', 
            {json: {token: -UserToken.token, oldPassword: "1234abcd", newPassword: "1234567A"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
    });

    test('same password', () => {
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/password', 
            {json: {token: UserToken.token, oldPassword: "1234abcd", newPassword: "1234abcd"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('incorrect password', () => {
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/password', 
            {json: {token: UserToken.token, oldPassword: "1234567A", newPassword: "1234567A"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('Password used before', () => {
        request('PUT', SERVER_URL + '/v1/admin/auth/password', 
            {json: {token: UserToken.token, oldPassword: "1234abcd", newPassword: "1234567A"}});
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/password', 
            {json: {token: UserToken.token, oldPassword: "1234567A", newPassword: "1234abcd"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('New password too short', () => {
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/password', 
            {json: {token: UserToken.token, oldPassword: "1234abcd", newPassword: "1"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('New password has no letters', () => {
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/password', 
            {json: {token: UserToken.token, oldPassword: "1234abcd", newPassword: "12345678"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test('New password has no numbers', () => {
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/password', 
            {json: {token: UserToken.token, oldPassword: "1234abcd", newPassword: "abcdefgh"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });

    test.todo("probably something once we have the logout implemented")
});

describe('Success cases', () => {
    let UserToken: {token: number}
    beforeEach(() => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}});
        UserToken = JSON.parse(res.body.toString())
    })

    test('Success test', () => {
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/password', 
            {json: {token: UserToken.token, oldPassword: "1234abcd", newPassword: "1234567A"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({});
        expect(res.statusCode).toStrictEqual(200);
    });

    test('Success test with a login', () => {
        const res = request('PUT', SERVER_URL + '/v1/admin/auth/password', 
            {json: {token: UserToken.token, oldPassword: "1234abcd", newPassword: "1234567A"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({});
        expect(res.statusCode).toStrictEqual(200);
        const resLoginF = request('POST', SERVER_URL + '/v1/admin/auth/login', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd"}});
        expect(JSON.parse(resLoginF.body.toString())).toStrictEqual(ERROR);
        expect(resLoginF.statusCode).toStrictEqual(400);
        const resLoginS = request('POST', SERVER_URL + '/v1/admin/auth/login', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234567A"}});
        expect(JSON.parse(resLoginS.body.toString())).toStrictEqual({token: expect.any(Number)});
        expect(resLoginS.statusCode).toStrictEqual(200);
    });
});