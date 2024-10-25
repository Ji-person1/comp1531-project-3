import {
  ServerAuthRegister,
  ServerQuizCreate,
  ServerQuizCreateQuestion,
  ServerQuestionMove,
  ServerClear
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let questionId: { questionId: number };
  let questionIdTwo: { questionId: number };
  let questionIdThree: { questionId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('HaoWu0000@gmail.com', '2734uqsd', 'Hao', 'Wu').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    questionId = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]).body;
    questionIdTwo = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      "Who isn't the Rizzler?", 30, 5, [
        { answer: 'Duke Dennis', correct: false },
        { answer: 'Kai Cenat', correct: true }
      ]).body;
    questionIdThree = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      'Is hawk tuah funny?', 30, 500, [
        { answer: 'yes', correct: false },
        { answer: 'no', correct: true }
      ]).body;
  });

  test('invalid token', () => {
    const res = ServerQuestionMove('-1', quizId.quizId, questionId.questionId, 1);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(401);
  });

  test('quiz does not exist', () => {
    const res = ServerQuestionMove(UserToken.token, -quizId.quizId, questionId.questionId, 1);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(403);
  });

  test('Not the owner of the quiz', () => {
    const otherUserToken = ServerAuthRegister('1dq11333@gmail.com', '1234abcd', 'Hao', 'Wu').body;
    const res = ServerQuestionMove(otherUserToken.token, quizId.quizId, questionId.questionId, 1);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(403);
  });

  test('question does not exist', () => {
    const res = ServerQuestionMove(UserToken.token, quizId.quizId, -questionId.questionId, 1);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(400);
  });

  test('position does not exist', () => {
    const res = ServerQuestionMove(UserToken.token, quizId.quizId, questionId.questionId, -1);
    const resTwo = ServerQuestionMove(UserToken.token, quizId.quizId,
      questionIdTwo.questionId, 100);
    expect(res.body).toStrictEqual(ERROR);
    expect(resTwo.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(400);
    expect(resTwo.statusCode).toBe(400);
  });

  test('NewPosition is the position of the current question', () => {
    const res = ServerQuestionMove(UserToken.token, quizId.quizId, questionIdThree.questionId, 2);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(400);
  });
});

describe('Success cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let questionId: { questionId: number };
  let questionIdTwo: { questionId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('1dq11333@gmail.com', '1234abcd', 'Hao', 'Wu').body;
    quizId = ServerQuizCreate(UserToken.token, 'first quiz', 'a test quiz').body;
    questionId = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]).body;
    questionIdTwo = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      "Who isn't the Rizzler?", 30, 5, [
        { answer: 'Duke Dennis', correct: false },
        { answer: 'Kai Cenat', correct: true }
      ]).body;
  });

  test('position 0 to 1', () => {
    const res = ServerQuestionMove(UserToken.token, quizId.quizId, questionId.questionId, 1);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toBe(200);
  });

  test('Reverse move', () => {
    const res = ServerQuestionMove(UserToken.token, quizId.quizId, questionIdTwo.questionId, 0);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toBe(200);
  });
});
