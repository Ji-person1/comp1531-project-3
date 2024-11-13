import request from 'sync-request-curl';
import { port, url } from './config.json';
import {
  DuplicateIdResponse, EmptyBody, ListResponse, PLayerIdResponse, QuestionIdResponse,
  QuizIdResponse, QuizInfoResponse, QuizSessionId, TokenResponse, UserDetailResponse,
  SessionResponse, PLayerStatusResponse, QsInfoResponse,
  ChatResponse, QuestionResultsResponse, SessionResultResponse, CsvResponse
} from './serverInterfaces';
import { Answer, errorObject } from './interfaces';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// this is a helper function meant to massively reduce the amount of bloat in test
// functions by reducing server calls to simply calling from this function.

export interface Response {
  body: string | errorObject,
  statusCode: number
}

// adminAuthRegister
export function ServerAuthRegister(email: string, password: string,
  nameFirst: string, nameLast: string): TokenResponse {
  const response = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
    json: {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast
    },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// AdminAuthLogin
export function ServerAuthLogin(email: string, password: string): TokenResponse {
  const response = request('POST', `${SERVER_URL}/v1/admin/auth/login`, {
    json: {
      email: email,
      password: password
    },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// adminUserDetails
export function ServerUserDetails(token: string): UserDetailResponse {
  const response = request('GET', `${SERVER_URL}/v2/admin/user/details`, {
    headers: { token: token },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// adminUserDetailsUpdate
export function ServerUserDetailsUpdate(token: string, email: string,
  nameFirst: string, nameLast: string): EmptyBody {
  const response = request('PUT', `${SERVER_URL}/v2/admin/user/details`, {
    headers: { token: token },
    json: {
      email: email,
      nameFirst: nameFirst,
      nameLast: nameLast
    },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// adminUserPasswordUpdate
export function ServerUserPasswordUpdate(token: string, oldPassword: string,
  newPassword: string): EmptyBody {
  const response = request('PUT', `${SERVER_URL}/v1/admin/user/password`, {
    headers: { token: token },
    json: {
      oldPassword: oldPassword,
      newPassword: newPassword
    },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// adminQuizList
export function ServerQuizList(token: string): ListResponse {
  const response = request('GET', `${SERVER_URL}/v2/admin/quiz/list`, {
    headers: { token: token },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// adminQuizCreate
export function ServerQuizCreate(token: string, name: string, description: string): QuizIdResponse {
  const response = request('POST', `${SERVER_URL}/v2/admin/quiz`, {
    headers: { token: token },
    json: {
      name: name,
      description: description
    },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// adminQuizRemove
export function ServerQuizRemove(token: string, quizId: number): EmptyBody {
  const response = request('DELETE', `${SERVER_URL}/v2/admin/quiz/${quizId}`, {
    headers: { token: token },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// adminQuizInfo
export function ServerQuizInfo(token: string, quizId: number): QuizInfoResponse {
  const response = request('GET', `${SERVER_URL}/v2/admin/quiz/${quizId}`, {
    headers: { token: token },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// adminQuizNameUpdate
export function ServerQuizNameUpdate(token: string, quizId: number, name: string): EmptyBody {
  const response = request('PUT', `${SERVER_URL}/v2/admin/quiz/${quizId}/name`, {
    headers: { token: token },
    json: {
      name: name
    },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// adminDescriptionUpdate
export function ServerQuizDescriptionUpdate(token: string, quizId: number,
  description: string): EmptyBody {
  const response = request('PUT', `${SERVER_URL}/v2/admin/quiz/${quizId}/description`, {
    headers: { token: token },
    json: {
      description: description
    },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// clear
export function ServerClear(): EmptyBody {
  const response = request('DELETE', `${SERVER_URL}/v1/clear`, { timeout: TIMEOUT_MS });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// Iteration 2 functions
// adminAuthLogout
export function ServerAuthLogout(token: string): EmptyBody {
  const response = request('POST', `${SERVER_URL}/v2/admin/auth/logout`, {
    headers: {
      token: token
    },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// AdminQuizTrashView
export function ServerQuizTrash(token: string): ListResponse {
  const response = request('GET', `${SERVER_URL}/v2/admin/quiz/trash`, {
    headers: { token: token },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// AdminQuizRestore
export function ServerQuizRestore(token: string, quizId: number): EmptyBody {
  const response = request('POST', `${SERVER_URL}/v2/admin/quiz/${quizId}/restore`, {
    headers: {
      token: token
    },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// AdminQuizTrashEmpty
export function ServerQuizTrashEmpty(token: string, quizIds: number[]): EmptyBody {
  const response = request('DELETE', `${SERVER_URL}/v2/admin/quiz/trash/empty`, {
    headers: { token: token },
    qs: {
      quizIds: JSON.stringify(quizIds)
    },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// adminQuizTransfer
export function ServerQuizTransfer(token: string, quizId: number, userEmail: string): EmptyBody {
  const response = request('POST', `${SERVER_URL}/v2/admin/quiz/${quizId}/transfer`, {
    headers: { token: token },
    json: {
      userEmail: userEmail
    },
    timeout: TIMEOUT_MS
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// adminQuizQuestionCreate
export function ServerQuizCreateQuestion(token: string, quizId: number,
  question: string, duration: number, points: number, answers: Answer[]): QuestionIdResponse {
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

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// adminQuizQuestionUpdate
export function ServerQuizUpdateQuestion(token: string, quizId: number,
  questionId: number, question: string, duration: number,
  points: number, answers: Answer[]): EmptyBody {
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

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// AdminQuizQuestionDelete
export function ServerQuizQuestionDelete(token: string,
  quizId: number, questionId: number): EmptyBody {
  const response = request('DELETE',
    `${SERVER_URL}/v2/admin/quiz/${quizId}/question/${questionId}`, {
      headers: { token: token },
      timeout: TIMEOUT_MS
    });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// AdminQuizMove
export function ServerQuestionMove(token: string, quizId: number,
  questionId: number, newPosition: number): EmptyBody {
  const response = request('PUT',
    `${SERVER_URL}/v2/admin/quiz/${quizId}/question/${questionId}/move`, {
      headers: { token: token },
      json: {
        newPosition: newPosition
      },
      timeout: TIMEOUT_MS
    });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// AdminQuizDuplicate
export function ServerQuestionDuplicate(token: string, quizId: number,
  questionId: number): DuplicateIdResponse {
  const response = request('POST',
    `${SERVER_URL}/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`, {
      headers: {
        token: token
      },
      timeout: TIMEOUT_MS
    });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// startSession
export function serverStartSession(token: string, quizId: number,
  autoStartNum: number): QuizSessionId {
  const response = request('POST',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/session/start`, {
      headers: {
        token: token
      },
      json: { autoStartNum },
      timeout: TIMEOUT_MS
    });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function ServerQuizSessions(token: string, quizId: number): SessionResponse {
  const response = request('GET',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/sessions`, {
      headers: { token: token },
      timeout: TIMEOUT_MS
    });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// playerJoin
export function serverPlayerJoin(sessionId: number, playerName: string): PLayerIdResponse {
  const response = request('POST',
    `${SERVER_URL}/v1/player/join`, {
      json: {
        sessionId: sessionId,
        playerName: playerName
      },
      timeout: TIMEOUT_MS
    });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// playerQuestionResults
export function serverPlayerQuestionResults(playerId: number,
  questionposition: number): QuestionResultsResponse {
  const response = request('GET',
    `${SERVER_URL}/v1/player/${playerId}/question/${questionposition}/results`, {
      json: {
        playerId: playerId,
        questionposition: questionposition
      },
      timeout: TIMEOUT_MS
    });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// playerStatus
export function serverPlayerStatus(playerId: number): PLayerStatusResponse {
  const response = request('GET', `${SERVER_URL}/v1/player/${playerId}`);
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// AnswerQuestion
export function serverAnswerSubmit(playerId: number, questionPosition: number, answerId: number[]):
EmptyBody {
  const response = request('POST',
    `${SERVER_URL}/v1/player/${playerId}/question/${questionPosition}/answer`, {
      json: {
        answerIds: answerId,
      },
      timeout: TIMEOUT_MS
    });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// playerViewChat
export function ServerViewChat(playerId: number): ChatResponse {
  const response = request(
    'GET',
    `${SERVER_URL}/v1/player/${playerId}/chat`,
    {
      timeout: TIMEOUT_MS
    }
  );

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// personSendChat
export function ServerSendChat(playerId: number, message: string): EmptyBody {
  const response = request('POST',
    `${SERVER_URL}/v1/player/${playerId}/chat`, {
      json: {
        message: message
      },
      timeout: TIMEOUT_MS
    });
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// playerQuestionInfo
export function serverPlayerQuestionInfo(playerId: number,
  questionPosition: number): QsInfoResponse {
  const response = request(
    'GET', `${SERVER_URL}/v1/player/${playerId}/question/${questionPosition}`
  );
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// adminquizthumbnail
export function ServerQuizThumbnailUpdate(token: string, quizId: number, thumbnailUrl: string):
EmptyBody {
  const response = request('PUT',
      `${SERVER_URL}/v1/admin/quiz/${quizId}/thumbnail`, {
        headers: { token: token },
        json: { thumbnailUrl },
        timeout: TIMEOUT_MS
      });
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// adminQuizSessionUpdate
export function ServerSessionUpdate(token: string, quizId: number, sessionId: number,
  action: string):
EmptyBody {
  const response = request(
    'PUT',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/session/${sessionId}`,
    {
      headers: { token },
      json: { action },
      timeout: TIMEOUT_MS
    }
  );
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

// quizSessionResults
export function ServerQuizSessionResults(token:string, quizId:number, sessionId:number):
SessionResultResponse {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}/results`,
    { headers: { token } }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: JSON.parse(res.statusCode.toString()),
  };
}

export function ServerQuizSessionResultsCSV(token: string, quizId: number, sessionId: number):
CsvResponse {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`,
    { headers: { token } }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: JSON.parse(res.statusCode.toString()),
  };
}

// quizSessionStatus
export function ServerSessionStatus(
  token: string,
  quizId: number,
  sessionId: number
): EmptyBody {
  const response = request(
    'GET',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/session/${sessionId}`,
    {
      headers: { token },
      timeout: TIMEOUT_MS
    }
  );

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}
