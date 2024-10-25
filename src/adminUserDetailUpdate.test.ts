import {
  ServerAuthRegister, ServerUserDetails,
  ServerClear, ServerUserDetailsUpdate,
  ServerAuthLogout
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

  test('invalid email', () => {
    const res = ServerUserDetailsUpdate(UserToken.token, 'No', 'Hayden', 'Smith');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('invalid first name', () => {
    const res = ServerUserDetailsUpdate(UserToken.token, 'hayden.smith@unsw.edu.au', '!!', 'Smith');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('invalid last name', () => {
    const res = ServerUserDetailsUpdate(UserToken.token, 'hayden.smith@unsw.edu.au',
      'Hayden', '!!');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Too long first name', () => {
    const res = ServerUserDetailsUpdate(UserToken.token, 'hayden.smith@unsw.edu.au',
      'a'.repeat(30), 'Smith');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Too short first name', () => {
    const res = ServerUserDetailsUpdate(UserToken.token, 'hayden.smith@unsw.edu.au', 'a', 'Smith');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Too long last name', () => {
    const res = ServerUserDetailsUpdate(UserToken.token, 'hayden.smith@unsw.edu.au',
      'Hayden', 'a'.repeat(30));
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Too short last name', () => {
    const res = ServerUserDetailsUpdate(UserToken.token, 'hayden.smith@unsw.edu.au', 'Hayden', 'a');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('invalid user token', () => {
    const res = ServerUserDetails((-Number(UserToken.token)).toString());
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('No longer valid token', () => {
    ServerAuthLogout(UserToken.token);
    const res = ServerUserDetails(UserToken.token);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });
});

describe('Success cases', () => {
  let UserToken: {token: string};
  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
  });

  test('correct with one account', () => {
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

    const resTwo = ServerUserDetailsUpdate(UserToken.token, 'hayden.smith@unsw.edu.au',
      'Hayden', 'Smith');
    expect(resTwo.body).toStrictEqual({});
    expect(resTwo.statusCode).toStrictEqual(200);

    const resThree = ServerUserDetails(UserToken.token);
    expect(resThree.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Hayden Smith',
        email: 'hayden.smith@unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
});
