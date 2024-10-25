import {
  ServerAuthRegister,
  ServerClear,
  ServerAuthLogin,
  ServerAuthLogout,
  ServerUserPasswordUpdate
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error cases', () => {
  let UserToken: { token: string };
  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
  });

  test('Wrong old password', () => {
    const res = ServerUserPasswordUpdate(UserToken.token, '5555abcd', 'abcd1234');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('invalid first name', () => {
    const res = ServerUserPasswordUpdate(UserToken.token, '1234abcd', '1234abcd');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Resusing a password', () => {
    ServerUserPasswordUpdate(UserToken.token, '1234abcd', 'abcd1234');
    const res = ServerUserPasswordUpdate(UserToken.token, 'abcd1234', 'abcd1234');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('New password too short', () => {
    const res = ServerUserPasswordUpdate(UserToken.token, '1234abcd', 'abcd123');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('No letter in new password', () => {
    const res = ServerUserPasswordUpdate(UserToken.token, '1234abcd', '12345678');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('No numbers in new password', () => {
    const res = ServerUserPasswordUpdate(UserToken.token, '1234abcd', 'abcdefgh');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Prev passwords stores more than just the last password', () => {
    ServerUserPasswordUpdate(UserToken.token, '1234abcd', '1abcd234');
    ServerUserPasswordUpdate(UserToken.token, '1abcd234', 'abcdefgh22');
    ServerUserPasswordUpdate(UserToken.token, 'abcdefgh22', 'mm88!!ss');
    const res = ServerUserPasswordUpdate(UserToken.token, 'mm88!!ss', '1234abcd');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('formerly valid user token', () => {
    ServerAuthLogout(UserToken.token);
    const res = ServerUserPasswordUpdate(UserToken.token, '1234abcd', 'abcd1234');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('invalid user token', () => {
    const res = ServerUserPasswordUpdate(Number(-UserToken.token).toString(),
      '1234abcd', 'abcd1234');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });
});

describe('Success cases', () => {
  let UserToken: { token: string };
  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
  });

  test('correct return type', () => {
    const res = ServerUserPasswordUpdate(UserToken.token, '1234abcd', 'abcd1234');
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test('New password used to login', () => {
    const res = ServerUserPasswordUpdate(UserToken.token, '1234abcd', 'abcd1234');
    expect(res.statusCode).toStrictEqual(200);
    const resTwo = ServerAuthLogin('jim.zheng123@icloud.com', 'abcd1234');
    expect(resTwo.body).toStrictEqual({ token: expect.any(String) });
    expect(resTwo.statusCode).toStrictEqual(200);
  });

  test('Extremely long new password', () => {
    const res = ServerUserPasswordUpdate(UserToken.token, '1234abcd', 'a'.repeat(30) +
      '1'.repeat(30));
    expect(res.statusCode).toStrictEqual(200);
    const resTwo = ServerAuthLogin('jim.zheng123@icloud.com', 'a'.repeat(30) + '1'.repeat(30));
    expect(resTwo.body).toStrictEqual({ token: expect.any(String) });
    expect(resTwo.statusCode).toStrictEqual(200);
  });

  test('New passwork works even if token is logged out', () => {
    const res = ServerUserPasswordUpdate(UserToken.token, '1234abcd', 'abcd1234');
    expect(res.statusCode).toStrictEqual(200);
    ServerAuthLogout(UserToken.token);
    const resTwo = ServerAuthLogin('jim.zheng123@icloud.com', 'abcd1234');
    expect(resTwo.body).toStrictEqual({ token: expect.any(String) });
    expect(resTwo.statusCode).toStrictEqual(200);
  });
});
