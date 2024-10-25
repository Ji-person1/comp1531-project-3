import {
  ServerAuthRegister, ServerQuizCreate, ServerQuizTrash,
  ServerClear, ServerQuizRemove,
  ServerAuthLogout,
  ServerQuizRestore,
  ServerQuizList
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error Cases', () => {
  let UserToken: { token: string };

  beforeEach(() => {
    UserToken = ServerAuthRegister('Swapnav.saikia123@icloud.com', '1234abcd',
      'Swapnav', 'Saikia').body;
    ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz');
  });

  test('Invalid token', () => {
    const res = ServerQuizTrash('invalidToken');
    expect(res.statusCode).toStrictEqual(401);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Empty token', () => {
    const res = ServerQuizTrash('');
    expect(res.statusCode).toStrictEqual(401);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Logged out token', () => {
    const logoutRes = ServerAuthLogout(UserToken.token);
    expect(logoutRes.statusCode).toStrictEqual(200);
    const res = ServerQuizTrash(UserToken.token);
    expect(res.statusCode).toStrictEqual(401);
    expect(res.body).toStrictEqual(ERROR);
  });
});

describe('Success Cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let quizIdTwo: { quizId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;

    quizId = ServerQuizCreate(UserToken.token, 'first quiz', 'a test quiz').body;
    quizIdTwo = ServerQuizCreate(UserToken.token, 'second quiz', 'a test quiz').body;
    ServerQuizRemove(UserToken.token, quizId.quizId);
    ServerQuizRemove(UserToken.token, quizIdTwo.quizId);
  });

  test('Valid token', () => {
    const res = ServerQuizTrash(UserToken.token);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'first quiz'
        },
        {
          quizId: expect.any(Number),
          name: 'second quiz'
        }
      ]
    });
  });

  test('Empty trash for new user', () => {
    const userTokenTwo = ServerAuthRegister('Swastik2@gmail.com', 'password456',
      'Neo', 'Mishra').body;
    const res = ServerQuizTrash(userTokenTwo.token);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({
      quizzes: []
    });
  });

  test('Trash gone after restoring', () => {
    const resRestore = ServerQuizRestore(UserToken.token, quizId.quizId);
    expect(resRestore.statusCode).toStrictEqual(200);
    const res = ServerQuizTrash(UserToken.token);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'second quiz'
        }
      ]
    });
    const resList = ServerQuizList(UserToken.token);
    expect(resList.statusCode).toStrictEqual(200);
    expect(resList.body).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'first quiz'
        }
      ]
    });
  });
});
