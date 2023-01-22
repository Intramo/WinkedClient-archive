console.log(` __          ___       _    ______    _ \n \\ \\        / (_)     | |  |  ____|  | |\n  \\ \\  /\\  / / _ _ __ | | _| |__   __| |\n   \\ \\/  \\/ / | | '_ \\| |/ /  __| / _\` |\n    \\  /\\  /  | | | | |   <| |___| (_| |\n     \\/  \\/   |_|_| |_|_|\\_\\______\\__,_|`)

var gameState = "playerJoin"; refreshDisplay();
var playerAmount = 0;
var answerAmount = 0;

var countdownStart = 0;
var countdownDuration = 10000;

var audioTrack1 = null;
var audioTrack1Positions = [47, 73, 98, 128, 140];
var audioDownloadProgress = 0;
var soundEffects = null;

var hostFileContent = "";

var selectedA = false;
var selectedB = false;
var selectedC = false;
var selectedD = false;

var locationParamID = findGetParameter("id");
var locationParamName = findGetParameter("name");

function pushErrorMessage(text){
    let element =  document.createElement("div");
    element.classList.add("error")
    element.appendChild(document.createTextNode(text));
    document.querySelector("errors").insertAdjacentElement("afterbegin", element)
    setTimeout(() => {
        element.remove()
    }, 5000);
}

function onSelect(btn) {
    if (btn === "A") {
        selectedA = !selectedA;
        if (selectedA) {
            document.getElementById("page-playerAnswerSelect-card-a").classList.remove("unselected");
        } else {
            document.getElementById("page-playerAnswerSelect-card-a").classList.add("unselected");
        }
    }
    if (btn === "B") {
        selectedB = !selectedB;
        if (selectedB) {
            document.getElementById("page-playerAnswerSelect-card-b").classList.remove("unselected");
        } else {
            document.getElementById("page-playerAnswerSelect-card-b").classList.add("unselected");
        }
    }
    if (btn === "C") {
        selectedC = !selectedC;
        if (selectedC) {
            document.getElementById("page-playerAnswerSelect-card-c").classList.remove("unselected");
        } else {
            document.getElementById("page-playerAnswerSelect-card-c").classList.add("unselected");
        }
    }
    if (btn === "D") {
        selectedD = !selectedD;
        if (selectedD) {
            document.getElementById("page-playerAnswerSelect-card-d").classList.remove("unselected");
        } else {
            document.getElementById("page-playerAnswerSelect-card-d").classList.add("unselected");
        }
    }
}

function onSubmitSend() {
    gameState = "waiting";
    refreshDisplay();
    connection.send(JSON.stringify({
        "packettype": "answer",
        "buttons": {
            "A": selectedA,
            "B": selectedB,
            "C": selectedC,
            "D": selectedD
        }
    }));
}

Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}

function startCountDownByWordLength(length) {
    startCountdown(length * (1000 / 22));
}

function startCountdown(length) {
    countdownStart = Date.now();
    countdownDuration = length;
}

function getCountdown() {
    if (Date.now() - countdownStart > countdownDuration) { return 0; }
    return (countdownDuration + (countdownStart - Date.now())) / 1000;
}

function onButtonPress(btn) { // A, B, C, D, Y, N
    gameState = "waiting";
    refreshDisplay();
    connection.send(JSON.stringify({ "packettype": "answer", "button": btn }));
}

function onTextSend() {
    gameState = "waiting";
    refreshDisplay();
    connection.send(JSON.stringify({ "packettype": "answer", "text": document.getElementById("page-playerAnswerText-text").value }));
}

function next() {
    countdownStart = 2147483645 * 1000;
    connection.send(JSON.stringify({ "packettype": "next" }));
}

function onLogin() {
    document.querySelector("errors").innerHTML = ''

    let pin = document.getElementById('pagePlayerJoin-join-id').value.trim().replaceAll(" ", "").replaceAll("-", "");
    let name = document.getElementById('pagePlayerJoin-join-name').value.trim();

    let wrong = false

    document.getElementById("pagePlayerJoin-join-name").classList.remove("wrong")
    document.getElementById("pagePlayerJoin-join-name").offsetHeight
    if (name === "") {
        pushErrorMessage(getText("error.name.none"));
        document.getElementById("pagePlayerJoin-join-name").classList.add("wrong")
        wrong = true
    }else if (name.length < 3) {
        pushErrorMessage(getText("error.name.tooshort"));
        document.getElementById("pagePlayerJoin-join-name").classList.add("wrong")
        wrong = true
    }else if (name.length > 16) {
        pushErrorMessage(getText("error.name.toolong"));
        document.getElementById("pagePlayerJoin-join-name").classList.add("wrong")
        wrong = true
    }

    document.getElementById("pagePlayerJoin-join-id").classList.remove("wrong")
    document.getElementById("pagePlayerJoin-join-id").offsetHeight
    if (pin === "") {
        pushErrorMessage(getText("error.id.none"));
        document.getElementById("pagePlayerJoin-join-id").classList.add("wrong")
        wrong = true
    }else if (pin.length < 7) {
        pushErrorMessage(getText("error.id.tooshort"));
        document.getElementById("pagePlayerJoin-join-id").classList.add("wrong")
        wrong = true
    }else if (pin.length > 7) {
        pushErrorMessage(getText("error.id.toolong"));
        document.getElementById("pagePlayerJoin-join-id").classList.add("wrong")
        wrong = true
    }

    if(!wrong) connection.send(JSON.stringify({ "packettype": "joinRequest", "session": pin, "name": name }))
}

document.getElementById("page-host-file").addEventListener('change', (event) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        hostFileContent = ev.target.result;
    };
    reader.readAsText(event.target.files[0]);
}, false);

function onHost() {
    connection.send(JSON.stringify({
        "packettype": "hostRequest",
        "quiz": hostFileContent,
        "randomizeAnswers": document.getElementById("page-host-randomizeAnswers").checked,
        "randomizeQuestions": document.getElementById("page-host-randomizeQuestions").checked
    }));
}

function refreshDisplay() {
    for (const element of document.getElementsByClassName("page")) {
        element.style.display = "none";
    }
    document.getElementById("page" + gameState.charAt(0).toUpperCase() + gameState.slice(1)).style.display = "block";
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

var connection = new WebSocket("wss://server.winked.app:4348/");

connection.onopen = function (e) {
    console.log("Verbindung zu den Servern hergestellt")

    if (locationParamID != null && locationParamName != null) {
        connection.send(JSON.stringify({ "packettype": "joinRequest", "session": locationParamID, "name": locationParamName }))
    }
};

connection.onclose = function (event) {
    console.error('Verbindung geschlossen')
    alert('Verbindung geschlossen');
};

connection.onerror = function (error) {
    console.error('Verbindungsfehler')
    alert('Verbindungsfehler');
};

function addSound(path) {
    let audio = new Audio(path)
    audio.addEventListener('canplaythrough', () => {
        audioDownloadProgress += 1
        console.log("+ Loaded audio " + audioDownloadProgress + "/7")
    }, false);
    return audio
}

var preloadedImages = [];
function preloadImage(list) {
    for (var i = 0; i < list.length; i++) {
        preloadedImages[i] = new Image();
        preloadedImages[i].src = list[i];
    }
}

connection.onmessage = function (event) {
    let data = JSON.parse(event.data)

    console.log(data)

    if (data["packettype"] === "error") {
        document.querySelector("errors").innerHTML = ''

        if(data["key"].startsWith("error.name")){
            document.getElementById("pagePlayerJoin-join-name").classList.remove("wrong")
            document.getElementById("pagePlayerJoin-join-name").offsetHeight
            document.getElementById("pagePlayerJoin-join-name").classList.add("wrong")
            pushErrorMessage(getText(data["key"]));
        }

        if(data["key"].startsWith("error.id")){
            document.getElementById("pagePlayerJoin-join-id").classList.remove("wrong")
            document.getElementById("pagePlayerJoin-join-id").offsetHeight
            document.getElementById("pagePlayerJoin-join-id").classList.add("wrong")
            pushErrorMessage(getText(data["key"]));
        }
        return
    }

    if (data["packettype"] === "lobbyJoin") {
        playerAmount += 1
        for (const element of document.getElementsByClassName("var-playerAmount")) { element.innerHTML = playerAmount };
        document.getElementById("pageHostLobby-lobby").innerHTML = document.getElementById("pageHostLobby-lobby").innerHTML + "<div class=\"pageHostLobby-lobby-div\"><div class=\"name\">" + data["name"] + "</div></div>"
        return
    }

    if (data["packettype"] === "addAnswerCount") {
        answerAmount += 1
        for (const element of document.getElementsByClassName("var-answerAmount")) { element.innerHTML = answerAmount };
        if (answerAmount >= playerAmount) next()
        return
    }

    if (data["packettype"] === "gameState") {
        gameState = data["gameState"]
        for (const element of document.getElementsByClassName("var-media-hostAnswersNormal")) { element.innerHTML = "" };
        for (const element of document.getElementsByClassName("var-media-hostAnswersTrueFalse")) { element.innerHTML = "" };

        if (gameState === "hostLobby") {
            for (const element of document.getElementsByClassName("var-gameID")) { element.innerHTML = data["gameid"].slice(0, 3) + " " + data["gameid"].slice(3) };

            var qrcode = new QRCode("pageHostLobby-qrcode", {
                text: "http://play.winked.app?id=" + data["gameid"],
                width: 256,
                height: 256,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });

            audioTrack1 = addSound("assets/Sam Day & wes mills - Running Away [NCS Release].mp3")
            soundEffects = {
                "podium": {
                    "3": addSound([
                        "https://cdn.discordapp.com/attachments/1059075995535163403/1059076126951100447/fail.mp3"//, // Spongebob Fail
                        //"https://cdn.discordapp.com/attachments/1059075995535163403/1059076126074474516/doyouspeakgermany.mp3", // Do you speak germany?
                        //"https://cdn.discordapp.com/attachments/1059075995535163403/1059076126619742208/emotionaldamage.mp3" // Emotional damage
                    ].random()),
                    "2": addSound([
                        "https://cdn.discordapp.com/attachments/1059075995535163403/1059076102108229702/wow.mp3", // Wow
                        "https://cdn.discordapp.com/attachments/1059075995535163403/1059076101776887898/sad.mp3", // Sad
                        "https://cdn.discordapp.com/attachments/1059075995535163403/1059076101462302770/credits.mp3" // Directed by Robert D.
                    ].random()),
                    "1": addSound([
                        "https://cdn.discordapp.com/attachments/1059075995535163403/1059076055723409408/outro.mp3", // Outro song
                        "https://cdn.discordapp.com/attachments/1059075995535163403/1059076055991857222/walking.mp3" // Wide
                    ].random())
                },
                "nextQuestion": [
                    addSound("https://cdn.discordapp.com/attachments/1059075995535163403/1059077748913623040/aktex.mp3"), // Mysterious
                    addSound("https://cdn.discordapp.com/attachments/1059075995535163403/1059077748569681960/windowsshutdown.mp3"), // Windows XP Shutdown
                    addSound("https://cdn.discordapp.com/attachments/1059075995535163403/1059077748255113256/windowsxperror.mp3") // Windows XP Error
                ]
            }
            preloadImage(data["preload"]["images"])
        }

        if (gameState === "playerAnswerNormal") {
            for (const element of document.getElementsByClassName("var-points")) { element.innerHTML = data["points"] };
            for (const element of document.getElementsByClassName("var-progress")) { element.innerHTML = data["progress"] };
            for (const element of document.getElementsByClassName("var-playerName")) { element.innerHTML = data["name"] };
            document.getElementById("page-playerAnswerNormal-card-a").style.display = data["buttons"]["A"] ? "initial" : "none"
            document.getElementById("page-playerAnswerNormal-card-b").style.display = data["buttons"]["B"] ? "initial" : "none"
            document.getElementById("page-playerAnswerNormal-card-c").style.display = data["buttons"]["C"] ? "initial" : "none"
            document.getElementById("page-playerAnswerNormal-card-d").style.display = data["buttons"]["D"] ? "initial" : "none"
        }

        if (gameState === "playerAnswerSelect") {
            for (const element of document.getElementsByClassName("var-points")) { element.innerHTML = data["points"] };
            for (const element of document.getElementsByClassName("var-progress")) { element.innerHTML = data["progress"] };
            for (const element of document.getElementsByClassName("var-playerName")) { element.innerHTML = data["name"] };
            document.getElementById("page-playerAnswerSelect-card-a").style.display = data["buttons"]["A"] ? "initial" : "none"
            document.getElementById("page-playerAnswerSelect-card-b").style.display = data["buttons"]["B"] ? "initial" : "none"
            document.getElementById("page-playerAnswerSelect-card-c").style.display = data["buttons"]["C"] ? "initial" : "none"
            document.getElementById("page-playerAnswerSelect-card-d").style.display = data["buttons"]["D"] ? "initial" : "none"
            selectedA = false;
            selectedB = false;
            selectedC = false;
            selectedD = false;
            document.getElementById("page-playerAnswerSelect-card-a").classList.add("unselected")
            document.getElementById("page-playerAnswerSelect-card-b").classList.add("unselected")
            document.getElementById("page-playerAnswerSelect-card-c").classList.add("unselected")
            document.getElementById("page-playerAnswerSelect-card-d").classList.add("unselected")
        }

        if (gameState === "playerAnswerTrueFalse") {
            for (const element of document.getElementsByClassName("var-points")) { element.innerHTML = data["points"] };
            for (const element of document.getElementsByClassName("var-progress")) { element.innerHTML = data["progress"] };
            for (const element of document.getElementsByClassName("var-playerName")) { element.innerHTML = data["name"] };
        }

        if (gameState === "playerAnswerText") {
            document.getElementById("page-playerAnswerText-text").value = "";
            for (const element of document.getElementsByClassName("var-points")) { element.innerHTML = data["points"] };
            for (const element of document.getElementsByClassName("var-progress")) { element.innerHTML = data["progress"] };
            for (const element of document.getElementsByClassName("var-playerName")) { element.innerHTML = data["name"] };
        }

        if (gameState === "playerResultCorrect") {
            for (const element of document.getElementsByClassName("var-points")) { element.innerHTML = data["points"] };
            for (const element of document.getElementsByClassName("var-answerstreak")) { element.innerHTML = data["answerstreak"] };
        }

        if (gameState === "playerResultCorrectSelect") {
            for (const element of document.getElementsByClassName("var-correctamount")) { element.innerHTML = data["correctamount"] };
            for (const element of document.getElementsByClassName("var-points")) { element.innerHTML = data["points"] };
            for (const element of document.getElementsByClassName("var-answerstreak")) { element.innerHTML = data["answerstreak"] };
        }

        if (gameState === "hostQuestion") {
            document.querySelector("#pageHostQuestion .content").classList.remove("animation")
            document.querySelector("#pageHostQuestion .content").offsetHeight
            document.querySelector("#pageHostQuestion .content").classList.add("animation")

            answerAmount = 0
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };
            for (const element of document.getElementsByClassName("var-progress")) { element.innerHTML = data["progress"] };
            document.getElementById("pageHostQuestion-progress").style.width = "0%"
            document.querySelector("#pageHostQuestion .content>.type").innerHTML = getText("questionType." + data["type"])
            setTimeout(() => {
                startCountDownByWordLength(data["question"].length)
                function hostQuestionCountdown() {
                    let ct = getCountdown()
                    if (ct <= 0) {
                        next()
                        return
                    }
                    let percent = 100 - 100 * (ct / (countdownDuration / 1000))
                    document.getElementById("pageHostQuestion-progress").style.width = percent + "%"
                    setTimeout(hostQuestionCountdown, 15)
                }
                hostQuestionCountdown()
            }, 2000);
        }

        if (gameState.startsWith("hostAnswers") && !data["media"].includes("iframe")) {
            audioTrack1.currentTime = audioTrack1Positions.random()
            audioTrack1.play()
        }

        if (gameState === "hostAnswersNormal") {
            for (const element of document.getElementsByClassName("var-answerAmount")) { element.innerHTML = answerAmount };
            for (const element of document.getElementsByClassName("var-media-hostAnswersNormal")) { element.innerHTML = data["media"] };
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };
            for (const element of document.getElementsByClassName("var-answerA")) { element.innerHTML = data["answers"]["A"] };
            for (const element of document.getElementsByClassName("var-answerB")) { element.innerHTML = data["answers"]["B"] };
            for (const element of document.getElementsByClassName("var-answerC")) { element.innerHTML = data["answers"]["C"] };
            for (const element of document.getElementsByClassName("var-answerD")) { element.innerHTML = data["answers"]["D"] };
            document.getElementById("page-hostAnswersNormal-card-a").style.display = data["answers"]["A"] !== "" ? "initial" : "none"
            document.getElementById("page-hostAnswersNormal-card-b").style.display = data["answers"]["B"] !== "" ? "initial" : "none"
            document.getElementById("page-hostAnswersNormal-card-c").style.display = data["answers"]["C"] !== "" ? "initial" : "none"
            document.getElementById("page-hostAnswersNormal-card-d").style.display = data["answers"]["D"] !== "" ? "initial" : "none"
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

        if (gameState === "hostAnswersTrueFalse") {
            for (const element of document.getElementsByClassName("var-answerAmount")) { element.innerHTML = answerAmount };
            for (const element of document.getElementsByClassName("var-media-hostAnswersTrueFalse")) { element.innerHTML = data["media"] };
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

        if (gameState === "hostAnswersText") {
            for (const element of document.getElementsByClassName("var-answerAmount")) { element.innerHTML = answerAmount };
            for (const element of document.getElementsByClassName("var-media-hostAnswersText")) { element.innerHTML = data["media"] };
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

        if (gameState.startsWith("hostResults")) {
            audioTrack1.pause()
            soundEffects["nextQuestion"].random().play()
        }

        if (gameState === "hostResultsNormal") {
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };
            let amountPoles = (data["answers"].hasOwnProperty("A") ? 1 : 0) + (data["answers"].hasOwnProperty("B") ? 1 : 0) + (data["answers"].hasOwnProperty("C") ? 1 : 0) + (data["answers"].hasOwnProperty("D") ? 1 : 0)
            let height = Math.floor((1 / amountPoles) * 100) + "%"
            if (data["answers"].hasOwnProperty("A")) document.getElementById("page-hostResultsNormal-pole-a").style.height = height
            if (data["answers"].hasOwnProperty("B")) document.getElementById("page-hostResultsNormal-pole-b").style.height = height
            if (data["answers"].hasOwnProperty("C")) document.getElementById("page-hostResultsNormal-pole-c").style.height = height
            if (data["answers"].hasOwnProperty("D")) document.getElementById("page-hostResultsNormal-pole-d").style.height = height
            if (data["answers"].hasOwnProperty("A")) {
                for (const element of document.getElementsByClassName("var-answerA")) { element.innerHTML = data["answers"]["A"]["text"] };
                for (const element of document.getElementsByClassName("var-answerAAmount")) { element.innerHTML = data["answers"]["A"]["amount"] };
                document.getElementById("page-hostResultsNormal-card-a").style.display = "block"
                document.getElementById("page-hostResultsNormal-pole-a").style.display = "block"
                document.getElementById("page-hostResultsNormal-status-a").innerHTML = data["answers"]["A"]["correct"] ? "<img src=\"assets/indicatorCorrect.svg\">" : "<img src=\"assets/indicatorWrong.svg\">"
            } else {
                document.getElementById("page-hostResultsNormal-card-a").style.display = "none"
                document.getElementById("page-hostResultsNormal-pole-a").style.display = "none"
            }
            if (data["answers"].hasOwnProperty("B")) {
                for (const element of document.getElementsByClassName("var-answerB")) { element.innerHTML = data["answers"]["B"]["text"] };
                for (const element of document.getElementsByClassName("var-answerBAmount")) { element.innerHTML = data["answers"]["B"]["amount"] };
                document.getElementById("page-hostResultsNormal-card-b").style.display = "block"
                document.getElementById("page-hostResultsNormal-pole-b").style.display = "block"
                document.getElementById("page-hostResultsNormal-status-b").innerHTML = data["answers"]["B"]["correct"] ? "<img src=\"assets/indicatorCorrect.svg\">" : "<img src=\"assets/indicatorWrong.svg\">"
            } else {
                document.getElementById("page-hostResultsNormal-card-b").style.display = "none"
                document.getElementById("page-hostResultsNormal-pole-b").style.display = "none"
            }
            if (data["answers"].hasOwnProperty("C")) {
                for (const element of document.getElementsByClassName("var-answerC")) { element.innerHTML = data["answers"]["C"]["text"] };
                for (const element of document.getElementsByClassName("var-answerCAmount")) { element.innerHTML = data["answers"]["C"]["amount"] };
                document.getElementById("page-hostResultsNormal-card-c").style.display = "block"
                document.getElementById("page-hostResultsNormal-pole-c").style.display = "block"
                document.getElementById("page-hostResultsNormal-status-c").innerHTML = data["answers"]["C"]["correct"] ? "<img src=\"assets/indicatorCorrect.svg\">" : "<img src=\"assets/indicatorWrong.svg\">"
            } else {
                document.getElementById("page-hostResultsNormal-card-c").style.display = "none"
                document.getElementById("page-hostResultsNormal-pole-c").style.display = "none"
            }
            if (data["answers"].hasOwnProperty("D")) {
                for (const element of document.getElementsByClassName("var-answerD")) { element.innerHTML = data["answers"]["D"]["text"] };
                for (const element of document.getElementsByClassName("var-answerDAmount")) { element.innerHTML = data["answers"]["D"]["amount"] };
                document.getElementById("page-hostResultsNormal-card-d").style.display = "block"
                document.getElementById("page-hostResultsNormal-pole-d").style.display = "block"
                document.getElementById("page-hostResultsNormal-status-d").innerHTML = data["answers"]["D"]["correct"] ? "<img src=\"assets/indicatorCorrect.svg\">" : "<img src=\"assets/indicatorWrong.svg\">"
            } else {
                document.getElementById("page-hostResultsNormal-card-d").style.display = "none"
                document.getElementById("page-hostResultsNormal-pole-d").style.display = "none"
            }
            let amountA = data["answers"].hasOwnProperty("A") ? data["answers"]["A"]["amount"] : 0
            let amountB = data["answers"].hasOwnProperty("B") ? data["answers"]["B"]["amount"] : 0
            let amountC = data["answers"].hasOwnProperty("C") ? data["answers"]["C"]["amount"] : 0
            let amountD = data["answers"].hasOwnProperty("D") ? data["answers"]["D"]["amount"] : 0
            if (data["answers"].hasOwnProperty("A")) { for (const element of document.getElementsByClassName("bar-answerAAmount")) { element.style.width = (amountA / (amountA + amountB + amountC + amountD)) * 90 + "%" } }
            if (data["answers"].hasOwnProperty("B")) { for (const element of document.getElementsByClassName("bar-answerBAmount")) { element.style.width = (amountB / (amountA + amountB + amountC + amountD)) * 90 + "%" } }
            if (data["answers"].hasOwnProperty("C")) { for (const element of document.getElementsByClassName("bar-answerCAmount")) { element.style.width = (amountC / (amountA + amountB + amountC + amountD)) * 90 + "%" } }
            if (data["answers"].hasOwnProperty("D")) { for (const element of document.getElementsByClassName("bar-answerDAmount")) { element.style.width = (amountD / (amountA + amountB + amountC + amountD)) * 90 + "%" } }
        }

        if (gameState === "hostResultsTrueFalse") {
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };
            for (const element of document.getElementsByClassName("var-answerYAmount")) { element.innerHTML = data["trueAmount"] };
            for (const element of document.getElementsByClassName("var-answerNAmount")) { element.innerHTML = data["falseAmount"] };
            for (const element of document.getElementsByClassName("bar-answerYAmount")) { element.style.width = (data["trueAmount"] / (data["trueAmount"] + data["falseAmount"])) * 90 + "%" };
            for (const element of document.getElementsByClassName("bar-answerNAmount")) { element.style.width = (data["falseAmount"] / (data["trueAmount"] + data["falseAmount"])) * 90 + "%" };
            document.getElementById("page-hostResultsTrueFalse-status-y").innerHTML = data["isRight"] ? "<img src=\"assets/indicatorCorrect.svg\">" : "<img src=\"assets/indicatorWrong.svg\">"
            document.getElementById("page-hostResultsTrueFalse-status-n").innerHTML = !data["isRight"] ? "<img src=\"assets/indicatorCorrect.svg\">" : "<img src=\"assets/indicatorWrong.svg\">"
        }

        if (gameState === "hostResultsText") {
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };
            for (const element of data["correct"]) { document.getElementById("page-hostResultsText-correct").innerHTML += "<p>" + element + "</p>" }
            document.getElementById("page-hostResultsText-wrongHeading").style.display = data["wrong"].length == 0 ? "none" : "block"
            for (const element of data["wrong"]) { document.getElementById("page-hostResultsText-wrong").innerHTML += "<p>" + element + "</p>" }
        }

        if (gameState === "hostPodium") {
            for (const element of document.getElementsByClassName("var-p1name")) { element.innerHTML = data["p1name"] };
            for (const element of document.getElementsByClassName("var-p1points")) { element.innerHTML = data["p1points"] };
            for (const element of document.getElementsByClassName("var-p2name")) { element.innerHTML = data["p2name"] };
            for (const element of document.getElementsByClassName("var-p2points")) { element.innerHTML = data["p2points"] };
            for (const element of document.getElementsByClassName("var-p3name")) { element.innerHTML = data["p3name"] };
            for (const element of document.getElementsByClassName("var-p3points")) { element.innerHTML = data["p3points"] };
            setTimeout(() => {
                document.getElementById("page-hostPodium-wrapper").style.right = "0vw"
                setTimeout(() => { document.getElementById("medalContainer3").classList.add("shown"); soundEffects["podium"]["3"].play() }, 1 * 1000)
            }, 0)
            setTimeout(() => {
                document.getElementById("page-hostPodium-wrapper").style.right = "-100vw"
                setTimeout(() => { document.getElementById("medalContainer2").classList.add("shown"); soundEffects["podium"]["2"].play() }, 1 * 1000)
            }, 6 * 1000)
            setTimeout(() => {
                document.getElementById("page-hostPodium-wrapper").style.right = "-200vw"
                setTimeout(() => { document.getElementById("medalContainer1").classList.add("shown"); soundEffects["podium"]["1"].play() }, 1 * 1000)
            }, 12 * 1000)
        }

        refreshDisplay();
    }
}