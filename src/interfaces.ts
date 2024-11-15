// A file for storing all the interfaces

export enum GameStage {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

export interface UserDetails {
    user : {
        userId: number;
        name: string;
        email: string;
        numSuccessfulLogins: number;
        numFailedPasswordsSinceLastLogin: number
    }
}

export interface errorObject {
    error: string
}

export interface Token {
    token: string
}

export interface User {
    id: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    password: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
    prevPasswords: string[]
}

export interface Quiz {
    quizId: number;
    creatorId: number;
    name: string;
    description: string;
    timeCreated: number;
    timeLastEdited: number;
    numQuestions: number;
    questions: Questions[];
    thumbnailUrl?: string,
}

export interface Questions {
    questionId: number;
    question: string;
    timeLimit: number;
    points: number;
    answerOptions: Answer[];
    thumbnailUrl?: string;
}

export interface QuestionBody {
    question: string;
    timeLimit: number;
    points: number;
    answerOptions: Answer[];
    thumbnailUrl?: string;
}

export interface Answer {
    answer: string;
    correct?: boolean;
    answerId?: number;
    colour?: string;
}

export interface Session {
    sessionId: number;
    authUserId: number;
    createdAt: number;
}

export interface PlayerSession {
  playerId: number;
  playerName: string;
  score: number;
  numQuestions: number;
  atQuestion: number;
  quizsessionId: number;
}

export interface QuizSession {
  state: GameStage;
  quizSessionId: number;
  authUserId: number;
  createdAt: number;
  quiz: Quiz;
  players: PlayerSession[];
  questionResults: QuestionResults[];
  thumbnailUrl?: string;
}

export interface QuestionResults {
  questionId: number;
  playersCorrect: string[];
  averageAnswerTime: number;
  percentCorrect: number;
  numWrong: number;
  numRight: number;
}

export interface PlayerQuestionResults {
  questionId: number;
  playersCorrect: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}
export interface DataStore {
    users: User[];
    quizzes: Quiz[];
    bin: Quiz[];
    sessions: Session[];
    quizSession: QuizSession[];
    players: PlayerSession[];
    chat: ChatSession[];
}

export interface quizDetails {
    quizId: number
    name: string
    timeCreated: number
    timeLastEdited: number
    description: string
    numQuestions: number
    questions: Questions[]
}

export interface QuestionId {
    questionId: number;
}

export interface quizList {
    quizzes: QuizListInfo[];
}

export interface quizSessionId {
  sessionId: number;
}

interface QuizListInfo {
    quizId: number;
    name: string;
}

export interface QuizId {
    quizId: number;
}

export interface PlayerId {
    playerId: number;
}

export interface DuplicatedId {
    duplicatedQuestionId: number;
}

export interface Player {
    playerName: string;
    score: number;
    playerId: number;
    time: number;
}

export interface Chat {
    playerId: number;
    message: string;
    playerName: string;
    timeSent: number;
}
export interface SessionInfo {
    sessionId: number;
    state: GameStage;
}

export interface SessionsResponse {
    activeSessions: SessionInfo[];
    inactiveSessions: SessionInfo[];
}

export interface PlayerStatusResponse {
    state: GameStage,
    numQuestions: number,
    atQuestion: number
}

export interface ChatSession {
    sessionId: number;
    messages: Chat[];
}

export interface QuestionInfo {
    questionId: number,
    question: string,
    timeLimit: number,
    thumbnailUrl?: string,
    points: number,
    answerOptions: Answer[]
}

export interface SessionReslut {
    usersRankedByScore: UsersRankedByScore[],
    questionResults: QuestionResultOutput[]
}

export interface UsersRankedByScore {
    playerName: string,
    score: number
}

export interface QuestionResultOutput {
    questionId: number,
    playersCorrect: string[],
    averageAnswerTime: number,
    percentCorrect: number
}

export interface SessionStatus {
    state: GameStage;
    atQuestion: number;
    players: string[];
    metadata: {
      quizId: number;
      name: string;
      timeCreated: number;
      timeLastEdited: number;
      description: string;
      numQuestions: number;
      questions: Questions[];
      timeLimit?: number;
      thumbnailUrl?: string;
    };
  }
