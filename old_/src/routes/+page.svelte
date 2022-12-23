<script>
export const prerender = false;

import WebSocket from 'ws';

var gameState = "playerNormal" // prePlayerInput, waiting, playerTrueFalse, playerNormal, playerCorrect, playerWrong, hostQuestion, hostAnswers, hostResults, hostLeaderboard, hostPodium, hostLobby

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
var hostUsernameList = ["Name"]

function onPlayerButtonPress(btn){ //A,B,C,D,Y,N
    gameState = "waiting"
}

setTimeout(() => {
    var socket = new WebSocket("ws://localhost:4348/");

    socket.addEventListener('open', (event) => {
        console.log("Connected to server")
    });

    socket.addEventListener('message', (event) => {
        console.log('Message from server ', event.data);
    });

    socket.addEventListener('error', (event) => {
        console.log("Server connection error")
    });
}, 0);


</script>



{#if gameState === "waiting"}
<div class="pageWaiting">
    <div class="center">
        <img src="assets/loading.svg" alt="Laden...">
    </div>
</div>



{:else if gameState === "hostLobby"}
<div class="hostLobby">
    <div class="wrapper">
        {#each hostUsernameList as name}
		<p>{name}</p>
	    {/each}
    </div>
</div>



{:else if gameState === "prePlayerInputID"}
<div class="prePlayerJoin">
    <div class="wrapper" id="prePlayerJoin-PIN">
        <img src="assets/branding.png" alt="Intramo">
        <form class="form-container">
            <input type="text" placeholder="Spiel-PIN"/>
            <input type="text" placeholder="Name"/>
            <button>Beitreten</button>
        </form>
    </div>
</div>



{:else if gameState === "prePlayerInputName"}
<div class="prePlayerJoin">
    <div class="wrapper">
        <img src="assets/branding.png" alt="Intramo">
        <form class="form-container">
            <input type="text" placeholder="Name"/>
            <input type="submit" value="Beitreten"/>
        </form>
    </div>
</div>



{:else if gameState === "hostAnswers"}
<div class="pageHostAnswers">
    <div class="topbar">
        <p class="question">{hostQuestionName}</p>
    </div>

    <div class="content">
        <img src="assets/placeholder.jpg" alt="Platzhalter">
    </div>

    <div class="cards">
        <button class="card-red">   <p class="char">A</p> <p class="text">{hostOptionNameRed}</p> </button>
        <button class="card-blue">  <p class="char">B</p> <p class="text">{hostOptionNameBlue}</p> </button>
        <button class="card-yellow"><p class="char">C</p> <p class="text">{hostOptionNameYellow}</p> </button>
        <button class="card-green"> <p class="char">D</p> <p class="text">{hostOptionNameGreen}</p> </button>
    </div>

    <div class="seconds"><p>{hostCountdown}</p></div>
    <p class="answers">{hostAnswers} Antworten</p>
</div>



{:else if gameState === "playerCorrect"}
<div class="pagePlayerResultCorrect">
    <div class="center">
        <p class="indicator">Richtig</p>
        <img src="assets/correct.svg" alt="Check!">
        <p class="answerstreak">Answer Streak 🔥 {playerAnswerStreak}</p>
    </div>
</div>



{:else if gameState === "playerTrueFalse"}
<div class="pagePlayerSelectAnswers TrueFalse">
    <div class="topbar">
        <p class="progress">{progress}</p>
        <p class="type">Quiz</p>
        <p class="_placeholder" style="opacity: 0%;">{progress}</p>
    </div>

    <div class="cards">
        <button class="card-blue" on:click={() => onPlayerButtonPress("Y")}>Ja</button>
        <button class="card-red" on:click={() => onPlayerButtonPress("N")}>Nein</button>
    </div>

    <div class="footer">
        <p class="name">{playerName}</p>
        <p class="points">{playerPoints}</p>
    </div>
</div>



{:else if gameState === "playerWrong"}
<div class="pagePlayerResultWrong">
    <div class="center">
        <p class="indicator">Falsch</p>
        <img src="assets/wrong.svg" alt="Ehmmm...">
    </div>
</div>



{:else if gameState === "playerNormal"}
<div class="pagePlayerSelectAnswers Normal">
    <div class="topbar">
        <p class="progress">{progress}</p>
        <p class="type">Quiz</p>
        <p class="_placeholder" style="opacity: 0%;">{progress}</p>
    </div>

    <div class="cards">
        <button class="card-red" on:click={() => onPlayerButtonPress("A")}>A</button>
        <button class="card-blue" on:click={() => onPlayerButtonPress("B")}>B</button>
        <button class="card-yellow" on:click={() => onPlayerButtonPress("C")}>C</button>
        <button class="card-green" on:click={() => onPlayerButtonPress("D")}>D</button>
    </div>

    <div class="footer">
        <p class="name">{playerName}</p>
        <p class="points">{playerPoints}</p>
    </div>
</div>



{/if}
