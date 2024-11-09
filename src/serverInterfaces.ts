import {
  DuplicatedId, QuestionId, quizDetails,
  QuizId, quizList, quizSessionId, Token, UserDetails, SessionsResponse
} from './interfaces';

// Interfaces for the ServerTestCallHelper function.
export interface TokenResponse {
    body: Token,
    statusCode: number
}

export interface UserDetailResponse {
    body: UserDetails,
    statusCode: number
}

export interface EmptyBody {
    body: Record<string, never>,
    statusCode: number
}

export interface ListResponse {
    body: quizList,
    statusCode: number
}

export interface QuizIdResponse {
    body: QuizId,
    statusCode: number
}

export interface QuizInfoResponse {
    body: quizDetails,
    statusCode: number
}

export interface QuestionIdResponse {
    body: QuestionId,
    statusCode: number
}

export interface DuplicateIdResponse {
    body: DuplicatedId,
    statusCode: number
}

export interface QuizSessionId {
    body: quizSessionId,
    statusCode: number
}

export interface SessionResponse {
    body: SessionsResponse,
    statusCode: number
}
