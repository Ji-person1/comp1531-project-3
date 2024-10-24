import { ServerAuthRegister, ServerClear } from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error cases', () => {
  test('invalid email', () => {
    const res = ServerAuthRegister('no', '1234abcd', 'Jim', 'Zheng');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });
  test('Password too short', () => {
    const res = ServerAuthRegister('jim.zheng123@icloud.com', 'no', 'Jim', 'Zheng');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });
  test('Password only letters', () => {
    const res = ServerAuthRegister('jim.zheng123@icloud.com', 'aaaaaaaa', 'Jim', 'Zheng');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });
  test('Password only numbers', () => {
    const res = ServerAuthRegister('jim.zheng123@icloud.com', '12345678', 'Jim', 'Zheng');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });
  test('invalid first name', () => {
    const res = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', '1234', 'Zheng');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });
  test('invalid last name', () => {
    const res = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', '1234');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });
  test('reused email', () => {
    ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng');
    const res = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success cases', () => {
  test('Correct basic case', () => {
    const res = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng');
    expect(res.body).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });
  test('Correct long password case', () => {
    const res = ServerAuthRegister('jim.zheng123@icloud.com', '123456789ABCDEFGhijklmno',
      'Jim', 'Zheng');
    expect(res.body).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });
  test('Correct weird names case', () => {
    const res = ServerAuthRegister('jim.zheng123@icloud.com', '123456789ABCDEFGhijklmno',
      'Jim-ello', 'What is my last name');
    expect(res.body).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });
});
