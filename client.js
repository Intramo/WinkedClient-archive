console.log("#### ##    ## ######## ########     ###    ##     ##  #######  \n ##  ###   ##    ##    ##     ##   ## ##   ###   ### ##     ## \n ##  ####  ##    ##    ##     ##  ##   ##  #### #### ##     ## \n ##  ## ## ##    ##    ########  ##     ## ## ### ## ##     ## \n ##  ##  ####    ##    ##   ##   ######### ##     ## ##     ## \n ##  ##   ###    ##    ##    ##  ##     ## ##     ## ##     ## \n#### ##    ##    ##    ##     ## ##     ## ##     ##  #######  ")

var gameState = "playerJoin" // playerJoin, waiting, answerNormal, answerTrueFalse, playerCorrect, playerWrong, hostLobby, hostPodium, hostLeaderboard, hostResultsNormal, hostResultsTrueFalse, hostAnswers, hostQuestion
var playerAmount = 0
var answerAmount = 0

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

    console.log(data)

    if (data["packettype"] === "error") {
        alert(data["message"])
        return
    }

    if (data["packettype"] === "lobbyJoin") {
        playerAmount += 1
        for (const element of document.getElementsByClassName("var-playerAmount")) { element.innerHTML = playerAmount };
        document.getElementById("pageHostLobbyPlayerList").innerHTML = document.getElementById("pageHostLobbyPlayerList").innerHTML + "<p>" + data["name"] + "</p>"
        return
    }

    if (data["packettype"] === "addAnswerCount") {
        answerAmount += 1
        for (const element of document.getElementsByClassName("var-answerAmount")) { element.innerHTML = answerAmount };
        if(answerAmount >= playerAmount) next()
        return
    }

    if (data["packettype"] === "gameState") {
        gameState = data["gameState"]

        /*
        var-gameID
        var-playerName
        var-playerAmount
        var-answerAmount
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
        var-media
        */
        
        if (gameState === "hostLobby"){
            for (const element of document.getElementsByClassName("var-gameID")) { element.innerHTML = data["gameid"] };
        }

        if (gameState === "playerAnswerNormal"){
            for (const element of document.getElementsByClassName("var-points")) { element.innerHTML = data["points"] };
            for (const element of document.getElementsByClassName("var-progress")) { element.innerHTML = data["progress"] };
            for (const element of document.getElementsByClassName("var-playerName")) { element.innerHTML = data["name"] };
            document.getElementById("page-playerAnswerNormal-card-a").style.display = data["buttons"]["A"] ? "initial" : "none"
            document.getElementById("page-playerAnswerNormal-card-b").style.display = data["buttons"]["B"] ? "initial" : "none"
            document.getElementById("page-playerAnswerNormal-card-c").style.display = data["buttons"]["C"] ? "initial" : "none"
            document.getElementById("page-playerAnswerNormal-card-d").style.display = data["buttons"]["D"] ? "initial" : "none"
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
            answerAmount = 0
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

        if (gameState === "hostAnswersNormal"){
            for (const element of document.getElementsByClassName("var-media")) { element.innerHTML = data["media"] };
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };
            for (const element of document.getElementsByClassName("var-answerA")) { element.innerHTML = data["answers"]["A"] };
            for (const element of document.getElementsByClassName("var-answerB")) { element.innerHTML = data["answers"]["B"] };
            for (const element of document.getElementsByClassName("var-answerC")) { element.innerHTML = data["answers"]["C"] };
            for (const element of document.getElementsByClassName("var-answerD")) { element.innerHTML = data["answers"]["D"] };
            document.getElementById("page-hostAnswersNormal-card-a").style.display = data["answers"]["A"] == "" ? "initial" : "none"
            document.getElementById("page-hostAnswersNormal-card-b").style.display = data["answers"]["B"] == "" ? "initial" : "none"
            document.getElementById("page-hostAnswersNormal-card-c").style.display = data["answers"]["C"] == "" ? "initial" : "none"
            document.getElementById("page-hostAnswersNormal-card-d").style.display = data["answers"]["D"] == "" ? "initial" : "none"
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

        if (gameState === "hostAnswersTrueFalse"){
            for (const element of document.getElementsByClassName("var-media")) { element.innerHTML = data["media"] };
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };
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

        if (gameState === "hostResultsNormal"){
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };

            if(data["answers"].hasOwnProperty("A")){
                for (const element of document.getElementsByClassName("var-answerA")) { element.innerHTML = data["answers"]["A"]["text"] };
                for (const element of document.getElementsByClassName("var-answerAAmount")) { element.innerHTML = data["answers"]["A"]["amount"] };
                document.getElementById("page-hostResultsNormal-pole-a").style.display = "initial"
            }else{document.getElementById("page-hostResultsNormal-pole-a").style.display = "none"}

            if(data["answers"].hasOwnProperty("B")){
                for (const element of document.getElementsByClassName("var-answerB")) { element.innerHTML = data["answers"]["B"]["text"] };
                for (const element of document.getElementsByClassName("var-answerBAmount")) { element.innerHTML = data["answers"]["B"]["amount"] };
                document.getElementById("page-hostResultsNormal-pole-b").style.display = "initial"
            }else{document.getElementById("page-hostResultsNormal-pole-b").style.display = "none"}

            if(data["answers"].hasOwnProperty("C")){
                for (const element of document.getElementsByClassName("var-answerC")) { element.innerHTML = data["answers"]["C"]["text"] };
                for (const element of document.getElementsByClassName("var-answerCAmount")) { element.innerHTML = data["answers"]["C"]["amount"] };
                document.getElementById("page-hostResultsNormal-pole-c").style.display = "initial"
            }else{document.getElementById("page-hostResultsNormal-pole-c").style.display = "none"}

            if(data["answers"].hasOwnProperty("D")){
                for (const element of document.getElementsByClassName("var-answerD")) { element.innerHTML = data["answers"]["D"]["text"] };
                for (const element of document.getElementsByClassName("var-answerDAmount")) { element.innerHTML = data["answers"]["D"]["amount"] };
                document.getElementById("page-hostResultsNormal-pole-d").style.display = "initial"
            }else{document.getElementById("page-hostResultsNormal-pole-d").style.display = "none"}

            let amountA = data["answers"].hasOwnProperty("A") ? data["answers"]["A"]["amount"] : 0
            let amountB = data["answers"].hasOwnProperty("B") ? data["answers"]["B"]["amount"] : 0
            let amountC = data["answers"].hasOwnProperty("C") ? data["answers"]["C"]["amount"] : 0
            let amountD = data["answers"].hasOwnProperty("D") ? data["answers"]["D"]["amount"] : 0

            if(data["answers"].hasOwnProperty("A")) { for(const element of document.getElementsByClassName("bar-answerAAmount")) { element.style.width = (amountA / (amountA+amountB+amountC+amountD)) * 89 + "%" } }
            if(data["answers"].hasOwnProperty("B")) { for(const element of document.getElementsByClassName("bar-answerBAmount")) { element.style.width = (amountB / (amountA+amountB+amountC+amountD)) * 89 + "%" } }
            if(data["answers"].hasOwnProperty("C")) { for(const element of document.getElementsByClassName("bar-answerCAmount")) { element.style.width = (amountC / (amountA+amountB+amountC+amountD)) * 89 + "%" } }
            if(data["answers"].hasOwnProperty("D")) { for(const element of document.getElementsByClassName("bar-answerDAmount")) { element.style.width = (amountD / (amountA+amountB+amountC+amountD)) * 89 + "%" } }
        }


        if (gameState === "hostResultsTrueFalse"){
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };
            for (const element of document.getElementsByClassName("var-answerAAmount")) { element.innerHTML = data["trueAmount"]};
            for (const element of document.getElementsByClassName("var-answerBAmount")) { element.innerHTML = data["falseAmount"]};
            for (const element of document.getElementsByClassName("bar-answerAAmount")) { element.style.width = (data["trueAmount"] / (data["trueAmount"] + data["trueAmount"])) * 89 + "%" };
            for (const element of document.getElementsByClassName("bar-answerBAmount")) { element.style.width = (data["falseAmount"] / (data["trueAmount"] + data["trueAmount"])) * 89 + "%" };            
        }

        refreshDisplay();
    }
}