function handleSignedIn() {
    $("#content").show();
}

function signIn() {
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', {
        callbacks: {
            // Called when the user has been successfully signed in.
            signInSuccess: function (authResult, redirectUrl) {
                return false;
            }
        },
        signInFlow: 'popup',
        signInOptions: [{
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            authMethod: 'https://accounts.google.com',
            clientId: 'tasks-25357.apps.googleusercontent.com'
        },

            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ], credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO
    });
}
