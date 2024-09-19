
// Sample stub for the adminAuthRegister function
// creates a user and returns an authUserId linked with a newly created user. 
function adminAuthRegister (email, password, nameFirst, nameLast) {
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