function adminQuizInfo(authUserId, quizId) {
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683126871,
        description: 'This is my quiz',
    }
}

function adminQuizList( authUserId ) // Provides a list of all quizzes that are owned by the currently logged in user.
{ quizzes: [
    {
      quizId: 1,
      name: 'My Quiz',
    }
  ]
}

function adminQuizCreate ( authUserId, name, description ) //Given basic details about a new quiz, create one for the logged in user.
{
    quizId: 2
}