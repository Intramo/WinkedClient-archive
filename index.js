var gameState = "answerNormal" // playerJoin, waiting, answerNormal, answerTrueFalse, playerCorrect, playerWrong, hostLobby, hostPodium, hostLeaderboard, hostResults, hostAnswers, hostQuestion

var playerAnswerStreak = 69
var playerName = "John Doe"
var playerPoints = 4269
var answerCorrect = true
var progress = "1 von 69"

var hostAnswers = 9
var hostCountdown = 14
var hostQuestionName = "Testfrage?"
var hostOptionNameRed = "Test1"
var hostOptionNameBlue = "Test2"
var hostOptionNameYellow = "Test3"
var hostOptionNameGreen = "Test4"

function onButtonPress(btn){ // A, B, C, D, Y, N
    gameState = "waiting"
    refreshDisplay();
}

function refreshDisplay(){
    for (const element of document.getElementsByClassName("page")) {
        element.style.display = "none";
    }

    document.getElementById("page-" + gameState).style.display = "initial";

    for (const element of document.getElementsByClassName("page")) {element.style.display = "none";}

    for (const element of document.getElementsByClassName("var-playerAnswerStreak")) {element.innerHTML = playerAnswerStreak};
    for (const element of document.getElementsByClassName("var-playerName")) {element.innerHTML = playerName};
    for (const element of document.getElementsByClassName("var-playerPoints")) {element.innerHTML = playerPoints};
    for (const element of document.getElementsByClassName("var-answerCorrect")) {element.innerHTML = answerCorrect};
    for (const element of document.getElementsByClassName("var-progress")) {element.innerHTML = progress};

    for (const element of document.getElementsByClassName("var-hostAnswers")) {element.innerHTML = hostAnswers};
    for (const element of document.getElementsByClassName("var-hostCountdown")) {element.innerHTML = hostCountdown};
    for (const element of document.getElementsByClassName("var-hostQuestionName")) {element.innerHTML = hostQuestionName};
    for (const element of document.getElementsByClassName("var-hostOptionNameRed")) {element.innerHTML = hostOptionNameRed};
    for (const element of document.getElementsByClassName("var-hostOptionNameBlue")) {element.innerHTML = hostOptionNameBlue};
    for (const element of document.getElementsByClassName("var-hostOptionNameYellow")) {element.innerHTML = hostOptionNameYellow};
}


refreshDisplay();