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
                var liContent = "<label class=\"mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect\" style=\'width: auto\'>\n" +
                    "        <input type=\"checkbox\" class=\"mdl-checkbox__input\"/>\n" +
                    "</label> " + childSnapshot.val().subject;


                $("#taskItemsList").append("<li class=\"mdl-list__item\">" + liContent + "</li>");
                componentHandler.upgradeDom();
            }
        });
    });
}

window.onload = function () {
    document.getElementById('sign-out').addEventListener('click', function () {
        firebase.auth().signOut();
    });
};