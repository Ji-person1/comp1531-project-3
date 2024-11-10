import {
  DuplicatedId, QuestionId, quizDetails, PlayerId,
  QuizId, quizList, quizSessionId, Token, UserDetails, SessionsResponse, PlayerStatusResponse,
  QuestionInfo, Chat
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

export interface PLayerIdResponse {
    body: PlayerId,
    statusCode: number
}

export interface PLayerStatusResponse {
    body: PlayerStatusResponse,
    statusCode: number
}

export interface QsInfoResponse {
    body: QuestionInfo,
    statusCode: number
}

export interface ChatResponse {
    body: Chat[],
    statusCode: number
}
