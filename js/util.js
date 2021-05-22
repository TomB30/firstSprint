'use strict';
window.addEventListener("contextmenu", e => e.preventDefault());

//importing all the sounds for the game and setting if the sound is on.
var isSoundOn = true;
var SAFE_CLICK_SOUND = new Audio('./sound/safeClick.mp3');
var MINE_CLICK_SOUND = new Audio('./sound/mineClick.mp3');
var FINISH_GAME_SOUND = new Audio('./sound/finishGame.mp3')

//setting the default time start.
var gMinutes = 0;
var gSeconds = 0;
var gMiliseconds = 0;
var gTimeInterval = null;

//setting keys in local storage.
localStorage.setItem('Hard', Infinity);
localStorage.setItem('Medium', Infinity);
localStorage.setItem('Easy', Infinity);


//takes the time and makes it a string for the user.
function printTime() {
    var minutesPrint = (gMinutes < 10) ? '0' + gMinutes : gMinutes;
    var secondsPrint = (gSeconds < 10) ? '0' + gSeconds : gSeconds;
    var milisecondsPrint = (gMiliseconds < 10) ? '0' + gMiliseconds : gMiliseconds;
    document.querySelector('.timer').innerText = minutesPrint + ':' + secondsPrint + ':' + milisecondsPrint;
}
function startTime() {
    gMiliseconds++;
    gGame.milisecsPassed++;
    if (gMiliseconds > 99) {
        gSeconds++;
        gMiliseconds = 0;
    }
    if (gSeconds > 59) {
        gSeconds = 0;
        gMinutes++;
    }

    printTime();
}
function stopTime() {
    clearInterval(gTimeInterval);
    gTimeInterval = null;
}
function resetTime() {
    clearInterval(gTimeInterval);
    gTimeInterval = null;
    gMinutes = 0;
    gSeconds = 0;
    gMiliseconds = 0;
    printTime();
}
//counting how many mines are negs of provided cell.
function countMineNegs(cellI, cellJ, mat) {
    var mineNegs = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;
            if (mat[i][j].isMine) mineNegs++;
        }
    }
    if (mineNegs === 0) mineNegs = ' ';
    return mineNegs;
}
// reveals or unreveals negs .(for hint clicks).
function revealNegs(cellI, cellJ, mat, toCover) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (!document.querySelector(`#cell-${i}-${j}`).classList.contains('shown') && !mat[i][j].isMarked) {
                mat[i][j].isShown = (!toCover) ? true : false;
                if (toCover) {
                    document.querySelector(`#cell-${i}-${j} span`).classList.add('covered')
                } else {
                    document.querySelector(`#cell-${i}-${j} span`).classList.remove('covered')
                    
                }
            }
        }
    }
}
// mute/unmute sound.
function soundToggle(elBtn) {
    if (isSoundOn) {
        isSoundOn = false;
        elBtn.innerText = '🔈'
    }
    else {
        isSoundOn = true;
        elBtn.innerText = '🔊'
    }
}

function instructionToggle(){
    var elModal = document.querySelector('.instruction-modal-wrapper');
    if (elModal.style.display === 'block'){
        elModal.style.display = 'none';
    }else{
        elModal.style.display = 'block';
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}