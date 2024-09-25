// Sample stub for the adminAuthRegister function
// creates a user and returns an authUserId linked with a newly created user. 
function adminAuthRegister (email, password, nameFirst, nameLast) {
    return {
        authUserId: 1
    }
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
function adminUserDetails (authUserId) {
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
