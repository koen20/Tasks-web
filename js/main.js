firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log("signed in " + user.uid);
        handleSignedIn();
        databaseLoad(user.uid);
    } else {
        console.log("signed out");
        $("#content").hide();
        signIn();
    }
});

function databaseLoad(id) {
    var database = firebase.database();
    var ref = database.ref('users/' + id + '/items');
    ref.on('value', function (snapshot) {
        $("#taskItemsList").empty();
        snapshot.forEach(function (childSnapshot) {
            if (!childSnapshot.val().completed) {
                $("#taskItemsList").append("<li class=\"mdl-list__item\">" + childSnapshot.val().subject + "</li>");
            }
        });
    });
}

window.onload = function () {
    document.getElementById('sign-out').addEventListener('click', function () {
        firebase.auth().signOut();
    });
};