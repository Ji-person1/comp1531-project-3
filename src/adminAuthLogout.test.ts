import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;


const ERROR = { error: expect.any(String) };

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
})

describe('Error Cases', () => {
    let UserToken: {token: number}
    beforeEach(() => {
        const loginRes = request('POST', SERVER_URL + '/v1/admin/auth/login', 
            {json: {email: "swapnav.saikia123@icloud.com", password: "1234abcd"}});
    
        if (loginRes.statusCode === 200) {
            UserToken = JSON.parse(loginRes.body.toString());
        } else {
            const registerRes = request('POST', SERVER_URL + '/v1/admin/auth/register', 
                {json: {email: "swapnav.saikia123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}});
            UserToken = JSON.parse(registerRes.body.toString());
        }
    })

    test('Logout with invalid token (401 Unauthorized)', () => {
        const invalidToken = "invalid_token_123";

        const logoutRes = request('POST', SERVER_URL + '/v1/admin/auth/logout', {
            json: { token: invalidToken },
            timeout: TIMEOUT_MS
        });

        expect(logoutRes.statusCode).toBe(401);
        expect(JSON.parse(logoutRes.body.toString())).toEqual(ERROR);
    });

    test('Logout with empty token (401 Unauthorized)', () => {
        const emptyToken = "";

        const logoutRes = request('POST', SERVER_URL + '/v1/admin/auth/logout', {
            json: { token: emptyToken },
            timeout: TIMEOUT_MS
        });

        expect(logoutRes.statusCode).toBe(401);
        expect(JSON.parse(logoutRes.body.toString())).toEqual(ERROR);
    });

});

describe('Success Cases', () => {
    let UserToken: {token: number}
    beforeEach(() => {
        const loginRes = request('POST', SERVER_URL + '/v1/admin/auth/login', 
            {json: {email: "swapnav.saikia123@icloud.com", password: "1234abcd"}});
    
        if (loginRes.statusCode === 200) {
            UserToken = JSON.parse(loginRes.body.toString());
        } else {
            const registerRes = request('POST', SERVER_URL + '/v1/admin/auth/register', 
                {json: {email: "swapnav.saikia123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}});
            UserToken = JSON.parse(registerRes.body.toString());
        }
    })

    test('Successful logout (200 OK)', () => {
        const logoutRes = request('POST', SERVER_URL + '/v1/admin/auth/logout', {
            json: { token: UserToken.token },
            timeout: TIMEOUT_MS
        });

        expect(logoutRes.statusCode).toBe(200);
        expect(JSON.parse(logoutRes.body.toString())).toEqual({});
    });
})