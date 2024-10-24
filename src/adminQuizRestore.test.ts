import {
  ServerAuthRegister, ServerQuizCreate, ServerQuizRemove,
  ServerQuizRestore, ServerQuizInfo, ServerClear
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error Cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
  });

  test('identical quiz restoration', () => {
    ServerQuizRemove(UserToken.token, quizId.quizId);
    ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz');
    const res = ServerQuizRestore(UserToken.token, quizId.quizId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('quiz not in trash', () => {
    const res = ServerQuizRestore(UserToken.token, quizId.quizId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid quizId', () => {
    ServerQuizRemove(UserToken.token, quizId.quizId);
    const res = ServerQuizRestore(UserToken.token, -quizId.quizId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid token', () => {
    ServerQuizRemove(UserToken.token, quizId.quizId);
    const res = ServerQuizRestore('-' + UserToken.token, quizId.quizId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
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
  });

  test('Basic return success check', () => {
    ServerQuizRemove(UserToken.token, quizId.quizId);
    const res = ServerQuizRestore(UserToken.token, quizId.quizId);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Success check with a quizinfo', () => {
    ServerQuizRemove(UserToken.token, quizId.quizId);
    ServerQuizRestore(UserToken.token, quizId.quizId);
    const res = ServerQuizInfo(UserToken.token, quizIdTwo.quizId);
    expect(res.body).toStrictEqual({
      quizId: quizIdTwo.quizId,
      name: 'second quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'a test quiz',
      numQuestions: 0,
      questions: []
    });
    expect(res.statusCode).toStrictEqual(200);
  });
});
