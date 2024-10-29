import {
  ServerQuizList, ServerQuizCreate,
  ServerClear, ServerAuthRegister
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

  test('Invalid token with no quizzes', () => {
    const res = ServerQuizList((-Number(UserToken.token)).toString());
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Invalid token after quiz creation', () => {
    ServerQuizCreate(UserToken.token, 'Quiz test', 'a test quiz');
    const res = ServerQuizList((-Number(UserToken.token)).toString());
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });
});

describe('Success cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
  });

  test('Correct basic case', () => {
    const res = ServerQuizList(UserToken.token);
    expect(res.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId.quizId,
          name: 'functional quiz'
        }
      ]
    });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('multiple quizzes', () => {
    const QuizTwo = ServerQuizCreate(UserToken.token, 'Usable quiz', 'a test quiz').body;
    const res = ServerQuizList(UserToken.token);
    expect(res.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId.quizId,
          name: 'functional quiz'
        },
        {
          quizId: QuizTwo.quizId,
          name: 'Usable quiz'
        }
      ]
    });
    expect(res.statusCode).toStrictEqual(200);
  });
});
