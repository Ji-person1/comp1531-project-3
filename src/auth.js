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