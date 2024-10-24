import {
  ServerAuthRegister, ServerQuizRemove, ServerQuizCreate,
  ServerClear, ServerQuizList
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
  });

  test('Invalid token', () => {
    const res = ServerQuizRemove((-Number(UserToken.token)).toString(), quizId.quizId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Invalid quizId', () => {
    const res = ServerQuizRemove(UserToken.token, -quizId.quizId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Not the owner of the quiz', () => {
    const UserTokenTwo = ServerAuthRegister('z5394791@unsw.edu.au', '1234abcd', 'Mij', 'Zeng').body;
    const errRes = ServerQuizRemove(UserTokenTwo.token, quizId.quizId);
    expect(errRes.body).toStrictEqual(ERROR);
    expect(errRes.statusCode).toStrictEqual(400);
  });
});

describe('Success cases', () => {
  let UserToken: { token: string };
  let UserTokenTwo: { token: string };
  let quizId: { quizId: number };
  let quizIdTwo: { quizId: number };
  let quizIdThree: { quizId: number };
  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    UserTokenTwo = ServerAuthRegister('z5394791@unsw.edu.au', '1234abcd', 'Mij', 'Zeng').body;
    quizId = ServerQuizCreate(UserToken.token, 'first quiz', 'a test quiz').body;
    quizIdTwo = ServerQuizCreate(UserToken.token, 'second quiz', 'a test quiz').body;
    quizIdThree = ServerQuizCreate(UserTokenTwo.token, 'third quiz', 'a test quiz').body;
  });

  test('Basic return success check', () => {
    const res = ServerQuizRemove(UserToken.token, quizId.quizId);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test('List check', () => {
    const resFirst = ServerQuizRemove(UserToken.token, quizIdTwo.quizId);
    expect(resFirst.body).toStrictEqual({});
    expect(resFirst.statusCode).toStrictEqual(200);
    const res = ServerQuizList(UserToken.token);
    expect(res.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId.quizId,
          name: 'first quiz'
        }
      ]
    });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Post deletion error on the list function', () => {
    ServerQuizRemove(UserTokenTwo.token, quizIdThree.quizId);
    const res = ServerQuizList(UserTokenTwo.token);
    expect(res.body).toStrictEqual({ quizzes: [] });
    expect(res.statusCode).toStrictEqual(200);
  });
});
