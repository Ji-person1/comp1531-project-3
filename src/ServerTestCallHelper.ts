import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// this is a helper function meant to massively reduce the amount of bloat in test
// functions by reducing server calls to simply calling from this function.

// response body has to be any, as there are a massive variety of different potential response types
// therefore it is best to keep it as an any to avoid issues with typecasting.
export interface Response {
  body: any,
  statusCode: number
}

// Helper function to check if a string is valid JSON
function isJsonString(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

// Helper function to convert the response to an object
function convToResponse(response: any): Response {
  const bodyString = response.body.toString();

  return {
    body: isJsonString(bodyString) ? JSON.parse(bodyString) : { error: 'Invalid JSON response', rawResponse: bodyString },
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
  const response = request('GET', `${SERVER_URL}/v2/admin/user/details`, {
    headers: { token: token },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminUserDetailsUpdate
export function ServerUserDetailsUpdate(token: string, email: string,
  nameFirst: string, nameLast: string): Response {
  const response = request('PUT', `${SERVER_URL}/v2/admin/user/details`, {
    headers: { token: token },
    json: {
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
    headers: { token: token },
    json: {
      oldPassword: oldPassword,
      newPassword: newPassword
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizList
export function ServerQuizList(token: string): Response {
  const response = request('GET', `${SERVER_URL}/v2/admin/quiz/list`, {
    headers: { token: token },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizCreate
export function ServerQuizCreate(token: string, name: string, description: string): Response {
  const response = request('POST', `${SERVER_URL}/v2/admin/quiz`, {
    headers: { token: token },
    json: {
      name: name,
      description: description
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizRemove
export function ServerQuizRemove(token: string, quizId: number): Response {
  const response = request('DELETE', `${SERVER_URL}/v2/admin/quiz/${quizId}`, {
    headers: { token: token },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizInfo
export function ServerQuizInfo(token: string, quizId: number): Response {
  const response = request('GET', `${SERVER_URL}/v2/admin/quiz/${quizId}`, {
    headers: { token: token },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizNameUpdate
export function ServerQuizNameUpdate(token: string, quizId: number, name: string): Response {
  const response = request('PUT', `${SERVER_URL}/v2/admin/quiz/${quizId}/name`, {
    headers: { token: token },
    json: {
      name: name
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminDescriptionUpdate
export function ServerQuizDescriptionUpdate(token: string, quizId: number,
  description: string): Response {
  const response = request('PUT', `${SERVER_URL}/v2/admin/quiz/${quizId}/description`, {
    headers: { token: token },
    json: {
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
  const response = request('POST', `${SERVER_URL}/v2/admin/auth/logout`, {
    headers: {
      token: token
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// AdminQuizTrashView
export function ServerQuizTrash(token: string): Response {
  const response = request('GET', `${SERVER_URL}/v2/admin/quiz/trash`, {
    headers: { token: token },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// AdminQuizRestore
export function ServerQuizRestore(token: string, quizId: number): Response {
  const response = request('POST', `${SERVER_URL}/v2/admin/quiz/${quizId}/restore`, {
    headers: {
      token: token
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// AdminQuizTrashEmpty
export function ServerQuizTrashEmpty(token: string, quizIds: number[]): Response {
  const response = request('DELETE', `${SERVER_URL}/v2/admin/quiz/trash/empty`, {
    headers: { token: token },
    qs: {
      quizIds: JSON.stringify(quizIds)
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizTransfer
export function ServerQuizTransfer(token: string, quizId: number, userEmail: string): Response {
  const response = request('POST', `${SERVER_URL}/v2/admin/quiz/${quizId}/transfer`, {
    headers: { token: token },
    json: {
      userEmail: userEmail
    },
    timeout: TIMEOUT_MS
  });

  return convToResponse(response);
}

// adminQuizQuestionCreate
export function ServerQuizCreateQuestion(token: string, quizId: number,
  question: string, duration: number, points: number, answers: any[]): Response {
  const response = request('POST', `${SERVER_URL}/v2/admin/quiz/${quizId}/question`, {
    headers: { token: token },
    json: {
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
  const response = request('PUT', `${SERVER_URL}/v2/admin/quiz/${quizId}/question/${questionId}`, {
    headers: { token: token },
    json: {
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
    `${SERVER_URL}/v2/admin/quiz/${quizId}/question/${questionId}`, {
      headers: { token: token },
      timeout: TIMEOUT_MS
    });

  return convToResponse(response);
}

// AdminQuizMove
export function ServerQuestionMove(token: string, quizId: number,
  questionId: number, newPosition: number): Response {
  const response = request('PUT',
    `${SERVER_URL}/v2/admin/quiz/${quizId}/question/${questionId}/move`, {
      headers: { token: token },
      json: {
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
    `${SERVER_URL}/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`, {
      headers: {
        token: token
      },
      timeout: TIMEOUT_MS
    });

  return convToResponse(response);
}
