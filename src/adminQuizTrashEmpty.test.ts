import {
  ServerAuthRegister, ServerQuizCreate, ServerQuizRemove,
  ServerQuizTrashEmpty, ServerClear,
  ServerAuthLogout,
  ServerQuizTrash
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error Cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let quizIdTwo: { quizId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    quizIdTwo = ServerQuizCreate(UserToken.token, 'a second quiz', 'a test quiz').body;
    ServerQuizRemove(UserToken.token, quizId.quizId);
  });

  test('Invalid token', () => {
    const quizArray = [quizId.quizId];
    const response = ServerQuizTrashEmpty(Number(-UserToken.token).toString(), quizArray);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual(ERROR);
  });

  test('Empty token', () => {
    const quizArray = [quizId.quizId];
    const response = ServerQuizTrashEmpty('', quizArray);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual(ERROR);
  });

  test('User logged out', () => {
    const quizArray = [quizId.quizId];
    ServerAuthLogout(UserToken.token);
    const response = ServerQuizTrashEmpty(UserToken.token, quizArray);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual(ERROR);
  });

  test('Quiz ID not in the trash', () => {
    const quizArray = [quizIdTwo.quizId];
    const response = ServerQuizTrashEmpty(UserToken.token, quizArray);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test('Quiz does not belong to the user', () => {
    const quizArray = [quizId.quizId];
    ServerQuizRemove(UserToken.token, quizId.quizId);
    const otherUserToken = ServerAuthRegister('z5394791@unsw.edu.au', '1234abcd',
      'Mij', 'Zeng').body;

    const response = ServerQuizTrashEmpty(otherUserToken.token, quizArray);

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual(ERROR);
  });
});

describe('Success Cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let quizIdTwo: { quizId: number };
  let quizIdThree: { quizId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    quizId = ServerQuizCreate(UserToken.token, 'first quiz', 'a test quiz').body;
    quizIdTwo = ServerQuizCreate(UserToken.token, 'second quiz', 'a test quiz').body;
    quizIdThree = ServerQuizCreate(UserToken.token, 'third quiz', 'a test quiz').body;
    ServerQuizRemove(UserToken.token, quizId.quizId);
    ServerQuizRemove(UserToken.token, quizIdTwo.quizId);
    ServerQuizRemove(UserToken.token, quizIdThree.quizId);
  });

  test('Successful trash empty', () => {
    const quizIds = [quizId.quizId, quizIdTwo.quizId, quizIdThree.quizId];
    const response = ServerQuizTrashEmpty(UserToken.token, quizIds);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({});
  });

  test('Empty with quiztrash check', () => {
    const quizIds = [quizId.quizId, quizIdTwo.quizId];
    const response = ServerQuizTrashEmpty(UserToken.token, quizIds);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({});
    const res = ServerQuizTrash(UserToken.token);
    expect(res.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizIdThree.quizId,
          name: 'third quiz'
        }
      ]
    }
    );
  });

  test('Remove one at a time', () => {
    const response = ServerQuizTrashEmpty(UserToken.token, [quizId.quizId]);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({});
    const resTwo = ServerQuizTrashEmpty(UserToken.token, [quizIdTwo.quizId]);
    expect(resTwo.statusCode).toBe(200);
    expect(resTwo.body).toEqual({});
    const resThree = ServerQuizTrashEmpty(UserToken.token, [quizIdThree.quizId]);
    expect(resThree.statusCode).toBe(200);
    expect(resThree.body).toEqual({});
    const res = ServerQuizTrash(UserToken.token);
    expect(res.body).toStrictEqual({ quizzes: [] });
  });
});
