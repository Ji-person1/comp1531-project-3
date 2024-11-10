import {
  ServerAuthRegister,
  ServerQuizCreate,
  ServerQuizThumbnailUpdate,
  ServerClear,
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('adminQuizThumbnailUpdate', () => {
  let token: string;
  let quizId: number;
  const validThumbnail = 'https://example.com/image.jpg';

  beforeEach(() => {
    const authResponse = ServerAuthRegister('test@example.com', 'password123', 'Test', 'User');
    token = authResponse.body.token;
    const quizResponse = ServerQuizCreate(token, 'Test Quiz', 'Test Description');
    quizId = quizResponse.body.quizId;
  });

  describe('Error cases', () => {
    test('Invalid token', () => {
      const res = ServerQuizThumbnailUpdate('invalidtoken', quizId, validThumbnail);
      expect(res.statusCode).toBe(401);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('Quiz does not exist', () => {
      const res = ServerQuizThumbnailUpdate(token, -1, validThumbnail);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });
    test('User is not owner of quiz', () => {
      const otherUser = ServerAuthRegister('Swastik2@gmail.com', 'password321', 'Neo', 'Mishra');
      const res = ServerQuizThumbnailUpdate(otherUser.body.token, quizId, validThumbnail);
      expect(res.statusCode).toBe(403);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('Invalid thumbnail URL - wrong protocol', () => {
      const res = ServerQuizThumbnailUpdate(token, quizId, 'ftp://example.com/image.jpg');
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });

    test('Invalid thumbnail URL - wrong file extension', () => {
      const res = ServerQuizThumbnailUpdate(token, quizId, 'http://example.com/image.gif');
      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual(ERROR);
    });
  });

  describe('Success cases', () => {
    test('Successfully update thumbnail - http', () => {
      const res = ServerQuizThumbnailUpdate(token, quizId, 'http://example.com/image.jpg');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
    });

    test('Successfully update thumbnail - https', () => {
      const res = ServerQuizThumbnailUpdate(token, quizId, 'https://example.com/image.png');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
    });

    test('Successfully update thumbnail - jpeg extension', () => {
      const res = ServerQuizThumbnailUpdate(token, quizId, 'https://example.com/image.jpeg');
      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({});
    });
  });
});
