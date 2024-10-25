import {
  ServerAuthRegister, ServerAuthLogin, ServerAuthLogout,
  ServerClear,
  ServerUserDetails,
  ServerQuizList
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error Cases', () => {
  let UserToken: { token: string };
  beforeEach(() => {
    UserToken = ServerAuthRegister('swapnav.saikia123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
  });

  test('Logout with invalid token (401 Unauthorized)', () => {
    const invalidToken = Number(-UserToken.token).toString();
    const logoutRes = ServerAuthLogout(invalidToken);
    expect(logoutRes.statusCode).toStrictEqual(401);
    expect(logoutRes.body).toStrictEqual(ERROR);
  });

  test('Logout with empty token (401 Unauthorized)', () => {
    const emptyToken = '';
    const logoutRes = ServerAuthLogout(emptyToken);
    expect(logoutRes.statusCode).toStrictEqual(401);
    expect(logoutRes.body).toStrictEqual(ERROR);
  });

  test('Logout with an inactive token (401 Unauthorized)', () => {
    const emptyToken = '';
    const res = ServerAuthLogout(UserToken.token);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({});
    const logoutRes = ServerAuthLogout(emptyToken);
    expect(logoutRes.statusCode).toStrictEqual(401);
    expect(logoutRes.body).toStrictEqual(ERROR);
  });
});

describe('Success Cases', () => {
  let UserToken: { token: string };
  beforeEach(() => {
    const loginRes = ServerAuthLogin('swapnav.saikia123@icloud.com', '1234abcd');
    if (loginRes.statusCode === 200) {
      UserToken = loginRes.body;
    } else {
      UserToken = ServerAuthRegister('swapnav.saikia123@icloud.com', '1234abcd',
        'Jim', 'Zheng').body;
    }
  });

  test('Successful logout (200 OK)', () => {
    const logoutRes = ServerAuthLogout(UserToken.token);
    expect(logoutRes.statusCode).toStrictEqual(200);
    expect(logoutRes.body).toStrictEqual({});
  });

  test('Successful logout followed by login (200 OK)', () => {
    const logoutRes = ServerAuthLogout(UserToken.token);
    expect(logoutRes.statusCode).toStrictEqual(200);
    expect(logoutRes.body).toStrictEqual({});
    const loginRes = ServerAuthLogin('swapnav.saikia123@icloud.com', '1234abcd');
    expect(loginRes.statusCode).toStrictEqual(200);
    expect(loginRes.body).toStrictEqual({ token: expect.any(String) });
  });

  test('Successful logout cannot be used in other functions', () => {
    const logoutRes = ServerAuthLogout(UserToken.token);
    expect(logoutRes.statusCode).toStrictEqual(200);
    expect(logoutRes.body).toStrictEqual({});
    const resDetails = ServerUserDetails(UserToken.token);
    expect(resDetails.statusCode).toStrictEqual(401);
    expect(resDetails.body).toStrictEqual(ERROR);
    const resList = ServerQuizList(UserToken.token);
    expect(resList.statusCode).toStrictEqual(401);
    expect(resList.body).toStrictEqual(ERROR);
  });
});
