import request from 'sync-request-curl';
import fs from 'fs';

// HELPER FUNCTIONS //

const rawData = fs.readFileSync('src/config.json');
const data = JSON.parse(rawData);
const url = data.url;
const port = data.port;

const assert = (condition) => {
  if (!condition) { throw Error('Assert failed'); }
};

function requestHelper(method, path, payload) {
  let qs = {};
  let json = {};
  const headers = { 'token': payload.token };
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }

  const res = request(method, path, { qs, json, headers } );

  if (res.statusCode !== 200) {
    // Return error code number instead of object in case of error.
    // (just for convenience)
    return res.statusCode;
  }
  return JSON.parse(res.getBody());
}

const clear = () => {
  return requestHelper(
    'DELETE', 
    `${url}:${port}/v1/clear`, 
    {}
  );
}

const adminAuthRegister = (email, password, nameFirst, nameLast) => {
  return requestHelper( 
    'POST', 
    `${url}:${port}/v1/admin/auth/register`,
    { email, password, nameFirst, nameLast }
  );
};

const adminQuizCreate = (token, name, description) => {
  return requestHelper(
    'POST',
    `${url}:${port}/v1/admin/quiz`,
    { token, name, description },
  );
};

const adminQuizList = (token) => {
  return requestHelper(
    'GET',
    `${url}:${port}/v1/admin/quiz/list`,
    { token },
  );
};

const adminUserDetailsGet = (token) => {
  return requestHelper( 
    'GET', 
    `${url}:${port}/v1/admin/user/details`,
    { token }
  );
}

// TESTS //
function testClear() {
  clear();
  adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
  clear();
  const data = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
  assert(data !== 400);
  console.log(data)
}

function testAdminAuthRegister() {
  clear();
  const data = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
  assert(typeof data === 'object' && 'token' in data && typeof data.token === 'string');
}

const testAdminQuizCreate = () => {
  clear();
  const token = adminAuthRegister('email@email.com', 'Password1', 'first', 'last').token;
  const data = adminQuizCreate(token, 'Quiz name', 'Quiz description');
  assert(typeof data === 'object' && 'quizId' in data && typeof data.quizId === 'number');
  console.log(data)
}

const testUserDetails = () => {
  clear();
  const token = adminAuthRegister('blah@email.com', 'password1YAY', 'john', 'smith').token;
  const data = adminUserDetailsGet(token);
  console.log(data)
  assert(
    typeof data === 'object' && 
    'user' in data && typeof data.user === 'object' &&
    'userId' in data.user && typeof data.user.userId === 'number' && 
    'email' in data.user && data.user.email === 'blah@email.com' && 
    'name' in data.user && data.user.name === 'john smith' && 
    'numSuccessfulLogins' in data.user && data.user.numSuccessfulLogins === 1 && 
    'numFailedPasswordsSinceLastLogin' in data.user && data.user.numFailedPasswordsSinceLastLogin === 0
  )
}

const testAdminQuizList = () => {
  clear();
  const token = adminAuthRegister('email@email.com', 'Password1', 'first', 'last').token;
  const quizId = adminQuizCreate(token, 'Quiz name', 'Quiz description').quizId;
  const data = adminQuizList(token);
  assert(
    typeof data === 'object' && 'quizzes' in data && typeof data.quizzes === 'object' && 'name' in data.quizzes[0]
    && 'quizId' in data.quizzes[0] && data.quizzes[0].name === 'Quiz name' && data.quizzes[0].quizId === quizId
  );
}


const tests = [
  testClear, testAdminAuthRegister,
  testAdminQuizCreate, testAdminQuizList,
  testUserDetails
];
let failed = 0;
for (let i = 0; i < tests.length; i++) {
  try {
    tests[i]();
  } catch (err) {
    console.log("You failed test", i)
    failed++;
  }
}
console.log(`You passed ${tests.length - failed} out of ${tests.length} tests.`);


