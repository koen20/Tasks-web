var jsonArray = JSON.parse("[]");
var userId;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log("signed in " + user.uid);
        handleSignedIn();
        databaseLoad(user.uid);
        userId = user.uid;
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
            var colorr;
            if (childSnapshot.val().priority === 2) {
                colorr = "style=\"color: #F44336;\"";
            } else if (childSnapshot.val().priority === 1) {
                colorr = "style=\"color: #FB8C00;\"";
            }
            if (!childSnapshot.val().completed) {
                var liContent = "<span class=\"mdl-list__item-primary-content\">\n    <label class=\"mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect\" style=\'width: auto\'>\n       " +
                    " <input type=\"checkbox\" class=\"mdl-checkbox__input\"/>\n    </label>\n" +
                    "\n<span " + colorr + ">" + childSnapshot.val().subject + "</span>" +
                    "<span class=\"mdl-list__item-sub-title\">" + getStringTs(childSnapshot.val().date) + "</span>\n</span>";


                $("#taskItemsList").append("<li class=\"mdl-list__item mdl-list__item--two-line\">" + liContent + "</li>");
                componentHandler.upgradeDom();
                var jsonObject = JSON.parse("{}");
                jsonObject.subject = childSnapshot.val().subject;
                jsonObject.date = childSnapshot.val().date;
                jsonObject.id = childSnapshot.val().id;
                jsonArray.push(jsonObject);
            }
        });
    });
}

function getStringTs(ts) {
    var date = new Date(ts);
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var formattedTime = day + "-" + month + "-" + year + " " + hours + ':' + minutes.substr(-2);
    if (ts === 0) {
        formattedTime = "";
    }
    return formattedTime;
}

window.onload = function () {
    document.getElementById('sign-out').addEventListener('click', function () {
        firebase.auth().signOut();
    });
};

$("#taskItemsList").on("click", "input[type='checkbox']", function () {
    if (this.checked) {
        console.log("checked");
        console.log($(this).parent().parent().children("span").text());
        for(var i = 0; i < jsonArray.length; i++) {
            var jsonObject = jsonArray[i];
            if(jsonObject.subject === $(this).parent().parent().children("span").text()){
                firebase.database().ref('users/' + userId + '/items/' + jsonObject.id).child("completed").set(true);
            }
        }
    } else {
        console.log("unchecked");
    }
});