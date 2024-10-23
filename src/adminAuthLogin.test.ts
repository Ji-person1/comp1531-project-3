import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;


const ERROR = { error: expect.any(String) };

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
})

describe('Error cases', () => {
    test('No registered users', () => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/login', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400); 
    });

    test('incorrect password/email case', () => {
        request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}});
        const res = request('POST', SERVER_URL + '/v1/admin/auth/login', 
            {json: {email: "jim.zheng123@icloud.com", password: ""}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400); 
        const resTwo = request('POST', SERVER_URL + '/v1/admin/auth/login', 
            {json: {email: "", password: "1234abcd"}});
        expect(JSON.parse(resTwo.body.toString())).toStrictEqual(ERROR);
        expect(resTwo.statusCode).toStrictEqual(400); 
    });

    test('Wrong account', () => {
        request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}});
        request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "z5394791@unsw.edu.au", password: "6789mnbv", nameFirst: "Zim", nameLast: "Zheng"}});
        const res = request('POST', SERVER_URL + '/v1/admin/auth/login', 
            {json: {email: "jim.zheng123@icloud.com", password: "6789mnbv"}});
        const resTwo = request('POST', SERVER_URL + '/v1/admin/auth/login', 
            {json: {email: "z5394791@unsw.edu.au", password: "1234abcd"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400); 
        expect(JSON.parse(resTwo.body.toString())).toStrictEqual(ERROR);
        expect(resTwo.statusCode).toStrictEqual(400); 
    });
});

describe('Success cases', () => {
    test('correct with one account', () => {
        request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}});
        const res = request('POST', SERVER_URL + '/v1/admin/auth/login', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({token: expect.any(String)});
        expect(res.statusCode).toStrictEqual(200);
    });

    test('correct with two accounts', () => {
        request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd", nameFirst: "Jim", nameLast: "Zheng"}});
        request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "z5394791@unsw.edu.au", password: "6789mnbv", nameFirst: "Zim", nameLast: "Zheng"}});
        const res = request('POST', SERVER_URL + '/v1/admin/auth/login', 
            {json: {email: "jim.zheng123@icloud.com", password: "1234abcd"}});
        const resTwo = request('POST', SERVER_URL + '/v1/admin/auth/login', 
            {json: {email: "z5394791@unsw.edu.au", password: "6789mnbv"}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({token: expect.any(String)});
        expect(res.statusCode).toStrictEqual(200);
        expect(JSON.parse(resTwo.body.toString())).toStrictEqual({token: expect.any(String)});
        expect(resTwo.statusCode).toStrictEqual(200);
    });
});