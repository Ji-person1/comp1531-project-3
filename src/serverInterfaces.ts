import {
  DuplicatedId, QuestionId, quizDetails,
  QuizId, quizList, Token, UserDetails
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
