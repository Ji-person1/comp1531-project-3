import {
  ServerAuthRegister,
  ServerQuizCreate,
  ServerQuizCreateQuestion,
  ServerQuestionDuplicate,
  ServerClear,
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let questionId: { questionId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('HaoWu0000@gmail.com', '2734uqsd', 'Hao', 'Wu').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    questionId = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]).body;
  });

  test('invalid token', () => {
    const res = ServerQuestionDuplicate('-1', quizId.quizId, questionId.questionId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(401);
  });

  test('quiz does not exist', () => {
    const res = ServerQuestionDuplicate(UserToken.token, -quizId.quizId, questionId.questionId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(403);
  });

  test('Not the owner of the quiz', () => {
    const otherUserToken = ServerAuthRegister('1dq11333@gmail.com', '1234abcd', 'Hao', 'Wu').body;
    const res = ServerQuestionDuplicate(otherUserToken.token, quizId.quizId, questionId.questionId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(403);
  });

  test('question does not exist', () => {
    const res = ServerQuestionDuplicate(UserToken.token, quizId.quizId, -questionId.questionId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(400);
  });
});

describe('Success cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let questionId: { questionId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('1dq11333@gmail.com', '1234abcd', 'Hao', 'Wu').body;
    quizId = ServerQuizCreate(UserToken.token, 'first quiz', 'a test quiz').body;
    questionId = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]).body;
  });

  test('Basic return success check', () => {
    const res = ServerQuestionDuplicate(UserToken.token, quizId.quizId, questionId.questionId);
    const resId = res.body;
    expect(resId.duplicatedQuestionId).toStrictEqual(questionId.questionId);
    expect(res.statusCode).toBe(200);
  });
});
