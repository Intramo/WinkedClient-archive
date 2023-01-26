console.log(` __          ___       _    ______    _ \n \\ \\        / (_)     | |  |  ____|  | |\n  \\ \\  /\\  / / _ _ __ | | _| |__   __| |\n   \\ \\/  \\/ / | | '_ \\| |/ /  __| / _\` |\n    \\  /\\  /  | | | | |   <| |___| (_| |\n     \\/  \\/   |_|_| |_|_|\\_\\______\\__,_|`)

var gameState = "playerJoin"; refreshDisplay();
var playerAmount = 0;
var answerAmount = 0;

var countdownStart = 0;
var countdownDuration = 10000;

var audioTrack1 = null;
var audioTrack1Positions = null;
var audioDownloadProgress = 0;
var soundEffects = null;

var hostFileContent = "";

var selectedA = false;
var selectedB = false;
var selectedC = false;
var selectedD = false;

var locationParamID = findGetParameter("id");
var locationParamName = findGetParameter("name");

var isSessionLocked = false;

var currentAudioPlayback = null

function onSessionLockButton() {
    isSessionLocked = !isSessionLocked
    if (isSessionLocked) {
        document.getElementById("pageHostLobby-start-lock").innerHTML = "<i class= \"fa-solid fa-lock\"></i>"
    } else {
        document.getElementById("pageHostLobby-start-lock").innerHTML = "<i class= \"fa-solid fa-lock-open\"></i>"
    }
}

document.getElementById("pagePlayerJoin-language").addEventListener("click", (event) => {
    let element = document.getElementById("pagePlayerJoin-language-select");
    element.style.display = element.style.display === "block" ? "none" : "block";
})

let elements = document.querySelectorAll(".pagePlayerJoin-language-selection-btn");
for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", (event) => {
        currentLanguage = elements[i].dataset.language;
        applyLanguage();
    });
}

function pushErrorMessage(text) {
    let element = document.createElement("div");
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
            document.getElementById("pagePlayerAnswerSelect-a").classList.remove("unselected");
        } else {
            document.getElementById("pagePlayerAnswerSelect-a").classList.add("unselected");
        }
    }
    if (btn === "B") {
        selectedB = !selectedB;
        if (selectedB) {
            document.getElementById("pagePlayerAnswerSelect-b").classList.remove("unselected");
        } else {
            document.getElementById("pagePlayerAnswerSelect-b").classList.add("unselected");
        }
    }
    if (btn === "C") {
        selectedC = !selectedC;
        if (selectedC) {
            document.getElementById("pagePlayerAnswerSelect-c").classList.remove("unselected");
        } else {
            document.getElementById("pagePlayerAnswerSelect-c").classList.add("unselected");
        }
    }
    if (btn === "D") {
        selectedD = !selectedD;
        if (selectedD) {
            document.getElementById("pagePlayerAnswerSelect-d").classList.remove("unselected");
        } else {
            document.getElementById("pagePlayerAnswerSelect-d").classList.add("unselected");
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

Array.prototype.getLastElement = function () {
    return this[this.length - 1];
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
    connection.send(JSON.stringify({ "packettype": "answer", "text": document.getElementById("pagePlayerAnswerText-text").value }));
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
    } else if (name.length < 3) {
        pushErrorMessage(getText("error.name.tooshort"));
        document.getElementById("pagePlayerJoin-join-name").classList.add("wrong")
        wrong = true
    } else if (name.length > 16) {
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
    } else if (pin.length < 7) {
        pushErrorMessage(getText("error.id.tooshort"));
        document.getElementById("pagePlayerJoin-join-id").classList.add("wrong")
        wrong = true
    } else if (pin.length > 7) {
        pushErrorMessage(getText("error.id.toolong"));
        document.getElementById("pagePlayerJoin-join-id").classList.add("wrong")
        wrong = true
    }

    if (!wrong) connection.send(JSON.stringify({ "packettype": "joinRequest", "session": pin, "name": name }))
}

document.getElementById("hostPopup-file").addEventListener('change', (event) => {
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
        "randomizeAnswers": document.getElementById("hostPopup-randomizeAnswers").checked,
        "randomizeQuestions": document.getElementById("hostPopup-randomizeQuestions").checked
    }));
}

function refreshDisplay() {
    document.getElementById("hostPopup").style.display = "none"
    for (const element of document.getElementsByClassName("page")) {
        element.style.display = "none";
    }
    if (document.getElementById("page" + gameState.charAt(0).toUpperCase() + gameState.slice(1)) != null) document.getElementById("page" + gameState.charAt(0).toUpperCase() + gameState.slice(1)).style.display = "block";
    if (document.getElementById("page-" + gameState) != null) document.getElementById("page-" + gameState).style.display = "block"; /* TODO: LEGACY */
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
    audio.autoplay = true;
    return audio
}

function addSoundPreload(path) {
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

var preloadedAudio = [];
function preloadAudio(list) {
    for (var i = 0; i < list.length; i++) {
        preloadedAudio[i] = new Audio(list[i]);
    }
}

connection.onmessage = function (event) {
    let data = JSON.parse(event.data)

    console.log(data)

    if (data["packettype"] === "error") {
        document.querySelector("errors").innerHTML = ''

        if (data["key"].startsWith("error.name")) {
            document.getElementById("pagePlayerJoin-join-name").classList.remove("wrong")
            document.getElementById("pagePlayerJoin-join-name").offsetHeight
            document.getElementById("pagePlayerJoin-join-name").classList.add("wrong")
            pushErrorMessage(getText(data["key"]));
        }

        if (data["key"].startsWith("error.id")) {
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
        document.querySelectorAll("#pageHostLobby-lobby>.pageHostLobby-lobby-div")[document.querySelectorAll("#pageHostLobby-lobby>.pageHostLobby-lobby-div").length - 1].addEventListener("click", (event) => {
            connection.send(JSON.stringify({
                "packettype": "kickplayer",
                "name": data["name"]
            }));
            document.getElementById("pageHostLobby-lobby").innerHTML = document.getElementById("pageHostLobby-lobby").innerHTML.replace("<div class=\"pageHostLobby-lobby-div\"><div class=\"name\">" + data["name"] + "</div></div>", "")
        })
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
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            audioTrack1Positions = ["track01", "track02", "track03", "track04", "track05"]

            audioTrack1 = new Howl({
                src: ["assets/Sam Day & wes mills - Running Away [NCS Release].mp3"],
                sprite: {
                    track01: [47000, 180000],
                    track02: [73000, 180000],
                    track03: [98000, 180000],
                    track04: [128000, 180000],
                    track05: [140000, 180000]
                }
            })
            soundEffects = {
                "podium": {
                    "3": new Howl({src: [[
                        "https://cdn.discordapp.com/attachments/1059075995535163403/1059076126951100447/fail.mp3"//, // Spongebob Fail
                        //"https://cdn.discordapp.com/attachments/1059075995535163403/1059076126074474516/doyouspeakgermany.mp3", // Do you speak germany?
                        //"https://cdn.discordapp.com/attachments/1059075995535163403/1059076126619742208/emotionaldamage.mp3" // Emotional damage
                    ].random()]}),
                    "2": new Howl({src: [[
                        "https://cdn.discordapp.com/attachments/1059075995535163403/1059076102108229702/wow.mp3", // Wow
                        "https://cdn.discordapp.com/attachments/1059075995535163403/1059076101776887898/sad.mp3", // Sad
                        "https://cdn.discordapp.com/attachments/1059075995535163403/1059076101462302770/credits.mp3" // Directed by Robert D.
                    ].random()]}),
                    "1": new Howl({src: [[
                        "https://cdn.discordapp.com/attachments/1059075995535163403/1059076055723409408/outro.mp3", // Outro song
                        "https://cdn.discordapp.com/attachments/1059075995535163403/1059076055991857222/walking.mp3" // Wide
                    ].random()]})
                },
                "nextQuestion": [
                    new Howl({src: ["https://cdn.discordapp.com/attachments/1059075995535163403/1059077748913623040/aktex.mp3"]}), // Mysterious
                    new Howl({src: ["https://cdn.discordapp.com/attachments/1059075995535163403/1059077748569681960/windowsshutdown.mp3"]}), // Windows XP Shutdown
                    new Howl({src: ["https://cdn.discordapp.com/attachments/1059075995535163403/1059077748255113256/windowsxperror.mp3"]}) // Windows XP Error
                ]
            }

            preloadImage(data["preload"]["images"])
            preloadAudio(data["preload"]["audio"])
        }

        if (gameState === "playerAnswerNormal") {
            for (const element of document.getElementsByClassName("var-points")) { element.innerHTML = data["points"] };
            for (const element of document.getElementsByClassName("var-progress")) { element.innerHTML = data["progress"] };
            for (const element of document.getElementsByClassName("var-playerName")) { element.innerHTML = data["name"] };
            for (const element of document.getElementsByClassName("var-type")) { element.innerHTML = getText("questionType.normal") };
            document.getElementById("pagePlayerAnswerNormal-a").style.display = data["buttons"]["A"] ? "initial" : "none"
            document.getElementById("pagePlayerAnswerNormal-b").style.display = data["buttons"]["B"] ? "initial" : "none"
            document.getElementById("pagePlayerAnswerNormal-c").style.display = data["buttons"]["C"] ? "initial" : "none"
            document.getElementById("pagePlayerAnswerNormal-d").style.display = data["buttons"]["D"] ? "initial" : "none"
        }

        if (gameState === "playerAnswerSelect") {
            for (const element of document.getElementsByClassName("var-points")) { element.innerHTML = data["points"] };
            for (const element of document.getElementsByClassName("var-progress")) { element.innerHTML = data["progress"] };
            for (const element of document.getElementsByClassName("var-playerName")) { element.innerHTML = data["name"] };
            for (const element of document.getElementsByClassName("var-type")) { element.innerHTML = getText("questionType.select") };
            document.getElementById("pagePlayerAnswerSelect-a").style.display = data["buttons"]["A"] ? "initial" : "none"
            document.getElementById("pagePlayerAnswerSelect-b").style.display = data["buttons"]["B"] ? "initial" : "none"
            document.getElementById("pagePlayerAnswerSelect-c").style.display = data["buttons"]["C"] ? "initial" : "none"
            document.getElementById("pagePlayerAnswerSelect-d").style.display = data["buttons"]["D"] ? "initial" : "none"
            selectedA = false;
            selectedB = false;
            selectedC = false;
            selectedD = false;
            document.getElementById("pagePlayerAnswerSelect-a").classList.add("unselected")
            document.getElementById("pagePlayerAnswerSelect-b").classList.add("unselected")
            document.getElementById("pagePlayerAnswerSelect-c").classList.add("unselected")
            document.getElementById("pagePlayerAnswerSelect-d").classList.add("unselected")
        }

        if (gameState === "playerAnswerTrueFalse") {
            for (const element of document.getElementsByClassName("var-points")) { element.innerHTML = data["points"] };
            for (const element of document.getElementsByClassName("var-progress")) { element.innerHTML = data["progress"] };
            for (const element of document.getElementsByClassName("var-playerName")) { element.innerHTML = data["name"] };
            for (const element of document.getElementsByClassName("var-type")) { element.innerHTML = getText("questionType.truefalse") };
        }

        if (gameState === "playerAnswerText") {
            document.getElementById("pagePlayerAnswerText-text").value = "";
            for (const element of document.getElementsByClassName("var-type")) { element.innerHTML = getText("questionType.text") };
            for (const element of document.getElementsByClassName("var-points")) { element.innerHTML = data["points"] };
            for (const element of document.getElementsByClassName("var-progress")) { element.innerHTML = data["progress"] };
            for (const element of document.getElementsByClassName("var-playerName")) { element.innerHTML = data["name"] };
            document.getElementById("pagePlayerAnswerText-text").focus()
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
            for (const element of document.getElementsByClassName("var-type")) { element.innerHTML = getText("questionType." + data["type"]) };

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

        if (gameState.startsWith("hostAnswers") && !data["media"].includes("iframe") && !data["media"].includes("audio")) {
            audioTrack1.play(audioTrack1Positions.random())
        }

        if (gameState.startsWith("hostAnswers") && data["media"].includes("audio=")) {
            currentAudioPlayback = new Howl({src: [data["media"].split("audio=")[1]]})
            currentAudioPlayback.play()
        }

        if (gameState === "hostAnswersNormal") {
            if(data["media"] == "" || data["media"].startsWith("audio=")){
                gameState = "HostAnswersNormal"
            }else{
                gameState = "HostAnswersNormalMedia"
                for (const element of document.getElementsByClassName("var-media-pageHostAnswersNormalMedia")) { element.innerHTML = data["media"] };
            }
            for (const element of document.getElementsByClassName("var-answerAmount")) { element.innerHTML = answerAmount };
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };
            for (const element of document.getElementsByClassName("var-answerA")) { element.innerHTML = data["answers"]["A"] };
            for (const element of document.getElementsByClassName("var-answerB")) { element.innerHTML = data["answers"]["B"] };
            for (const element of document.getElementsByClassName("var-answerC")) { element.innerHTML = data["answers"]["C"] };
            for (const element of document.getElementsByClassName("var-answerD")) { element.innerHTML = data["answers"]["D"] };
            document.getElementById("page"+gameState+"-a").style.display = data["answers"]["A"] !== "" ? "flex" : "none"
            document.getElementById("page"+gameState+"-b").style.display = data["answers"]["B"] !== "" ? "flex" : "none"
            document.getElementById("page"+gameState+"-c").style.display = data["answers"]["C"] !== "" ? "flex" : "none"
            document.getElementById("page"+gameState+"-d").style.display = data["answers"]["D"] !== "" ? "flex" : "none"
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
            if(data["media"] == "" || data["media"].startsWith("audio=")){
                gameState = "HostAnswersTrueFalse"
            }else{
                gameState = "HostAnswersTrueFalseMedia"
                for (const element of document.getElementsByClassName("var-media-pageHostAnswersTrueFalseMedia")) { element.innerHTML = data["media"] };
            }
            for (const element of document.getElementsByClassName("var-answerAmount")) { element.innerHTML = answerAmount };
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
            if(data["media"] == "" || data["media"].startsWith("audio=")){
                gameState = "HostAnswersText"
            }else{
                gameState = "HostAnswersTextMedia"
                for (const element of document.getElementsByClassName("var-media-pageHostAnswersTextMedia")) { element.innerHTML = data["media"] };
            }
            for (const element of document.getElementsByClassName("var-answerAmount")) { element.innerHTML = answerAmount };
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
            for (const element of document.getElementsByClassName("var-media-pageHostAnswersNormalMedia")) { element.innerHTML = "" };
            for (const element of document.getElementsByClassName("var-media-pageHostAnswersTrueFalseMedia")) { element.innerHTML = "" };
            for (const element of document.getElementsByClassName("var-media-pageHostAnswersTextMedia")) { element.innerHTML = "" };
            if(currentAudioPlayback!=null) currentAudioPlayback.stop()
            audioTrack1.stop()
            soundEffects["nextQuestion"].random().play()
        }

        if (gameState === "hostResultsNormal") {
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };
            let amountPoles = (data["answers"].hasOwnProperty("A") ? 1 : 0) + (data["answers"].hasOwnProperty("B") ? 1 : 0) + (data["answers"].hasOwnProperty("C") ? 1 : 0) + (data["answers"].hasOwnProperty("D") ? 1 : 0)
            let height = Math.floor((1 / amountPoles) * 100) + "%"
            if (data["answers"].hasOwnProperty("A")) document.getElementById("pageHostResultsNormal-pole-a").style.height = height
            if (data["answers"].hasOwnProperty("B")) document.getElementById("pageHostResultsNormal-pole-b").style.height = height
            if (data["answers"].hasOwnProperty("C")) document.getElementById("pageHostResultsNormal-pole-c").style.height = height
            if (data["answers"].hasOwnProperty("D")) document.getElementById("pageHostResultsNormal-pole-d").style.height = height
            if (data["answers"].hasOwnProperty("A")) {
                for (const element of document.getElementsByClassName("var-answerA")) { element.innerHTML = data["answers"]["A"]["text"] };
                for (const element of document.getElementsByClassName("var-answerAAmount")) { element.innerHTML = data["answers"]["A"]["amount"] };
                document.getElementById("pageHostResultsNormal-a").style.display = "flex"
                document.getElementById("pageHostResultsNormal-pole-a").style.display = "block"
                document.getElementById("pageHostResultsNormal-status-a").innerHTML = data["answers"]["A"]["correct"] ? "<img src=\"assets/indicatorCorrect.svg\">" : "<img src=\"assets/indicatorWrong.svg\">"
                if(data["answers"]["A"]["correct"]) document.getElementById("pageHostResultsNormal-a").classList.remove("incorrect")
                if(!data["answers"]["A"]["correct"]) document.getElementById("pageHostResultsNormal-a").classList.add("incorrect")
            } else {
                document.getElementById("pageHostResultsNormal-a").style.display = "none"
                document.getElementById("pageHostResultsNormal-pole-a").style.display = "none"
            }
            if (data["answers"].hasOwnProperty("B")) {
                for (const element of document.getElementsByClassName("var-answerB")) { element.innerHTML = data["answers"]["B"]["text"] };
                for (const element of document.getElementsByClassName("var-answerBAmount")) { element.innerHTML = data["answers"]["B"]["amount"] };
                document.getElementById("pageHostResultsNormal-b").style.display = "flex"
                document.getElementById("pageHostResultsNormal-pole-b").style.display = "block"
                document.getElementById("pageHostResultsNormal-status-b").innerHTML = data["answers"]["B"]["correct"] ? "<img src=\"assets/indicatorCorrect.svg\">" : "<img src=\"assets/indicatorWrong.svg\">"
                if(data["answers"]["B"]["correct"]) document.getElementById("pageHostResultsNormal-b").classList.remove("incorrect")
                if(!data["answers"]["B"]["correct"]) document.getElementById("pageHostResultsNormal-b").classList.add("incorrect")
            } else {
                document.getElementById("pageHostResultsNormal-b").style.display = "none"
                document.getElementById("pageHostResultsNormal-pole-b").style.display = "none"
            }
            if (data["answers"].hasOwnProperty("C")) {
                for (const element of document.getElementsByClassName("var-answerC")) { element.innerHTML = data["answers"]["C"]["text"] };
                for (const element of document.getElementsByClassName("var-answerCAmount")) { element.innerHTML = data["answers"]["C"]["amount"] };
                document.getElementById("pageHostResultsNormal-c").style.display = "flex"
                document.getElementById("pageHostResultsNormal-pole-c").style.display = "block"
                document.getElementById("pageHostResultsNormal-status-c").innerHTML = data["answers"]["C"]["correct"] ? "<img src=\"assets/indicatorCorrect.svg\">" : "<img src=\"assets/indicatorWrong.svg\">"
                if(data["answers"]["C"]["correct"]) document.getElementById("pageHostResultsNormal-c").classList.remove("incorrect")
                if(!data["answers"]["C"]["correct"]) document.getElementById("pageHostResultsNormal-c").classList.add("incorrect")
            } else {
                document.getElementById("pageHostResultsNormal-c").style.display = "none"
                document.getElementById("pageHostResultsNormal-pole-c").style.display = "none"
            }
            if (data["answers"].hasOwnProperty("D")) {
                for (const element of document.getElementsByClassName("var-answerD")) { element.innerHTML = data["answers"]["D"]["text"] };
                for (const element of document.getElementsByClassName("var-answerDAmount")) { element.innerHTML = data["answers"]["D"]["amount"] };
                document.getElementById("pageHostResultsNormal-d").style.display = "flex"
                document.getElementById("pageHostResultsNormal-pole-d").style.display = "block"
                document.getElementById("pageHostResultsNormal-status-d").innerHTML = data["answers"]["D"]["correct"] ? "<img src=\"assets/indicatorCorrect.svg\">" : "<img src=\"assets/indicatorWrong.svg\">"
                if(data["answers"]["D"]["correct"]) document.getElementById("pageHostResultsNormal-d").classList.remove("incorrect")
                if(!data["answers"]["D"]["correct"]) document.getElementById("pageHostResultsNormal-d").classList.add("incorrect")
            } else {
                document.getElementById("pageHostResultsNormal-d").style.display = "none"
                document.getElementById("pageHostResultsNormal-pole-d").style.display = "none"
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
            for (const element of document.getElementsByClassName("var-answerBAmount")) { element.innerHTML = data["trueAmount"] };
            for (const element of document.getElementsByClassName("var-answerAAmount")) { element.innerHTML = data["falseAmount"] };
            for (const element of document.getElementsByClassName("bar-answerBAmount")) { element.style.width = (data["trueAmount"] / (data["trueAmount"] + data["falseAmount"])) * 90 + "%" };
            for (const element of document.getElementsByClassName("bar-answerAAmount")) { element.style.width = (data["falseAmount"] / (data["trueAmount"] + data["falseAmount"])) * 90 + "%" };
            document.getElementById("pageHostResultsTrueFalse-status-b").innerHTML = data["isRight"] ? "<img src=\"assets/indicatorCorrect.svg\">" : "<img src=\"assets/indicatorWrong.svg\">"
            document.getElementById("pageHostResultsTrueFalse-status-a").innerHTML = !data["isRight"] ? "<img src=\"assets/indicatorCorrect.svg\">" : "<img src=\"assets/indicatorWrong.svg\">"
            if(!data["isRight"]) document.getElementById("pageHostResultsTrueFalse-a").classList.remove("incorrect")
            if(data["isRight"]) document.getElementById("pageHostResultsTrueFalse-a").classList.add("incorrect")
            if(data["isRight"]) document.getElementById("pageHostResultsTrueFalse-b").classList.remove("incorrect")
            if(!data["isRight"]) document.getElementById("pageHostResultsTrueFalse-b").classList.add("incorrect")
        }

        if (gameState === "hostResultsText") {
            for (const element of document.getElementsByClassName("var-question")) { element.innerHTML = data["question"] };
            document.getElementById("pageHostResultsText-correct").innerHTML = ''
            for (const element of data["correct"]) { document.getElementById("pageHostResultsText-correct").innerHTML += "<div>" + element + "</div>" }
            document.getElementById("pageHostResultsText-wrong-w").style.display = data["wrong"].length == 0 ? "none" : "flex"
            document.getElementById("pageHostResultsText-wrong").innerHTML = ''
            for (const element of data["wrong"]) { document.getElementById("pageHostResultsText-wrong").innerHTML += "<div>" + element + "</div>" }
        }

        if (gameState === "hostPodium") {
            for (const element of document.getElementsByClassName("var-p1name")) { element.innerHTML = data["p1name"] };
            for (const element of document.getElementsByClassName("var-p1points")) { element.innerHTML = data["p1points"] };
            for (const element of document.getElementsByClassName("var-p2name")) { element.innerHTML = data["p2name"] };
            for (const element of document.getElementsByClassName("var-p2points")) { element.innerHTML = data["p2points"] };
            for (const element of document.getElementsByClassName("var-p3name")) { element.innerHTML = data["p3name"] };
            for (const element of document.getElementsByClassName("var-p3points")) { element.innerHTML = data["p3points"] };
            setTimeout(() => {
                soundEffects["podium"]["3"].play()
            }, 3200)
            setTimeout(() => {
                soundEffects["podium"]["2"].play()
            }, 8000 + 3200)
            setTimeout(() => {
                soundEffects["podium"]["1"].play()
            }, 16000 + 3200)
        }

        refreshDisplay();
    }
}