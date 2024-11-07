import {
  ServerAuthRegister, ServerQuizCreate,
  ServerClear, ServerQuizInfo
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

  test('Invalid id', () => {
    const res = ServerQuizCreate('0', 'Quiz test', 'a test quiz');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Invalid characters in name', () => {
    const res = ServerQuizCreate(UserToken.token, '-1 quiz', 'a test quiz');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Name too short', () => {
    const res = ServerQuizCreate(UserToken.token, 'no', 'a test quiz');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Name too long', () => {
    const res = ServerQuizCreate(UserToken.token, 'a'.repeat(40), 'a test quiz');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Name used already', () => {
    ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz');
    const res = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Description too long', () => {
    const res = ServerQuizCreate(UserToken.token, 'functional quiz', 'a'.repeat(200));
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Success cases', () => {
  let UserToken: { token: string };
  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
  });

  test('Correct basic case', () => {
    const res = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz');
    expect(res.body).toStrictEqual({ quizId: expect.any(Number) });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Basic return success check', () => {
    const res = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz');
    expect(res.body).toStrictEqual({ quizId: expect.any(Number) });
    expect(res.statusCode).toStrictEqual(200);
    const quizId = res.body;
    const resInfo = ServerQuizInfo(UserToken.token, quizId.quizId);
    expect(resInfo.body).toStrictEqual({
      quizId: quizId.quizId,
      name: 'functional quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'a test quiz',
      numQuestions: 0,
      questions: []
    });
    expect(res.statusCode).toStrictEqual(200);
  });
});
