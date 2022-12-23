var gameState = "waiting" // waiting, playerTrueFalse, playerNormal, playerCorrect, playerWrong, hostQuestion, hostAnswers, hostResults, hostLeaderboard, hostPodium

var playerID = 87905341
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


function updateGameDisplay(){
    // Update variables
    


    // Update visibility

    document.getElementsByTagName("body")[0].getElementsByTagName("div").array.forEach(element => {
        element.style.display = "none";
    });

    if(gameState === "waiting"){
        document.getElementById("pageWaiting").style.display = "flex";
    }

    if(gameState === "playerTrueFalse"){
        document.getElementById("pagePlayerSelectAnswersTrueFalse").style.display = "initial";
    }

    if(gameState === "playerNormal"){
        document.getElementById("pagePlayerSelectAnswersNormal").style.display = "initial";
    }

    if(gameState === "playerCorrect"){
        playerAnswerStreak += 1
        document.getElementById("pagePlayerResultCorrect").style.display = "flex";
    }

    if(gameState === "playerWrong"){
        playerAnswerStreak = 0
        document.getElementById("pagePlayerResultWrong").style.display = "flex";
    }

    if(gameState === "hostQuestion"){}

    if(gameState === "hostAnswers"){
        document.getElementById("pageHostAnswers").style.display = "initial";
    }

    if(gameState === "hostResults"){
        document.getElementById("pageWaiting").style.display = "flex";
    }

    if(gameState === "hostLeaderboard"){}

    if(gameState === "hostPodium"){}

    if(gameState === "waiting"){}
}