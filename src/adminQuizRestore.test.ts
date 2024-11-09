import {
  ServerAuthRegister, ServerQuizCreate, ServerQuizRemove,
  ServerQuizRestore, ServerQuizInfo, ServerClear,
  ServerQuizTrash,
  ServerQuizList
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

  test('quiz already restored', () => {
    const removeRes = ServerQuizRemove(UserToken.token, quizId.quizId);
    expect(removeRes.statusCode).toStrictEqual(200);
    const resInit = ServerQuizRestore(UserToken.token, quizId.quizId);
    expect(resInit.statusCode).toStrictEqual(200);
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
    const res = ServerQuizRestore(Number(-UserToken.token).toString(), quizId.quizId);
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
    ServerQuizRemove(UserToken.token, quizId.quizId);
  });

  test('Basic return success check', () => {
    const res = ServerQuizRestore(UserToken.token, quizId.quizId);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Success check with a quizinfo', () => {
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

  test('Success check with a quizlist and quiztrash', () => {
    ServerQuizRestore(UserToken.token, quizId.quizId);
    const res = ServerQuizList(UserToken.token);
    expect(res.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizIdTwo.quizId,
          name: 'second quiz',
        },
        {
          quizId: quizId.quizId,
          name: 'first quiz',
        }
      ]
    });
    expect(res.statusCode).toStrictEqual(200);
    const resTrash = ServerQuizTrash(UserToken.token);
    expect(resTrash.body).toStrictEqual({
      quizzes: []
    });
    expect(resTrash.statusCode).toStrictEqual(200);
  });
});
