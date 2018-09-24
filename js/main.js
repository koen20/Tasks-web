var jsonArray = JSON.parse("[]");
var jsonArrayTags = JSON.parse("[]");
var userId;
var showCompleted = false;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log("signed in " + user.uid);
        handleSignedIn();
        getTags(user.uid);
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
    var ref = database.ref('users/' + id + '/items').orderByChild("date");
    ref.on('value', function (snapshot) {
        $("#taskItemsList").empty();
        snapshot.forEach(function (childSnapshot) {
            var colorr;
            if (childSnapshot.val().priority === 2) {
                colorr = "style=\"color: #F44336;\"";
            } else if (childSnapshot.val().priority === 1) {
                colorr = "style=\"color: #FB8C00;\"";
            }
            var c = "";
            if (childSnapshot.val().date < new Date().getTime()){
                c = "style=\"color: #ff4949;\"";
            }
            var subject = childSnapshot.val().subject;
            var completed = childSnapshot.val().completed;
            if (!completed || showCompleted === true) {
                var tags = getStringTags(jsonArrayTags, childSnapshot.val().tags);
                var liContent = "<span class=\"mdl-list__item-primary-content\">\n    <label class=\"mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect\" style=\'width: auto\'>\n       " +
                    " <input type=\"checkbox\" class=\"mdl-checkbox__input\" ";
                if (completed){
                    liContent = liContent + "checked"
                }
                    liContent = liContent +

                    "/>\n    </label>\n" +
                    "\n<span class=\"taskTitle\" " + colorr + ">" + subject + "</span><span> " + tags +
                    "</span><span class=\"mdl-list__item-sub-title\" " + c + ">" + getStringTs(childSnapshot.val().date) + "</span>\n</span>";


                $("#taskItemsList").append("<li class=\"mdl-list__item mdl-list__item--two-line\">" + liContent + "</li>");
                componentHandler.upgradeDom();
                var jsonObject = JSON.parse("{}");
                jsonObject.subject = childSnapshot.val().subject;
                jsonObject.date = childSnapshot.val().date;
                jsonObject.id = childSnapshot.val().id;
                jsonArray.push(jsonObject);
            }
        });
        $("#spinner-list").hide();
    });
}

function getTags(id) {
    var database = firebase.database();
    var ref = database.ref('users/' + id + '/tags');
    ref.on('value', function (snapshot) {
        jsonArrayTags = JSON.parse("[]");
        snapshot.forEach(function (childSnapshot) {
            var object = JSON.parse("{}");
            object.name = childSnapshot.val().name;
            object.key = childSnapshot.key;
            jsonArrayTags.push(object);
        });
        console.log(JSON.stringify(jsonArrayTags));
    });
}

function getStringTags(jsonArrayTT, arrayTags) {
    var tagsString = "";
    try {
        //jsonArrayT = JSON.parse(jsonArrayT);
        for (var i = 0; i < arrayTags.length; i++) {
            for (var d = 0; d < jsonArrayTT.length; d++) {
                var object = jsonArrayTT[d];
                //console.log(object.key);
                //console.log(jsonArrayT[i]);
                if (object.key === arrayTags[i]) {
                    console.log(object.name);
                    tagsString = tagsString + object.name + " "
                }
            }
        }
    } catch (e) {
        
    }
    return tagsString;
}

function getStringTs(ts) {
    var date = new Date(ts);
    var day = date.getDate();
    var month = date.getMonth() + 1;
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
    $('.cancel').click(function () {
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
        if (jsonObject.subject === $(this).parent().parent().children(".taskTitle").text()) {
            firebase.database().ref('users/' + userId + '/items/' + jsonObject.id).child("completed").set(this.checked);
        }
    }
});
