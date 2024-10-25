import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import {
  adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserDetailsUpdate,
  adminUserPasswordUpdate, adminAuthLogout
} from './auth';
import {
  adminQuizList, adminQuizCreate, adminQuizDescriptionUpdate, adminQuizNameUpdate, adminQuizInfo,
  adminQuizRemove, adminQuizTransfer, adminQuizCreateQuestion, adminQuizUpdateQuestion,
  adminQuestionMove, adminQuestionDuplicate, adminQuizTrashEmpty, adminQuizTrash, adminQuizRestore,
  quizQuestionDelete
} from './quiz';
import { clear } from './other';
// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file),
  {
    swaggerOptions:
    { docExpansion: config.expandDocs ? 'full' : 'list' }
  }
));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================
// some consts to represent errors
// Okay is for when it works properly
// GENERROR stands for general error, representing the vast majoryity of errors
// from misusing the function
// TOKENERR stands for token error, representing issues with invalid tokens
// OWNERROR stands for ownership error, with the code most often used when a token
// doesn't own the quiz in question
const OKAY: number = 200;
const GENERROR: number = 400;
const TOKENERR: number = 401;
const OWNERROR: number = 403;

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(GENERROR);
  }

  return res.json(result);
});

// adminAuthRegister
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const result = adminAuthRegister(email, password, nameFirst, nameLast);
  if ('error' in result) {
    res.status(GENERROR).json(result);
    return;
  }
  res.status(OKAY).json(result);
});

// adminAuthLogin
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = adminAuthLogin(email, password);
  if ('error' in result) {
    res.status(GENERROR).json(result);
    return;
  }
  res.status(OKAY).json(result);
});

// adminUserDetails
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = Number(req.query.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }
  const result = adminUserDetails(token);
  if ('error' in result) {
    res.status(TOKENERR).json(result);
    return;
  }
  res.status(OKAY).json(result);
});

// adminUserDetailUpdate
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { email, nameFirst, nameLast } = req.body;
  const token = Number(req.body.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }
  const result = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  if ('error' in result) {
    if (result.error.startsWith('401')) {
      res.status(TOKENERR).json(result);
      return;
    } else {
      res.status(GENERROR).json(result);
      return;
    }
  }
  res.status(OKAY).json(result);
});

// adminUserPasswordUpdate
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const token = Number(req.body.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }
  const result = adminUserPasswordUpdate(token, oldPassword, newPassword);
  if ('error' in result) {
    if (result.error.startsWith('401')) {
      res.status(TOKENERR).json(result);
      return;
    } else {
      res.status(GENERROR).json(result);
      return;
    }
  }
  res.status(OKAY).json(result);
});

// adminQuizTrash
// moved before the less parameterised one of adminquizinfo
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = Number(req.query.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }

  const result = adminQuizTrash(token);
  if ('error' in result) {
    res.status(TOKENERR).json(result);
    return;
  }
  res.status(OKAY).json(result);
});

// adminquizList
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = Number(req.query.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }
  const result = adminQuizList(token);
  if ('error' in result) {
    res.status(TOKENERR).json(result);
    return;
  }
  res.status(OKAY).json(result);
});

// adminQuizCreate
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { name, description } = req.body;
  const token = Number(req.body.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }
  const result = adminQuizCreate(token, name, description);
  if ('error' in result) {
    if (result.error.startsWith('401')) {
      res.status(TOKENERR).json(result);
      return;
    } else {
      res.status(GENERROR).json(result);
      return;
    }
  }
  res.status(OKAY).json(result);
});

// adminQuizRemove
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid as string);
  const token = Number(req.query.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }
  const result = adminQuizRemove(token, quizid);
  if ('error' in result) {
    if (result.error.startsWith('401')) {
      res.status(TOKENERR).json(result);
      return;
    } else {
      res.status(GENERROR).json(result);
      return;
    }
  }
  res.status(OKAY).json(result);
});

// adminQuizInfo
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const token = Number(req.query.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }
  const result = adminQuizInfo(token, quizid);
  if ('error' in result) {
    if (result.error.startsWith('403')) {
      res.status(OWNERROR).json(result);
      return;
    } else if (result.error.startsWith('401')) {
      res.status(TOKENERR).json(result);
      return;
    } else {
      res.status(GENERROR).json(result);
      return;
    }
  }
  res.status(OKAY).json(result);
});

// adminNameUpdate
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const { name } = req.body;
  const token = Number(req.body.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }
  const result = adminQuizNameUpdate(token, quizid, name);
  if ('error' in result) {
    if (result.error.startsWith('403')) {
      res.status(OWNERROR).json(result);
      return;
    } else if (result.error.startsWith('401')) {
      res.status(TOKENERR).json(result);
      return;
    } else {
      res.status(GENERROR).json(result);
      return;
    }
  }
  res.status(OKAY).json(result);
});

// adminDescriptionUpdate
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const { description } = req.body;
  const token = Number(req.body.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }
  const result = adminQuizDescriptionUpdate(token, quizid, description);
  if ('error' in result) {
    if (result.error.startsWith('403')) {
      res.status(OWNERROR).json(result);
      return;
    } else if (result.error.startsWith('401')) {
      res.status(TOKENERR).json(result);
      return;
    } else {
      res.status(GENERROR).json(result);
      return;
    }
  }
  res.status(OKAY).json(result);
});

// adminQuizTransfer
app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = Number(req.body.token);
  const { userEmail } = req.body;
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }

  const result = adminQuizTransfer(quizId, token, userEmail);

  if ('error' in result) {
    if (result.error.startsWith('400')) {
      res.status(GENERROR).json(result);
    } else if (result.error.startsWith('401')) {
      res.status(TOKENERR).json(result);
    } else if (result.error.startsWith('403')) {
      res.status(OWNERROR).json(result);
    }
  } else {
    res.status(OKAY).json(result);
  }
});

// adminQuizCreateQuestion
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { question, duration, points, answers } = req.body;
  const token = Number(req.body.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }

  const result = adminQuizCreateQuestion(token, quizId, question, duration, points, answers);

  if ('error' in result) {
    if (result.error.startsWith('403')) {
      res.status(OWNERROR).json(result);
    } else if (result.error.startsWith('401')) {
      res.status(TOKENERR).json(result);
    } else {
      res.status(GENERROR).json(result);
    }
  } else {
    res.status(OKAY).json(result);
  }
});

// adminQuizUpdateQuestion
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { question, duration, points, answers } = req.body;
  const token = Number(req.body.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }

  const result = adminQuizUpdateQuestion(token, quizId, questionId, question,
    duration, points, answers);

  if ('error' in result) {
    if (result.error.startsWith('403')) {
      res.status(OWNERROR).json(result);
    } else if (result.error.startsWith('401')) {
      res.status(TOKENERR).json(result);
    } else {
      res.status(GENERROR).json(result);
    }
  } else {
    res.status(OKAY).json(result);
  }
});

// questionMove
app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { newPosition } = req.body;
  const token = Number(req.body.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }

  const result = adminQuestionMove(token, quizId, questionId, newPosition);

  if ('error' in result) {
    if (result.error.startsWith('403')) {
      res.status(OWNERROR).json(result);
    } else if (result.error.startsWith('401')) {
      res.status(TOKENERR).json(result);
    } else {
      res.status(GENERROR).json(result);
    }
  } else {
    res.status(OKAY).json(result);
  }
});

// questionDuplicate
app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = Number(req.body.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }

  const result = adminQuestionDuplicate(token, quizId, questionId);

  if ('error' in result) {
    if (result.error.startsWith('403')) {
      res.status(OWNERROR).json(result);
    } else if (result.error.startsWith('401')) {
      res.status(TOKENERR).json(result);
    } else {
      res.status(GENERROR).json(result);
    }
  } else {
    res.status(OKAY).json(result);
  }
});

// quizQuestionDelete
app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = Number(req.query.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }
  const result = quizQuestionDelete(token, quizid, questionId);
  if ('error' in result) {
    if (result.error.startsWith('403')) {
      res.status(OWNERROR).json(result);
      return;
    } else if (result.error.startsWith('401')) {
      res.status(TOKENERR).json(result);
      return;
    } else {
      res.status(GENERROR).json(result);
      return;
    }
  }
  res.status(OKAY).json(result);
});

// clear
app.delete('/v1/clear', (req: Request, res: Response) => {
  const result = clear();
  if ('error' in result) {
    res.status(GENERROR).json(result);
    return;
  }
  res.status(OKAY).json(result);
});

// trashempty
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const { token, quizIds } = req.query;

  if (!token || isNaN(Number(token))) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }

  let parsedQuizIds: number[] = [];

  if (Array.isArray(quizIds)) {
    parsedQuizIds = (quizIds as string[]).map(id => Number(id)).filter(id => !isNaN(id));
  } else if (typeof quizIds === 'string') {
    try {
      parsedQuizIds = JSON.parse(quizIds);
      if (!Array.isArray(parsedQuizIds)) {
        throw new Error();
      }
    } catch (error) {
      return res.status(GENERROR).json({ error: '400 Quiz IDs are not valid or not an array' });
    }
  } else {
    return res.status(GENERROR).json({ error: '400 Quiz IDs are missing or invalid' });
  }

  const result = adminQuizTrashEmpty(Number(token), parsedQuizIds);

  if ('error' in result) {
    if (result.error.startsWith('403')) {
      return res.status(OWNERROR).json(result);
    } else if (result.error.startsWith('401')) {
      return res.status(TOKENERR).json(result);
    } else {
      return res.status(GENERROR).json(result);
    }
  }

  return res.status(OKAY).json(result);
});

// adminQuizRestore
app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const token = Number(req.body.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }
  const result = adminQuizRestore(token, quizid);
  if ('error' in result) {
    if (result.error.startsWith('403')) {
      res.status(OWNERROR).json(result);
      return;
    } else if (result.error.startsWith('401')) {
      res.status(TOKENERR).json(result);
      return;
    } else {
      res.status(GENERROR).json(result);
      return;
    }
  }
  res.status(OKAY).json(result);
});

// adminAuthLogout
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const token = Number(req.body.token);
  if (isNaN(token)) {
    return res.status(TOKENERR).json({ error: 'Invalid token' });
  }
  const result = adminAuthLogout(token);
  if ('error' in result) {
    res.status(TOKENERR).json(result);
    return;
  }
  res.status(OKAY).json(result);
});
// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
