import {
  ServerClear, ServerAuthRegister,
  ServerAuthLogin, ServerUserDetails
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

// no beforeach in this case as we need to test for no registered users
describe('Error cases', () => {
  test('No registered users', () => {
    const res = ServerAuthLogin('jim.zheng123@icloud.com', '1234abcd');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('incorrect password/email case', () => {
    ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng');
    const res = ServerAuthLogin('jim.zheng123@icloud.com', '');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('incorrect password/email case', () => {
    ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng');
    const res = ServerAuthLogin('', '1234abcd');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Wrong account', () => {
    ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng');
    ServerAuthRegister('z5394791@unsw.edu.au', '6789mnbv', 'Zim', 'Zheng');
    const res = ServerAuthLogin('jim.zheng123@icloud.com', '6789mnbv');
    const resTwo = ServerAuthLogin('z5394791@unsw.edu.au', '1234abcd');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
    expect(resTwo.body).toStrictEqual(ERROR);
    expect(resTwo.statusCode).toStrictEqual(400);
  });
});

describe('Success cases', () => {
  beforeEach(() => {
    ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng');
    ServerAuthRegister('z5394791@unsw.edu.au', '6789mnbv', 'Zim', 'Zheng');
  });
  test('correct with one account', () => {
    const res = ServerAuthLogin('jim.zheng123@icloud.com', '1234abcd');
    expect(res.body).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('correct with two accounts', () => {
    const res = ServerAuthLogin('jim.zheng123@icloud.com', '1234abcd');
    const resTwo = ServerAuthLogin('z5394791@unsw.edu.au', '6789mnbv');
    expect(res.body).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
    expect(resTwo.body).toStrictEqual({ token: expect.any(String) });
    expect(resTwo.statusCode).toStrictEqual(200);
  });

  test('Increases the amount of logins', () => {
    for (let i = 0; i < 10; i++) {
      const res = ServerAuthLogin('jim.zheng123@icloud.com', '1234abcd');
      expect(res.statusCode).toStrictEqual(200);
    }
    const token = ServerAuthLogin('jim.zheng123@icloud.com', '1234abcd').body;
    const resInfo = ServerUserDetails(token.token);
    expect(resInfo.statusCode).toStrictEqual(200);
    expect(resInfo.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Jim Zheng',
        email: 'jim.zheng123@icloud.com',
        numSuccessfulLogins: 12,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });

  test('Increases the amount of failed logins', () => {
    const token = ServerAuthLogin('jim.zheng123@icloud.com', '1234abcd').body;
    for (let i = 0; i < 10; i++) {
      const res = ServerAuthLogin('jim.zheng123@icloud.com', '');
      expect(res.statusCode).toStrictEqual(400);
    }
    const resInfo = ServerUserDetails(token.token);
    expect(resInfo.statusCode).toStrictEqual(200);
    expect(resInfo.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Jim Zheng',
        email: 'jim.zheng123@icloud.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 10
      }
    });
  });
});
