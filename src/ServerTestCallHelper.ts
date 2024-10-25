import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// this is a helper function meant to massively reduce the amount of bloat in test
// functions by reducing server calls to simply calling from this function.
// there doesn't really need a jsdoc here given the nature of all these functions.
// as they are nothing but extensions of the main functions.

// response body has to be any, as there are a massive variety of different potential response types
// therefore it is best to keep it as an any to avoid issues with typecasting.
export interface Response {
    body: any,
    statusCode: number
}

// helper function to convert the response to an object
function convToResponse(response: any): Response {
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode
  };
}

// adminAuthRegister
export function ServerAuthRegister(email: string, password: string,
  nameFirst: string, nameLast: string): Response {
  const response = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
    json: {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// AdminAuthLogin
export function ServerAuthLogin(email: string, password: string): Response {
  const response = request('POST', `${SERVER_URL}/v1/admin/auth/login`, {
    json: {
      email: email,
      password: password
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminUserDetails
export function ServerUserDetails(token: string): Response {
  const response = request('GET', `${SERVER_URL}/v1/admin/user/details`, {
    qs: { token: token },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminUserDetailsUpdate
export function ServerUserDetailsUpdate(token: string, email: string,
  nameFirst: string, nameLast: string): Response {
  const response = request('PUT', `${SERVER_URL}/v1/admin/user/details`, {
    json: {
      token: token,
      email: email,
      nameFirst: nameFirst,
      nameLast: nameLast
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminUserPasswordUpdate
export function ServerUserPasswordUpdate(token: string, oldPassword: string,
  newPassword: string): Response {
  const response = request('PUT', `${SERVER_URL}/v1/admin/user/password`, {
    json: {
      token: token,
      oldPassword: oldPassword,
      newPassword: newPassword
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizList
export function ServerQuizList(token: string): Response {
  const response = request('GET', `${SERVER_URL}/v1/admin/quiz/list`, {
    qs: { token: token },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizCreate
export function ServerQuizCreate(token: string, name: string, description: string): Response {
  const response = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
    json: {
      token: token,
      name: name,
      description: description
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizRemove
export function ServerQuizRemove(token: string, quizId: number): Response {
  const response = request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizId}`, {
    qs: { token: token },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizInfo
export function ServerQuizInfo(token: string, quizId: number): Response {
  const response = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizId}`, {
    qs: { token: token },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizNameUpdate
export function ServerQuizNameUpdate(token: string, quizId: number, name: string): Response {
  const response = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/name`, {
    json: {
      token: token,
      name: name
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminDescriptionUpdate
export function ServerQuizDescriptionUpdate(token: string, quizId: number,
  description: string): Response {
  const response = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/description`, {
    json: {
      token: token,
      description: description
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// clear
export function ServerClear(): Response {
  const response = request('DELETE', `${SERVER_URL}/v1/clear`, { timeout: TIMEOUT_MS });

  return convToResponse(response);
}

// Iteration 2 functions
// adminAuthLogout
export function ServerAuthLogout(token: string): Response {
  const response = request('POST', `${SERVER_URL}/v1/admin/auth/logout`, {
    json: {
      token: token
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// AdminQuizTrashView
export function ServerQuizTrash(token: string): Response {
  const response = request('GET', `${SERVER_URL}/v1/admin/quiz/trash`, {
    qs: { token: token },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// AdminQuizRestore
export function ServerQuizRestore(token: string, quizId: number): Response {
  const response = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/restore`, {
    json: {
      token: token
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// AdminQuizTrashEmpty
export function ServerQuizTrashEmpty(token: string, quizIds: number[]): Response {
  const response = request('DELETE', `${SERVER_URL}/v1/admin/quiz/trash/empty`, {
    qs: {
      token: token,
      quizIds: JSON.stringify(quizIds)
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizTransfer
export function ServerQuizTransfer(token: string, quizId: number, userEmail: string): Response {
  const response = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/transfer`, {
    json: {
      token: token,
      userEmail: userEmail
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizQuestionCreate
export function ServerQuizCreateQuestion(token: string, quizId: number,
  question: string, duration: number, points: number, answers: any[]): Response {
  const response = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/question`, {
    json: {
      token: token,
      question: question,
      duration: duration,
      points: points,
      answers: answers
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizQuestionUpdate
export function ServerQuizUpdateQuestion(token: string, quizId: number,
  questionId: number, question: string, duration: number,
  points: number, answers: any[]): Response {
  const response = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId}`, {
    json: {
      token: token,
      question: question,
      duration: duration,
      points: points,
      answers: answers
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// AdminQuizQuestionDelete
export function ServerQuizQuestionDelete(token: string,
  quizId: number, questionId: number): Response {
  const response = request('DELETE',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId}`, {
      qs: { token: token },
      timeout: TIMEOUT_MS
    });

  return convToResponse(response);
}

// AdminQuizMove
export function ServerQuestionMove(token: string, quizId: number,
  questionId: number, newPosition: number): Response {
  const response = request('PUT',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId}/move`, {
      json: {
        token: token,
        newPosition: newPosition
      },
      timeout: TIMEOUT_MS
    });

  return convToResponse(response);
}

// AdminQuizDuplicate
export function ServerQuestionDuplicate(token: string, quizId: number,
  questionId: number): Response {
  const response = request('POST',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, {
      json: {
        token: token
      },
      timeout: TIMEOUT_MS
    });

  return convToResponse(response);
}
