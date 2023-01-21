var isSessionLocked = false;

function onSessionLockButton(){
    isSessionLocked = !isSessionLocked
    if(isSessionLocked){
        document.getElementById("pageHostLobby-start-lock").innerHTML = "<i class= \"fa-solid fa-lock\"></i>"
    }else{
        document.getElementById("pageHostLobby-start-lock").innerHTML = "<i class= \"fa-solid fa-lock-open\"></i>"
    }
}

document.getElementById("pagePlayerJoin-language").addEventListener("click", (event) => {
    let element = document.getElementById("pagePlayerJoin-language-select");
    element.style.display = element.style.display === "block" ? "none" : "block";
})

let elements = document.querySelectorAll(".pagePlayerJoin-language-selection-btn");
for(let i=0; i < elements.length; i++){
    elements[i].addEventListener("click", (event) => {
        currentLanguage = elements[i].dataset.language;
        applyLanguage();
    });
}