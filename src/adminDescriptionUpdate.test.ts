import {
  ServerAuthRegister, ServerQuizCreate, ServerClear,
  ServerQuizDescriptionUpdate, ServerQuizInfo
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

  test('description too long', () => {
    const res = ServerQuizDescriptionUpdate(UserToken.token, quizId.quizId, 'a'.repeat(200));
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid token', () => {
    const res = ServerQuizDescriptionUpdate((-Number(UserToken.token)).toString(),
      quizId.quizId, 'a description');
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Not the quiz owner', () => {
    const otherUserToken = ServerAuthRegister('z5394791@unsw.edu.au', '1234abcd', 'Mij',
      'Zeng').body;
    const res = ServerQuizDescriptionUpdate(otherUserToken.token, quizId.quizId, 'a description');
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
    const res = ServerQuizDescriptionUpdate(UserToken.token, quizId.quizId, 'a description');
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Update check with quizinfo', () => {
    const res = ServerQuizDescriptionUpdate(UserToken.token, quizId.quizId, 'Updated description');
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);

    const resTwo = ServerQuizInfo(UserToken.token, quizId.quizId);
    expect(resTwo.body).toStrictEqual({
      quizId: quizId.quizId,
      name: 'first quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Updated description',
      numQuestions: 0,
      questions: []
    });
    expect(resTwo.statusCode).toStrictEqual(200);
  });
});
