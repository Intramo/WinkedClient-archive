var gameState = "playerJoin" // playerJoin, waiting, answerNormal, answerTrueFalse, playerCorrect, playerWrong, hostLobby, hostPodium, hostLeaderboard, hostResults, hostAnswers, hostQuestion

refreshDisplay();

var sessionCode = ""

var playerAnswerStreak = 0
var playerName = "None"
var playerPoints = 0
var answerCorrect = false
var progress = "0 von 0"

var hostAnswers = 0
var hostCountdown = 0
var hostQuestionDuration = ""
var hostQuestionName = ""
var hostOptionNameRed = ""
var hostOptionNameBlue = ""
var hostOptionNameYellow = ""
var hostOptionNameGreen = ""

var countdownStart = 0
var countdownDuration = 10000 //ms

function startCountDownByWordLength(length) {
    startCountdown(length * 160)
}

function startCountdown(length) {
    countdownStart = Date.now()
    countdownDuration = length
}

function getCountdown() {
    if (Date.now() - countdownStart > countdownDuration) { return 0 }
    return (countdownDuration + (countdownStart - Date.now())) / 1000
}

function onButtonPress(btn) { // A, B, C, D, Y, N
    gameState = "waiting"
    refreshDisplay();
    connection.send(JSON.stringify({ "packettype": "answer", "answer": btn }))
}

function next() {
    connection.send(JSON.stringify({ "packettype": "next" }))
}

function onLogin() {
    let pin = document.getElementById('gamePin').value;
    let name = document.getElementById('gameName').value;
    sessionCode = pin;
    connection.send(JSON.stringify({ "packettype": "joinRequest", "session": pin, "name": name }))
}

function refreshDisplay() {
    for (const element of document.getElementsByClassName("page")) {
        element.style.display = "none";
    }

    document.getElementById("page-" + gameState).style.display = "initial";

    for (const element of document.getElementsByClassName("var-playerAnswerStreak")) { element.innerHTML = playerAnswerStreak };
    for (const element of document.getElementsByClassName("var-playerName")) { element.innerHTML = playerName };
    for (const element of document.getElementsByClassName("var-playerPoints")) { element.innerHTML = playerPoints };
    for (const element of document.getElementsByClassName("var-answerCorrect")) { element.innerHTML = answerCorrect };
    for (const element of document.getElementsByClassName("var-progress")) { element.innerHTML = progress };

    for (const element of document.getElementsByClassName("var-hostAnswers")) { element.innerHTML = hostAnswers };
    for (const element of document.getElementsByClassName("var-hostQuestionName")) { element.innerHTML = hostQuestionName };
    for (const element of document.getElementsByClassName("var-hostOptionNameRed")) { element.innerHTML = hostOptionNameRed };
    for (const element of document.getElementsByClassName("var-hostOptionNameBlue")) { element.innerHTML = hostOptionNameBlue };
    for (const element of document.getElementsByClassName("var-hostOptionNameYellow")) { element.innerHTML = hostOptionNameYellow };
    for (const element of document.getElementsByClassName("var-hostOptionNameGreen")) { element.innerHTML = hostOptionNameGreen };
    for (const element of document.getElementsByClassName("var-sessionCode")) { element.innerHTML = sessionCode };
}

var connection = new WebSocket("ws://localhost:4348/");

connection.onopen = function (e) {
    console.log("Connection established")
};

connection.onmessage = function (event) {
    let data = JSON.parse(event.data)

    console.log(data)

    if (data["packettype"] === "error") {
        alert(data["message"])
        return
    }

    if (data["packettype"] === "lobbyjoin") {
        document.getElementById("playerList").innerHTML = document.getElementById("playerList").innerHTML + "<div>" + data["name"] + "</div>"
        return
    }

    if (data["packettype"] === "gamestate") {
        gameState = data["gameState"]
        playerAnswerStreak = parseInt(data["playerAnswerStreak"])
        playerName = data["playerName"]
        playerPoints = parseInt(data["playerPoints"])
        answerCorrect = data["answerCorrect"]
        progress = data["progress"]
        hostQuestionName = data["hostQuestionName"]
        hostOptionNameRed = data["hostOptionNameRed"]
        hostOptionNameBlue = data["hostOptionNameBlue"]
        hostOptionNameYellow = data["hostOptionNameYellow"]
        hostOptionNameGreen = data["hostOptionNameGreen"]
        hostQuestionDuration = data["hostQuestionDuration"]

        if (gameState === "hostQuestion") {
            startCountdown(5 * 1000)
            function hostQuestionCountdown() {
                let ct = getCountdown()
                if (ct <= 0) {
                    next()
                    return
                }
                let percent = 100 - 100 * (ct / (countdownDuration / 1000))
                document.getElementById("hostQuestionProgressIndicator").style.width = percent + "%"
                setTimeout(hostQuestionCountdown, 15)
            }
            hostQuestionCountdown()
        }

        if (gameState.startsWith("hostAnswers")) {
            startCountdown(hostQuestionDuration * 1000)
            function hostQuestionCountdown() {
                let ct = getCountdown()
                if (ct <= 0) {
                    next()
                    return
                }
                for (const element of document.getElementsByClassName("var-hostQuestionCountdown")) { element.innerHTML = Math.floor(ct) };
                setTimeout(hostQuestionCountdown, 20)
            }
            hostQuestionCountdown()
        }

        refreshDisplay();
        return
    }
};

connection.onclose = function (event) {
    if (event.wasClean) {
        console.log("Connection closed, code=${event.code} reason=${event.reason}")
    } else {
        alert('Verbindung abgebrochen');
    }
};

connection.onerror = function (error) {
    alert('Verbindungsfehler');
};