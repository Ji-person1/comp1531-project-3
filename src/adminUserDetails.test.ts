import {
  ServerAuthRegister, ServerUserDetails,
  ServerClear, ServerAuthLogin
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error cases', () => {
  let UserToken: {token: string};
  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
  });

  test('invalid user token', () => {
    const invalidToken = -Number(UserToken.token);
    const res = ServerUserDetails(invalidToken.toString());
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('no token', () => {
    const res = ServerUserDetails('');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });
});

describe('Success cases', () => {
  let UserToken: {token: string};
  let UserTokenTwo: {token: string};
  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    UserTokenTwo = ServerAuthRegister('z5394791@unsw.edu.au', '6789mnbv', 'Zim', 'Zheng').body;
  });

  test('Success case: A', () => {
    const res = ServerUserDetails(UserToken.token);
    expect(res.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Jim Zheng',
        email: 'jim.zheng123@icloud.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Success case: B', () => {
    const res = ServerUserDetails(UserTokenTwo.token);
    expect(res.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Zim Zheng',
        email: 'z5394791@unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Success case: login', () => {
    const loginToken: {token: string} = ServerAuthLogin('jim.zheng123@icloud.com', '1234abcd').body;
    const res = ServerUserDetails(loginToken.token);
    expect(res.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Jim Zheng',
        email: 'jim.zheng123@icloud.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(res.statusCode).toStrictEqual(200);
  });
});
