import {
  ServerAuthRegister, ServerAuthLogin, ServerAuthLogout,
  ServerClear
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
    expect(logoutRes.statusCode).toBe(401);
    expect(logoutRes.body).toStrictEqual(ERROR);
  });

  test('Logout with empty token (401 Unauthorized)', () => {
    const emptyToken = '';
    const logoutRes = ServerAuthLogout(emptyToken);
    expect(logoutRes.statusCode).toBe(401);
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
    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.body).toStrictEqual({});
  });
});
