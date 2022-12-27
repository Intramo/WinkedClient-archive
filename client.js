console.log("#### ##    ## ######## ########     ###    ##     ##  #######  \n##  ###   ##    ##    ##     ##   ## ##   ###   ### ##     ## \n##  ####  ##    ##    ##     ##  ##   ##  #### #### ##     ## \n##  ## ## ##    ##    ########  ##     ## ## ### ## ##     ## \n##  ##  ####    ##    ##   ##   ######### ##     ## ##     ## \n##  ##   ###    ##    ##    ##  ##     ## ##     ## ##     ## \n#### ##    ##    ##    ##     ## ##     ## ##     ##  #######  ")

var gameState = "playerJoin" // playerJoin, waiting, answerNormal, answerTrueFalse, playerCorrect, playerWrong, hostLobby, hostPodium, hostLeaderboard, hostResultsNormal, hostResultsTrueFalse, hostAnswers, hostQuestion
var playerAmount = 0

var countdownStart = 0
var countdownDuration = 10000

refreshDisplay();

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
    connection.send(JSON.stringify({ "packettype": "answer", "button": btn }))
}

function next() {
    countdownStart = 2147483645 * 1000
    connection.send(JSON.stringify({ "packettype": "next" }))
}

function onLogin() {
    let pin = document.getElementById('page-playerJoin-id').value.trim();
    let name = document.getElementById('page-playerJoin-name').value.trim();

    if(pin === ""){
        alert("Das Feld für die Spiel-ID ist leer")
        return
    }

    if(name === ""){
        alert("Das Feld für deinen Namen ist leer")
        return
    }

    if(name.length < 3){
        alert("Dein Name muss mindestens 3 Zeichen haben")
        return
    }

    connection.send(JSON.stringify({ "packettype": "joinRequest", "session": pin, "name": name }))
}

function refreshDisplay() {
    for (const element of document.getElementsByClassName("page")) {
        element.style.display = "none";
    }
    document.getElementById("page-" + gameState).style.display = "block";
}

var connection = new WebSocket("ws://localhost:4348/");

connection.onopen = function (e) {
    console.log("Verbindung zu den Servern hergestellt")
};

connection.onclose = function (event) {
    alert('Verbindung abgebrochen');
};

connection.onerror = function (error) {
    alert('Verbindungsfehler');
};

connection.onmessage = function (event) {
    let data = JSON.parse(event.data)

    if (data["packettype"] === "error") {
        alert(data["message"])
        return
    }

    if (data["packettype"] === "lobbyJoin") {
        playerAmount += 1
        document.getElementById("pageHostLobbyPlayerList").innerHTML = document.getElementById("pageHostLobbyPlayerList").innerHTML + "<p>" + data["name"] + "</p>"
        return
    }

    if (data["packettype"] === "addAnswerCount") {
        //TODO
        return
    }

    if (data["packettype"] === "gamestate") {
        gameState = data["gameState"]

        /*
        var-gameID
        var-playerName
        var-playerAmount
        var-points
        var-progress
        var-answerstreak
        var-question
        var-answerA
        var-answerB
        var-answerC
        var-answerD
        var-answerAAmount
        var-answerBAmount
        var-answerCAmount
        var-answerDAmount
        var-answerCount
        var-hostQuestionCountdown
        */
        
        if (gameState === "hostLobby"){
            for (const element of document.getElementsByClassName("var-gameID")) { element.innerHTML = data["gameid"] };
        }

        if (gameState === "playerAnswerNormal"){
            for (const element of document.getElementsByClassName("var-points")) { element.innerHTML = data["points"] };
            for (const element of document.getElementsByClassName("var-progress")) { element.innerHTML = data["progress"] };
            for (const element of document.getElementsByClassName("var-playerName")) { element.innerHTML = data["name"] };
            if(data["buttons"]["A"] === true) {} //TODO: Implement hiding buttons
            if(data["buttons"]["B"] === true) {} //TODO: Implement hiding buttons
            if(data["buttons"]["C"] === true) {} //TODO: Implement hiding buttons
            if(data["buttons"]["D"] === true) {} //TODO: Implement hiding buttons
        }

        if (gameState === "playerAnswerTrueFalse"){
            for (const element of document.getElementsByClassName("var-points")) { element.innerHTML = data["points"] };
            for (const element of document.getElementsByClassName("var-progress")) { element.innerHTML = data["progress"] };
            for (const element of document.getElementsByClassName("var-playerName")) { element.innerHTML = data["name"] };
        }

        if (gameState === "playerResultCorrect"){
            for (const element of document.getElementsByClassName("var-answerstreak")) { element.innerHTML = data["answerstreak"] };
        }

        if (gameState === "hostQuestion"){
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };
            startCountdown(5 * 1000)
            function hostQuestionCountdown() {
                let ct = getCountdown()
                if (ct <= 0) {
                    next()
                    return
                }
                let percent = 100 - 100 * (ct / (countdownDuration / 1000))
                document.getElementById("hostQuestionProgress").style.width = percent + "%"
                setTimeout(hostQuestionCountdown, 15)
            }
            hostQuestionCountdown()
        }

        if (gameState === "hostAnswers"){
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };
            for (const element of document.getElementsByClassName("var-answerA")) { element.innerHTML = data["answers"]["A"] };
            for (const element of document.getElementsByClassName("var-answerB")) { element.innerHTML = data["answers"]["B"] };
            for (const element of document.getElementsByClassName("var-answerC")) { element.innerHTML = data["answers"]["C"] };
            for (const element of document.getElementsByClassName("var-answerD")) { element.innerHTML = data["answers"]["D"] };
            startCountdown(data["duration"] * 1000)
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

        if (gameState === "hostResults"){
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };
            for (const element of document.getElementsByClassName("var-answerA")) { element.innerHTML = data["answers"]["A"]["text"] };
            for (const element of document.getElementsByClassName("var-answerB")) { element.innerHTML = data["answers"]["B"]["text"] };
            for (const element of document.getElementsByClassName("var-answerC")) { element.innerHTML = data["answers"]["C"]["text"] };
            for (const element of document.getElementsByClassName("var-answerD")) { element.innerHTML = data["answers"]["D"]["text"] };
            for (const element of document.getElementsByClassName("var-answerAAmount")) { element.innerHTML = data["answers"]["A"]["amount"] };
            for (const element of document.getElementsByClassName("var-answerBAmount")) { element.innerHTML = data["answers"]["B"]["amount"] };
            for (const element of document.getElementsByClassName("var-answerCAmount")) { element.innerHTML = data["answers"]["C"]["amount"] };
            for (const element of document.getElementsByClassName("var-answerDAmount")) { element.innerHTML = data["answers"]["D"]["amount"] };
            //TODO: Correct
        }

        refreshDisplay();
    }
}