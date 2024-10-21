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
import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserDetailsUpdate, 
    adminUserPasswordUpdate, adminAuthLogout 
  } from './auth.ts';
import { adminQuizList, adminQuizCreate, adminQuizDescriptionUpdate, adminQuizNameUpdate, adminQuizInfo,
  adminQuizRemove
 } from './quiz.ts';
import { clear } from './other.ts';
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
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(400);
  }

  return res.json(result);
});

//adminAuthRegister
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  console.log('Received email:', email);
  console.log('Received password:', password);
  console.log('Received nameFirst:', nameFirst);
  console.log('Received nameLast:', nameLast);
  const result = adminAuthRegister(email, password, nameFirst, nameLast)
  if ('error' in result) {
    res.status(400).json(result);
    return
  }
  res.status(200).json(result);
});

//adminAuthLogin
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = adminAuthLogin(email, password)
  if ('error' in result) {
    res.status(400).json(result);
    return
  }
  res.status(200).json(result);
});

//adminUserDetails
app.get('/v1/admin/auth/details', (req: Request, res: Response) => {
  const { token } = req.body;
  const result = adminUserDetails(token)
  if ('error' in result) {
    res.status(401).json(result);
    return
  }
  res.status(200).json(result);
});

//adminUserDetailUpdate
app.put('/v1/admin/auth/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const result = adminUserDetailsUpdate(token, email, nameFirst, nameLast)
  if ('error' in result) {
    if (result.error.startsWith('401')) {
      res.status(401).json(result);
      return
    }
    else {
      res.status(400).json(result);
      return
    }
  }
  res.status(200).json(result);
});

//adminUserPasswordUpdate
app.put('/v1/admin/auth/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const result = adminUserPasswordUpdate(token, oldPassword, newPassword)
  if ('error' in result) {
    if (result.error.startsWith('401')) {
      res.status(401).json(result);
      return
    }
    else {
      res.status(400).json(result);
      return
    }
  }
  res.status(200).json(result);
});

//adminquizList
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const { token } = req.body;
  const result = adminQuizList(token)
  if ('error' in result) {
    res.status(401).json(result);
    return
  }
  res.status(200).json(result);
});

//adminQuizCreate
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const result = adminQuizCreate(token, name, description)
  console.log('Received token:', token);
  console.log('Received name:', name);
  console.log('Received description:', description);
  if ('error' in result) {
    if (result.error.startsWith('401')) {
      res.status(401).json(result);
      return
    }
    else {
      res.status(400).json(result);
      return
    }
  }
  res.status(200).json(result);
  console.log('Received result:', result.quizId);
});

//adminQuizRemove
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid as string);
  const { token } = req.body;
  console.log('Received token:', token);
  console.log('Received quizid:', quizid);
  console.log('Received original:', parseInt(req.params.quizid as string));
  const result = adminQuizRemove(token, quizid)
  if ('error' in result) {
    if (result.error.startsWith('401')) {
      res.status(401).json(result);
      return
    }
    else {
      res.status(400).json(result);
      return
    }
  }
  res.status(200).json(result);
});

//adminQuizInfo
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid)
  const { token } = req.body;
  const result = adminQuizInfo(token, quizid)
  if ('error' in result) {
    if (result.error.startsWith('403')) {
      res.status(403).json(result);
      return
    } else if (result.error.startsWith('401')) {
      res.status(401).json(result);
      return
    } else {
      res.status(400).json(result);
      return
    }
  }
  res.status(200).json(result);
});

//adminNameUpdate
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid)
  const { token, name } = req.body;
  const result = adminQuizNameUpdate(token, quizid, name)
  if ('error' in result) {
    if (result.error.startsWith('403')) {
      res.status(403).json(result);
      return
    } else if (result.error.startsWith('401')) {
      res.status(401).json(result);
      return
    } else {
      res.status(400).json(result);
      return
    }
  }
  res.status(200).json(result);
});

//adminDescriptionUpdate
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid)
  const { token, description } = req.body;
  const result = adminQuizDescriptionUpdate(token, quizid, description)
  if ('error' in result) {
    if (result.error.startsWith('403')) {
      res.status(403).json(result);
      return
    } else if (result.error.startsWith('401')) {
      res.status(401).json(result);
      return
    } else {
      res.status(400).json(result);
      return
    }
  }
  res.status(200).json(result);
});

//clear
app.delete('/v1/clear', (req: Request, res: Response) => {
  const result = clear()
  if ('error' in result) {
    res.status(400).json(result);
    return
  }
  res.status(200).json(result);
});

// adminAuthLogout
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const result = adminAuthLogout(token);
  if ('error' in result) {
    res.status(401).json(result);
    return;
  }
  res.status(200).json(result);
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
