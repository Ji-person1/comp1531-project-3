import validator from 'validator';
import {getData} from './dataStore.js'

// Sample stub for the adminAuthRegister function
// creates a user and returns an authUserId linked with a newly created user. 
export function adminAuthRegister (email, password, nameFirst, nameLast) {
    const data = getData()

    if (!validator.isEmail(email)) {
        return { error: 'invalid email address' }
    }
    
    if (data.users.some(user => user.email === email)) {
        return { error: 'email already in use' }
    }
    const nameTest = /^[a-zA-Z\s'-]+$/

    if (!nameTest.test(nameFirst)) {
        return { error: 'invalid characters in first name' }
    }
    else if (nameFirst.length < 2 || nameFirst.length > 20) {
        return { error: 'invalid first name length' }
    }

    if (!nameTest.test(nameLast)) {
        return { error: 'invalid characters in last name' }
    }
    else if (nameLast.length < 2 || nameLast.length > 20) {
        return { error: 'invalid last name length' }
    }

    const passwordTest = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    if (!passwordTest.test(password)) {
        return { error: 'password must be at least 8 characters long and contain at least one letter and one number.' }
    }
    const authUserId = data.users.length > 0 ? data.users[data.users.length - 1].id + 1 : 1

    const newUser = {
        id: authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        password: password,
        numSuccessfulLogins: 0,
        numFailedPasswordsSinceLastLogin: 0
    }
    data.users.push(newUser)
    return authUserId
}

// Sample stub for the adminAuthLogin function
// returns the authUserId if given an account's email and password
function adminAuthLogin (email, password) {
    return {
        authUserId: 1
    }
}

// Sample stub for the adminUsrDetails function
// returns user details based on the authUserId given
export function adminUserDetails (authUserId) {
    return { user:
        {
            userId: 1,
            name: 'Hayden Smith',
            email: 'hayden.smith@unsw.edu.au',
            numSuccessfulLogins: 3,
            numFailedPasswordsSinceLastLogin: 1,
        }
    }
}

//Given an admin user's authUserId and a set of properties, this function updates the properties of this logged in admin user.
function adminUserDetailsUpdate (authUserId, email, nameFirst, nameLast) {
    return {}; 
}

//Given details relating to a password change, this function updates the password of a logged in user.
function adminUserPasswordUpdate (authUserId, oldPassword, newPassword) {
    return {}; 
}
