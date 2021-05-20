'use strict';
window.addEventListener("contextmenu", e => e.preventDefault());
var SAFE_CLICK_SOUND = new Audio('./sound/safeClick.mp3');
var MINE_CLICK_SOUND = new Audio('./sound/mineClick.mp3');
var FINISH_GAME_SOUND = new Audio('./sound/finishGame.mp3')

var gMinutes = 0;
var gSeconds = 0;
var gMiliseconds = 0;
var gTimeInterval = null;

function print() {
    var minutesPrint = (gMinutes < 10) ? '0' + gMinutes : gMinutes;
    var secondsPrint = (gSeconds < 10) ? '0' + gSeconds : gSeconds;
    var milisecondsPrint = (gMiliseconds < 10) ? '0' + gMiliseconds : gMiliseconds;
    document.querySelector('.timer').innerText = minutesPrint + ':' + secondsPrint + ':' + milisecondsPrint;
}
function startTime() {
    gMiliseconds++;
    if (gMiliseconds > 99) {
        gMiliseconds = 0;
        gSeconds++;
    }
    if (gSeconds > 59) {
        gSeconds = 0;
        gMinutes++;
    }

    print();
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
    print();
}

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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function revealNegs(cellI, cellJ, mat, toCover) {
    var ShownCells = [];
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            mat[i][j].isShown = (toCover) ? false : true;
            if (!document.querySelector(`#cell-${i}-${j}`).classList.contains('shown') && !mat[i][j].isMarked) {
                if (toCover) {
                    document.querySelector(`#cell-${i}-${j} span`).classList.add('covered')
                } else {
                    document.querySelector(`#cell-${i}-${j} span`).classList.remove('covered')

                }
            }
        }
    }
}