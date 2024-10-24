import {
  ServerAuthRegister, ServerQuizCreate, ServerClear,
  ServerQuizList, ServerUserDetails, ServerQuizInfo
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Function tests', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    quizId = ServerQuizCreate(UserToken.token, 'first quiz', 'a test quiz').body;
    ServerClear();
  });

  test('Return type check', () => {
    const res = ServerClear();
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test('User details should be error if empty datastore', () => {
    const res = ServerUserDetails(UserToken.token);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Quiz list should be invalid if empty datastore', () => {
    const res = ServerQuizList(UserToken.token);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Quiz info should be error if empty datastore', () => {
    const res = ServerQuizInfo(UserToken.token, quizId.quizId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });
});
