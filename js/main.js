var jsonArray = JSON.parse("[]");
var userId;
var showCompleted = false;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log("signed in " + user.uid);
        handleSignedIn();
        databaseLoad(user.uid, showCompleted);
        userId = user.uid;
    } else {
        console.log("signed out");
        $("#content").hide();
        signIn();
    }
});

function databaseLoad(id, showCompleted) {
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
            var subject = childSnapshot.val().subject;
            var completed = childSnapshot.val().completed;
            if (!completed || showCompleted === true) {
                var liContent = "<span class=\"mdl-list__item-primary-content\">\n    <label class=\"mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect\" style=\'width: auto\'>\n       " +
                    " <input type=\"checkbox\" class=\"mdl-checkbox__input\" ";
                if (completed){
                    liContent = liContent + "checked"
                }
                    liContent = liContent +

                    "/>\n    </label>\n" +
                    "\n<span " + colorr + ">" + subject + "</span>" +
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
    $('#addTask').click(function () {
        var dialog = document.querySelector('#dialog');
        if (!dialog.showModal) {
            dialogPolyfill.registerDialog(dialog);
        }
        dialog.showModal();
    });
    $('#dialogAddTask').click(function () {
        var subject = $("#addTaskSubject").val();
        var priority = parseInt($('input[name=options]:checked').val());
        console.log(priority);
        var d = firebase.database().ref('users/' + userId).child("items").push();
        d.set({
            subject: subject,
            id: d.getKey(),
            date: 0,
            priority: priority
        });
        document.querySelector('#dialog').close();
    });
    var dialog = new mdDateTimePicker.default({
        type: 'date',
        orientation: 'PORTRAIT'
    });
    $('#addTaskDate').click(function () {
        //$("#dialog").hide();
        //$(".mdl-layout__obfuscator").hide();
        //dialog.toggle();
    });
    $('#checkboxShowCompleted').change(function() {
        if(this.checked) {
            showCompleted = true;
            databaseLoad(userId, showCompleted);
        } else {
            showCompleted = false;
            databaseLoad(userId, showCompleted);
        }
    });
};

$("#taskItemsList").on("click", "input[type='checkbox']", function () {
    for (var i = 0; i < jsonArray.length; i++) {
        var jsonObject = jsonArray[i];
        if (jsonObject.subject === $(this).parent().parent().children("span").text()) {
            firebase.database().ref('users/' + userId + '/items/' + jsonObject.id).child("completed").set(this.checked);
        }
    }
});