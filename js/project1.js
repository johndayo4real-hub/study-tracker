/* ================================= */
/* INITIAL VARIABLES AND SAVED DATA */
/* ================================= */

let sessionCount = 0;
let targetSeconds = 0;
let seconds = 0;
let timer;

let sessionActive = false;
let editingIndex = -1;


// LOAD SAVED DAILY TARGET

let savedTarget = localStorage.getItem("targetSeconds");

if(savedTarget != null){
    targetSeconds = Number(savedTarget);
}


// LOAD TOTAL STUDY TIME

let totalStudySeconds = 0;

let savedStudyTime = localStorage.getItem("totalStudySeconds");

if(savedStudyTime != null){
    totalStudySeconds = Number(savedStudyTime);
}


// LOAD COMPLETED SESSIONS

let completedSessions = [];

let savedSessions = localStorage.getItem("completedSessions");

if(savedSessions != null){
    completedSessions = JSON.parse(savedSessions);
}


// LOAD STUDY HISTORY

let studyHistory = [];

let savedHistory = localStorage.getItem("studyHistory");

if(savedHistory != null){
    studyHistory = JSON.parse(savedHistory);
}


/* ================================= */
/* DAILY DATE CHECK AND RESET */
/* ================================= */

let today = new Date().toDateString();

let savedDate = localStorage.getItem("studyDate");

if(savedDate == null){

    // FIRST TIME USING THE TRACKER

    localStorage.setItem("studyDate", today);

}

else if(savedDate != today){

    // SAVE THE PREVIOUS DAY

    if(
        totalStudySeconds > 0 ||
        completedSessions.length > 0 ||
        targetSeconds > 0
    ){

        studyHistory.push({

            date: savedDate,

            target: targetSeconds,

            totalStudyTime: totalStudySeconds,

            sessions: completedSessions

        });

        localStorage.setItem(
            "studyHistory",
            JSON.stringify(studyHistory)
        );

    }


    // RESET DAILY RECORDS

    targetSeconds = 0;
    totalStudySeconds = 0;
    completedSessions = [];
    sessionCount = 0;
    seconds = 0;
    timer = undefined;
    sessionActive = false;


    // UPDATE LOCAL STORAGE

    localStorage.setItem("targetSeconds", targetSeconds);

    localStorage.setItem("totalStudySeconds", totalStudySeconds);

    localStorage.setItem(
        "completedSessions",
        JSON.stringify(completedSessions)
    );


    // SAVE THE NEW DATE

    localStorage.setItem("studyDate", today);

    console.log("A new study day has started!");

}


/* ================================= */
/* HTML ELEMENTS */
/* ================================= */

// DAILY TARGET

let targetDisplay = document.getElementById("target");
let totalDisplay = document.getElementById("remaining");

let targetOverlay = document.getElementById("targetOverlay");
let openTarget = document.getElementById("openTarget");
let closeTarget = document.getElementById("closeTarget");
let cancelTarget = document.getElementById("cancelTarget");
let saveTarget = document.getElementById("saveTarget");

let goalHours = document.getElementById("goalHours");
let goalMinutes = document.getElementById("goalMinutes");
let goalSeconds = document.getElementById("goalSeconds");


// PROGRESS

let statusDisplay = document.getElementById("status");
let timerDisplay = document.getElementById("timer");
let percentageDisplay = document.getElementById("percentage");
let progressBar = document.getElementById("progress");


// DAILY STATISTICS

let todayStudyTime = document.getElementById("todayStudyTime");
let todaySessionCount = document.getElementById("todaySessionCount");
let todayAchievement = document.getElementById("todayAchievement");


// STUDY SESSIONS

let addSession = document.getElementById("addSession");
let removeSession = document.getElementById("removeSession");

let sessionOverlay = document.getElementById("sessionOverlay");
let sessionList = document.getElementById("sessionList");

let closeSession = document.getElementById("closeSession");
let cancelSession = document.getElementById("cancelSession");
let beginSession = document.getElementById("beginSession");

let courseName = document.getElementById("courseName");
let studyTopic = document.getElementById("studyTopic");


// CURRENT SESSION

let currentCourse = document.getElementById("currentCourse");
let currentTopic = document.getElementById("currentTopic");


// TIMER BUTTONS

let completeSession = document.getElementById("completeSession");
let startTimer = document.getElementById("startTimer");
let pauseTimer = document.getElementById("pauseTimer");
let resetTimer = document.getElementById("resetTimer");


// EDIT SESSION MODAL

let editOverlay = document.getElementById("editOverlay");
let closeEdit = document.getElementById("closeEdit");
let cancelEdit = document.getElementById("cancelEdit");
let saveEdit = document.getElementById("saveEdit");

let editCourse = document.getElementById("editCourse");
let editTopic = document.getElementById("editTopic");


// HISTORY AND WEEKLY PROGRESS

let historyList = document.getElementById("historyList");
let weeklyChart = document.getElementById("weeklyChart");


// KEYBOARD SHORTCUTS

let keyboardMessage = document.getElementById("keyboardMessage");


/* ================================= */
/* TIME FORMATTING */
/* ================================= */

function formatTime(time){

    let hours = Math.floor(time / 3600);

    let minutes = Math.floor((time % 3600) / 60);

    let seconds = time % 60;

    return (
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0")
    );

}


/* ================================= */
/* SAVE DATA FUNCTIONS */
/* ================================= */

function saveSessions(){

    localStorage.setItem(
        "completedSessions",
        JSON.stringify(completedSessions)
    );

}


function saveStudyTime(){

    localStorage.setItem(
        "totalStudySeconds",
        totalStudySeconds
    );

}


function saveHistory(){

    localStorage.setItem(
        "studyHistory",
        JSON.stringify(studyHistory)
    );

}


/* ================================= */
/* DAILY TARGET */
/* ================================= */

openTarget.onclick = function(){

    targetOverlay.style.display = "flex";

};


closeTarget.onclick = function(){

    targetOverlay.style.display = "none";

};


cancelTarget.onclick = function(){

    targetOverlay.style.display = "none";

};


saveTarget.onclick = function(){

    if(
        goalHours.value == "" &&
        goalMinutes.value == "" &&
        goalSeconds.value == ""
    ){

        alert("Please enter a study target");

        return;

    }


    if(
        Number(goalMinutes.value) > 59 ||
        Number(goalSeconds.value) > 59 ||
        Number(goalHours.value) < 0 ||
        Number(goalMinutes.value) < 0 ||
        Number(goalSeconds.value) < 0 ||
        Number(goalHours.value) % 1 != 0 ||
        Number(goalMinutes.value) % 1 != 0 ||
        Number(goalSeconds.value) % 1 != 0
    ){

        alert("Please enter a valid time");

        return;

    }


    // CONVERT INPUT TO SECONDS

    targetSeconds =
        (Number(goalHours.value) * 3600) +
        (Number(goalMinutes.value) * 60) +
        Number(goalSeconds.value);


    if(targetSeconds == 0){

        alert("Your study target must be greater than zero");

        return;

    }


    localStorage.setItem("targetSeconds", targetSeconds);


    targetDisplay.textContent = formatTime(targetSeconds);


    targetOverlay.style.display = "none";


    updateProgress();

    updateWeeklyChart();

};


/* ================================= */
/* UPDATE DAILY STATISTICS */
/* ================================= */

function updateStatistics(){

    let currentTotal = totalStudySeconds + seconds;

    let achievement = 0;


    if(targetSeconds > 0){

        achievement = (currentTotal / targetSeconds) * 100;

    }


    if(achievement > 100){

        achievement = 100;

    }


    todayStudyTime.textContent = formatTime(currentTotal);

    todaySessionCount.textContent = completedSessions.length;

    todayAchievement.textContent =
        Math.floor(achievement) + "%";

}


/* ================================= */
/* UPDATE PROGRESS */
/* ================================= */

function updateProgress(){

    let currentTotal = totalStudySeconds + seconds;

    let percentage = 0;


    if(targetSeconds > 0){

        percentage = (currentTotal / targetSeconds) * 100;

    }


    if(percentage > 100){

        percentage = 100;

    }


    // UPDATE PERCENTAGE AND PROGRESS BAR

    percentageDisplay.textContent =
        Math.floor(percentage) + "%";

    progressBar.style.width = percentage + "%";


    // UPDATE STATUS MESSAGE

    if(targetSeconds == 0){

        statusDisplay.textContent = "Set a study target first!";

    }
    else if(percentage < 25){

        statusDisplay.textContent = "Just getting started!";

    }
    else if(percentage < 50){

        statusDisplay.textContent = "Good progress!";

    }
    else if(percentage < 60){

        statusDisplay.textContent = "Halfway there!";

    }
    else if(percentage < 80){

        statusDisplay.textContent = "You're doing amazing!";

    }
    else if(percentage < 100){

        statusDisplay.textContent = "Almost there!";

    }
    else{

        statusDisplay.textContent = "Daily target achieved!";

    }


    // UPDATE REMAINING TIME

    if(targetSeconds > 0){

        let timeLeft = targetSeconds - currentTotal;

        if(timeLeft < 0){

            timeLeft = 0;

        }

        totalDisplay.textContent =
            formatTime(timeLeft) + " remaining";

    }
    else{

        totalDisplay.textContent = "Set a study target first";

    }


    // UPDATE STATISTICS

    updateStatistics();

}


/* ================================= */
/* DISPLAY COMPLETED SESSIONS */
/* ================================= */

function renderSessions(){

    // CLEAR THE OLD SESSION CARDS

    sessionList.innerHTML = "";


    if(completedSessions.length == 0){

        let message = document.createElement("p");

        message.className = "empty-message";

        message.textContent = "No completed sessions yet.";

        sessionList.appendChild(message);

    }


    for(let i = 0; i < completedSessions.length; i++){

        let session = completedSessions[i];


        let sessionCard = document.createElement("div");

        sessionCard.className = "completed-session";


        let course = document.createElement("h3");

        course.textContent = session.course;


        let topic = document.createElement("p");

        topic.textContent = session.topic;


        let duration = document.createElement("p");

        duration.textContent =
            formatTime(session.duration) + " studied";


        // SESSION ACTION BUTTONS

        let actions = document.createElement("div");

        actions.className = "session-actions";


        let editButton = document.createElement("button");

        editButton.textContent = "Edit";


        let deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "delete-session";


        // EDIT BUTTON

        editButton.onclick = function(){

            editingIndex = i;

            editCourse.value = session.course;

            editTopic.value = session.topic;

            editOverlay.style.display = "flex";

        };


        // DELETE BUTTON

        deleteButton.onclick = function(){

            if(confirm("Are you sure you want to delete this session?")){

                totalStudySeconds =
                    totalStudySeconds - completedSessions[i].duration;

                if(totalStudySeconds < 0){

                    totalStudySeconds = 0;

                }


                completedSessions.splice(i, 1);


                saveSessions();

                saveStudyTime();

                renderSessions();

                updateProgress();

                updateWeeklyChart();

            }

        };


        actions.appendChild(editButton);

        actions.appendChild(deleteButton);


        sessionCard.appendChild(course);

        sessionCard.appendChild(topic);

        sessionCard.appendChild(duration);

        sessionCard.appendChild(actions);


        sessionList.appendChild(sessionCard);

    }

}


/* ================================= */
/* EDIT COMPLETED SESSION */
/* ================================= */

closeEdit.onclick = function(){

    editOverlay.style.display = "none";

};


cancelEdit.onclick = function(){

    editOverlay.style.display = "none";

};


saveEdit.onclick = function(){

    let newCourse = editCourse.value.trim();

    let newTopic = editTopic.value.trim();


    if(newCourse == ""){

        alert("Please enter a course name");

        return;

    }


    if(newTopic == ""){

        alert("Please enter a topic");

        return;

    }


    if(editingIndex != -1){

        completedSessions[editingIndex].course = newCourse;

        completedSessions[editingIndex].topic = newTopic;

    }


    saveSessions();

    renderSessions();


    editOverlay.style.display = "none";

    editingIndex = -1;

};


/* ================================= */
/* STUDY TIMER */
/* ================================= */

startTimer.onclick = function(){

    if(sessionActive == false){

        alert("Please add a study session first.");

        return;

    }


    if(timer == undefined){

        timer = setInterval(function(){

            seconds++;

            timerDisplay.textContent = formatTime(seconds);

            updateProgress();

        }, 1000);

    }

};


pauseTimer.onclick = function(){

    clearInterval(timer);

    timer = undefined;

};


resetTimer.onclick = function(){

    clearInterval(timer);

    timer = undefined;

    seconds = 0;

    timerDisplay.textContent = "00:00:00";

    updateProgress();

};


/* ================================= */
/* COMPLETE STUDY SESSION */
/* ================================= */

completeSession.onclick = function(){

    if(sessionActive == false){

        alert("Please add a study session first.");

        return;

    }


    if(seconds == 0){

        alert("You haven't studied yet!");

        return;

    }


    clearInterval(timer);

    timer = undefined;


    let completedSeconds = seconds;


    totalStudySeconds =
        totalStudySeconds + completedSeconds;


    saveStudyTime();


    // SAVE THE COMPLETED SESSION

    completedSessions.push({

        course: currentCourse.textContent,

        topic: currentTopic.textContent,

        duration: completedSeconds

    });


    saveSessions();


    // END CURRENT SESSION

    seconds = 0;

    sessionActive = false;

    currentCourse.textContent = "No active session";

    currentTopic.textContent = "";

    timerDisplay.textContent = "00:00:00";


    // REFRESH THE PAGE INFORMATION

    renderSessions();

    updateProgress();

    updateWeeklyChart();

};


/* ================================= */
/* CREATE A NEW STUDY SESSION */
/* ================================= */

closeSession.onclick = function(){

    sessionOverlay.style.display = "none";

};


cancelSession.onclick = function(){

    sessionOverlay.style.display = "none";

};


addSession.onclick = function(){

    if(sessionActive == true){

        alert("Please complete or reset your current session first.");

        return;

    }


    sessionOverlay.style.display = "flex";

};


beginSession.onclick = function(){

    let course = courseName.value.trim();

    let topic = studyTopic.value.trim();


    if(course == ""){

        alert("Please enter the course you want to study.");

        return;

    }


    if(topic == ""){

        alert("Please enter the topic you want to study.");

        return;

    }


    currentCourse.textContent = course;

    currentTopic.textContent = topic;


    sessionOverlay.style.display = "none";


    courseName.value = "";

    studyTopic.value = "";


    seconds = 0;

    timerDisplay.textContent = "00:00:00";

    sessionActive = true;


    startTimer.click();

};


/* ================================= */
/* REMOVE LAST COMPLETED SESSION */
/* ================================= */

removeSession.onclick = function(){

    if(completedSessions.length == 0){

        alert("There are no completed sessions to remove!");

        return;

    }


    let lastSession = completedSessions.pop();


    totalStudySeconds =
        totalStudySeconds - lastSession.duration;


    if(totalStudySeconds < 0){

        totalStudySeconds = 0;

    }


    saveSessions();

    saveStudyTime();


    renderSessions();

    updateProgress();

    updateWeeklyChart();

};


/* ================================= */
/* DISPLAY STUDY HISTORY */
/* ================================= */

function renderHistory(){

    historyList.innerHTML = "";


    if(studyHistory.length == 0){

        let message = document.createElement("p");

        message.className = "empty-message";

        message.textContent = "Your previous study days will appear here.";

        historyList.appendChild(message);

        return;

    }


    // DISPLAY NEWEST DAYS FIRST

    for(let i = studyHistory.length - 1; i >= 0; i--){

        let day = studyHistory[i];


        let historyCard = document.createElement("div");

        historyCard.className = "history-day";


        let heading = document.createElement("h3");

        heading.textContent = day.date;


        let total = document.createElement("p");

        total.textContent =
            "Total study time: " + formatTime(day.totalStudyTime);


        let target = document.createElement("p");

        target.textContent =
            "Daily target: " + formatTime(day.target);


        let count = document.createElement("p");

        count.textContent =
            "Completed sessions: " + day.sessions.length;


        let achievement = 0;

        if(day.target > 0){

            achievement =
                (day.totalStudyTime / day.target) * 100;

        }

        if(achievement > 100){

            achievement = 100;

        }


        let achievementText = document.createElement("p");

        achievementText.textContent =
            "Achievement: " + Math.floor(achievement) + "%";


        historyCard.appendChild(heading);

        historyCard.appendChild(total);

        historyCard.appendChild(target);

        historyCard.appendChild(count);

        historyCard.appendChild(achievementText);


        // DISPLAY SESSIONS FROM THAT DAY

        for(let j = 0; j < day.sessions.length; j++){

            let savedSession = day.sessions[j];


            let sessionCard = document.createElement("div");

            sessionCard.className = "history-session";


            let sessionHeading = document.createElement("strong");

            sessionHeading.textContent = savedSession.course;


            let sessionTopic = document.createElement("p");

            sessionTopic.textContent = savedSession.topic;


            let sessionDuration = document.createElement("p");

            sessionDuration.textContent =
                formatTime(savedSession.duration) + " studied";


            sessionCard.appendChild(sessionHeading);

            sessionCard.appendChild(sessionTopic);

            sessionCard.appendChild(sessionDuration);


            historyCard.appendChild(sessionCard);

        }


        historyList.appendChild(historyCard);

    }

}


/* ================================= */
/* WEEKLY STUDY PROGRESS */
/* ================================= */

function updateWeeklyChart(){

    weeklyChart.innerHTML = "";


    let weeklyData = [];

    let currentDate = new Date();


    // CREATE THE LAST SEVEN DAYS

    for(let i = 6; i >= 0; i--){

        let date = new Date(currentDate);

        date.setDate(currentDate.getDate() - i);


        let dateKey = date.toDateString();

        let dayTime = 0;


        // CHECK IF THIS IS TODAY

        if(dateKey == today){

            dayTime = totalStudySeconds + seconds;

        }
        else{

            // FIND THE DAY IN STUDY HISTORY

            for(let j = 0; j < studyHistory.length; j++){

                if(studyHistory[j].date == dateKey){

                    dayTime = studyHistory[j].totalStudyTime;

                    break;

                }

            }

        }


        weeklyData.push({

            label: date.toLocaleDateString("en-US", {
                weekday: "short"
            }),

            time: dayTime

        });

    }


    // FIND THE HIGHEST STUDY TIME

    let highestTime = 0;

    for(let i = 0; i < weeklyData.length; i++){

        if(weeklyData[i].time > highestTime){

            highestTime = weeklyData[i].time;

        }

    }


    // CREATE THE SEVEN BARS

    for(let i = 0; i < weeklyData.length; i++){

        let day = weeklyData[i];


        let dayContainer = document.createElement("div");

        dayContainer.className = "weekly-day";


        let barArea = document.createElement("div");

        barArea.className = "weekly-bar-area";


        let bar = document.createElement("div");

        bar.className = "weekly-bar";


        let height = 0;

        if(highestTime > 0){

            height = (day.time / highestTime) * 100;

        }


        bar.style.height = height + "%";


        let time = document.createElement("span");

        time.className = "weekly-time";

        time.textContent = formatTime(day.time);


        let label = document.createElement("span");

        label.className = "weekly-label";

        label.textContent = day.label;


        barArea.appendChild(bar);

        dayContainer.appendChild(barArea);

        dayContainer.appendChild(time);

        dayContainer.appendChild(label);


        weeklyChart.appendChild(dayContainer);

    }

}


/* ================================= */
/* KEYBOARD SHORTCUTS */
/* ================================= */

document.addEventListener("keydown", function(event){

    // DO NOT USE SHORTCUTS WHILE TYPING

    if(
        event.target.tagName == "INPUT" ||
        event.target.tagName == "TEXTAREA"
    ){

        return;

    }


    let key = event.key.toLowerCase();


    if(key == "s"){

        startTimer.click();

        keyboardMessage.textContent = "Study timer started.";

    }
    else if(key == "p"){

        pauseTimer.click();

        keyboardMessage.textContent = "Study timer paused.";

    }
    else if(key == "r"){

        resetTimer.click();

        keyboardMessage.textContent = "Study timer reset.";

    }
    else if(key == "c"){

        completeSession.click();

        keyboardMessage.textContent = "Complete session shortcut pressed.";

    }

});


/* ================================= */
/* RESTORE SAVED INFORMATION */
/* ================================= */

// RESTORE DAILY TARGET

if(targetSeconds > 0){

    targetDisplay.textContent = formatTime(targetSeconds);

}


// RESTORE COMPLETED SESSIONS

sessionCount = completedSessions.length;

renderSessions();


// RESTORE PROGRESS AND STATISTICS

updateProgress();


// RESTORE HISTORY

renderHistory();


// RESTORE WEEKLY CHART

updateWeeklyChart();
