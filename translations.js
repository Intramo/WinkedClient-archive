const Language = {
    German: 'German',
    English: 'English'
};

var currentLanguage = Language.German;
applyLanguage();

function setLanguage(l) {
    currentLanguage = l;
}

function getText(key) {
    return {
        'German': {
            "language.short": "DE",

            "error.id.exist": "Ungültiger Sitzungscode",
            "error.id.none": "Das Feld für die Spiel-ID ist leer",
            "error.id.toolong": "Die Spiel-ID ist zu lang",
            "error.id.tooshort": "Die Spiel-ID ist zu kurz",

            "error.name.none": "Das Feld für den Namen ist leer",
            "error.name.toolong": "Der Name ist zu lang",
            "error.name.tooshort": "Der Name ist zu kurz",
            "error.name.exist": "Der Name wird bereits genutzt",

            "pagePlayerJoin.join": "Beitreten",
            "pagePlayerJoin.gameid": "Spiel-ID",
            "pagePlayerJoin.name": "Name",
            "pagePlayerJoin.footer.line1": "Erstelle <a href=\"javascript:void(0);\" onclick=\"document.getElementById('hostPopup').style.display = 'flex'\"><b>hier</b></a> ein Quiz",
            "pagePlayerJoin.footer.line2": "<a href=\"https://github.com/Intramo/WinkedClient\">GitHub</a> | <a href=\"#\" target=\"_blank\">Datenschutz</a>",

            "pageHostLobby.header.url": "Tritt dem Spiel unter<br><b>play.winked.app</b> bei",
            "pageHostLobby.start.start": "Starten",

            "questionType.text": "<i class=\"fa-regular fa-keyboard\"></i> Texteingabe",
            "questionType.normal": "Quiz",
            "questionType.select": "<i class=\"fa-regular fa-square-check\"> Antworten auswählen</i>",
            "questionType.truefalse": "Wahr oder falsch",

            "pagePlayerAnswerTrueFalse.yes": "Ja",
            "pagePlayerAnswerTrueFalse.no": "Nein",

            "hostPopup.randomizeAnswers": "Antworten zufällig anordnen",
            "hostPopup.randomizeQuestions": "Fragen zufällig anordnen",
            "hostPopup.upload": "Eigene Datei hochladen"
        },
        'English': {
            "language.short": "EN"
        }
    }[currentLanguage][key]
}

function applyLanguage() {
    let elements = document.querySelectorAll("span");
    for (let i = 0; i < elements.length; i++) {
        if (!elements[i].hasAttribute("data-key")) continue;
        elements[i].innerHTML = getText(elements[i].dataset.key);
    }

    elements = document.querySelectorAll("input[type=\"text\"]");
    for (let i = 0; i < elements.length; i++) {
        if (!elements[i].hasAttribute("data-key")) continue;
        elements[i].placeholder = getText(elements[i].dataset.key);
    }
}