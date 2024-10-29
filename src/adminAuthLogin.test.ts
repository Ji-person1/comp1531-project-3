import { ServerClear, ServerAuthRegister, ServerAuthLogin } from './ServerTestCallHelper';

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
  test('correct with one account', () => {
    ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng');
    const res = ServerAuthLogin('jim.zheng123@icloud.com', '1234abcd');
    expect(res.body).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('correct with two accounts', () => {
    ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng');
    ServerAuthRegister('z5394791@unsw.edu.au', '6789mnbv', 'Zim', 'Zheng');
    const res = ServerAuthLogin('jim.zheng123@icloud.com', '1234abcd');
    const resTwo = ServerAuthLogin('z5394791@unsw.edu.au', '6789mnbv');
    expect(res.body).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
    expect(resTwo.body).toStrictEqual({ token: expect.any(String) });
    expect(resTwo.statusCode).toStrictEqual(200);
  });
});
