import {
  ServerAuthRegister, ServerQuizCreate, ServerClear,
  ServerQuizNameUpdate, ServerQuizInfo
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

  test('Invalid characters', () => {
    const res = ServerQuizNameUpdate(UserToken.token, quizId.quizId, '1237_=');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Name too short', () => {
    const res = ServerQuizNameUpdate(UserToken.token, quizId.quizId, 'a');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Identical names', () => {
    const res = ServerQuizNameUpdate(UserToken.token, quizId.quizId, 'functional quiz');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Name used in another quiz', () => {
    ServerQuizCreate(UserToken.token, 'Very functional quiz', 'a test quiz');
    const res = ServerQuizNameUpdate(UserToken.token, quizId.quizId, 'Very functional quiz');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Name too long', () => {
    const res = ServerQuizNameUpdate(UserToken.token, quizId.quizId, 'a'.repeat(50));
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid token', () => {
    const res = ServerQuizNameUpdate((-Number(UserToken.token)).toString(),
      quizId.quizId, 'Normal name');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Quiz does not exist', () => {
    const res = ServerQuizNameUpdate(UserToken.token, -quizId.quizId, 'Normal name');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Not the owner of the quiz', () => {
    const UserTokenTwo = ServerAuthRegister('z5394791@unsw.edu.au', '1234abcd', 'Mij', 'Zeng').body;
    const res = ServerQuizNameUpdate(UserTokenTwo.token, quizId.quizId, 'Normal name');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(403);
  });
});

describe('Success cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    quizId = ServerQuizCreate(UserToken.token, 'first quiz', 'a test quiz').body;
  });

  test('Return type check', () => {
    const res = ServerQuizNameUpdate(UserToken.token, quizId.quizId, 'Normal name');
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Update check with quizinfo', () => {
    const res = ServerQuizNameUpdate(UserToken.token, quizId.quizId, 'Normal name');
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);

    const resTwo = ServerQuizInfo(UserToken.token, quizId.quizId);
    expect(resTwo.body).toStrictEqual({
      quizId: quizId.quizId,
      name: 'Normal name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'a test quiz',
      numQuestions: 0,
      questions: []
    });
    expect(resTwo.statusCode).toStrictEqual(200);
  });
});
