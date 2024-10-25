import {
  ServerAuthRegister, ServerQuizCreate,
  ServerClear, ServerQuizInfo,
  ServerAuthLogout
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
    const res = ServerQuizInfo((-Number(UserToken.token)).toString(), quizId.quizId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Logged out user', () => {
    ServerAuthLogout(UserToken.token);
    const res = ServerQuizInfo(UserToken.token, quizId.quizId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Invalid quizId', () => {
    const res = ServerQuizInfo(UserToken.token, -quizId.quizId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Not the owner of the quiz', () => {
    const UserTokenTwo = ServerAuthRegister('z5394791@unsw.edu.au', '1234abcd', 'Mij', 'Zeng').body;
    const errRes = ServerQuizInfo(UserTokenTwo.token, quizId.quizId);
    expect(errRes.body).toStrictEqual(ERROR);
    expect(errRes.statusCode).toStrictEqual(403);
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
    const res = ServerQuizInfo(UserToken.token, quizId.quizId);
    expect(res.body).toStrictEqual({
      quizId: quizId.quizId,
      name: 'first quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'a test quiz',
      numQuestions: 0,
      questions: []
    });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Success check with multiple quizzes for a user', () => {
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

  test('Success check with multiple users', () => {
    const res = ServerQuizInfo(UserTokenTwo.token, quizIdThree.quizId);
    expect(res.body).toStrictEqual({
      quizId: quizIdThree.quizId,
      name: 'third quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'a test quiz',
      numQuestions: 0,
      questions: []
    });
    expect(res.statusCode).toStrictEqual(200);
  });
});
