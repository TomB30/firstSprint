'use strict';

var gBoard;
var gGame;
var gLevel;
var gEmptyCells;

// var gBoard = buildBoard(4);
// renderBoard(gBoard);


function initGame(boardSize, minesAmount) {
    resetTime();
    gEmptyCells = [];
    gGame = {
        isOn : false,
        shownCount : 0,
        markedCount : 0,
        secsPassed : 0
    }
    gLevel = {
        SIZE : boardSize,
        MINES : minesAmount
    }
    gBoard = buildBoard(boardSize, minesAmount)
    renderBoard(gBoard)
}

function buildBoard(size, minesAmount) {
    var gBoard = [];
    
    for (var i = 0; i < size; i++) {
        gBoard[i] = [];
        for (var j = 0; j < size; j++) {
            gBoard[i][j] = {
                minesAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            gEmptyCells.push(gBoard[i][j]);
        }
    }

    // for (var i = 0; i < minesAmount; i++) {
    //     var currCell = emptyCells.splice(getRandomInt(0,emptyCells.length-1),1)
    //     currCell[0].isMine = true;
    // }

    // gBoard = setMinesNegsCount(gBoard);
    return gBoard;
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = countMineNegs(i, j, board)
            }
        }
    }
    return board;
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[i].length; j++) {
            var isBomb;
            var isCovered = (board[i][j].isShown) ? '' : 'covered';
            if (board[i][j].isMine) {
                isBomb = '🧨';
            } else {
                ;
                isBomb = board[i][j].minesAroundCount;
            }
            strHTML += `<td id="cell-${i}-${j}"  onclick="cellClicked(this , ${i},${j})" oncontextmenu="cellMarked(this , ${i},${j})"><span class="${isCovered}">${isBomb}</span></td>`;
        }
        strHTML += '</tr>';
    }
    document.querySelector('tbody').innerHTML = strHTML;
}

function cellClicked(elCell, row, col) {
    if(!gGame.isOn){
        gGame.isOn = true;
        for (var i = 0; i < gLevel.MINES; i++) {
            var currCell = gEmptyCells.splice(getRandomInt(0,gEmptyCells.length-1),1)
            currCell[0].isMine = true;
        }
        gBoard = setMinesNegsCount(gBoard);
        renderBoard(gBoard)
    }
    if (gTimeInterval === null) {
        gTimeInterval = setInterval(startTime, 10);
    }
    if (gBoard[row][col].isMarked) return;

    gBoard[row][col].isShown = true;
    gGame.shownCount++;
    document.querySelector('#' + elCell.id + ' span').classList.remove('covered');



    if (gBoard[row][col].minesAroundCount === 0) {
        expandShown(gBoard, row, col);
    }

    if (gBoard[row][col].isMine) {
        for (var row = 0; row < gBoard.length; row++) {
            for (var col = 0; col < gBoard[0].length; col++) {
                if (gBoard[row][col].isMine) {
                    document.querySelector(`#cell-${row}-${col} span`).classList.remove('covered');
                }
            }
        }

        gameOver();
    }

    checkGameOver();
}

function cellMarked(elCell, i, j) {

    if (gTimeInterval === null) {
        gTimeInterval = setInterval(startTime, 10);
    }

    if (gBoard[i][j].isShown) return;

    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
        document.querySelector('#' + elCell.id + ' span').classList.remove('covered');
        document.querySelector('#' + elCell.id + ' span').innerText = '🚩';
    } else {
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
        document.querySelector('#' + elCell.id + ' span').classList.add('covered');
        document.querySelector('#' + elCell.id + ' span').innerText = (gBoard[i][j].isMine) ? '🧨' : gBoard[i][j].minesAroundCount;

    }

    checkGameOver();
}

function checkGameOver() {
    var gameOver = true;
    for (var i = 0; i < gBoard.length - 1; i++) {
        for (var j = 0; j < gBoard[0].length - 1; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
                gameOver = false;
                return gameOver;
            }
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                gameOver = false;
                return gameOver;
            }
        }
    }
    if (gameOver) {
        clearInterval(gTimeInterval);
        gTimeInterval = null;
    }
    return gameOver;
}


function gameOver() {
    console.log('YOU LOST!');
    clearInterval(gTimeInterval);
    gTimeInterval = null;
}

function expandShown(mat, cellI, cellJ) {                 
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;
            if (mat[i][j].isMine)continue;
            if(mat[i][j].isShown === true) continue;
            if(mat[i][j].isShown === false){
                mat[i][j].isShown = true;
                gGame.shownCount++;
                document.querySelector(`#cell-${i}-${j} span`).classList.remove('covered')
            }
            if(mat[i][j].minesAroundCount === 0) expandShown(mat , i , j)
        }
    }
}