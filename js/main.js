'use strict';

var gBoard;
var gGame;
var gLevel;
var gEmptyCells;
var gLives;
var gSafeClicks;
var gIsHintClick;
var gIsFirstTurn;
var gGameOver;

function initGame(boardSize, minesAmount) {
    gLevel = {
        SIZE: boardSize,
        MINES: minesAmount
    }
    setGame();
    gBoard = buildBoard(boardSize, minesAmount)
    renderBoard(gBoard)
}

// setting all the global variables ready for a new game.
function setGame() {
    resetTime();
    gIsHintClick = false;
    gGameOver = false;
    gIsFirstTurn = true;
    gEmptyCells = [];
    gLives = 3;
    gSafeClicks = 3;
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        milisecsPassed: 0
    }
    closeModal();
    document.querySelector('.best-scores').style.display = 'none';
    document.querySelector('table').style.backgroundColor = '';
    document.querySelector('#lives-indic').style.backgroundColor = '';
    document.querySelector('.smiley').innerText = '😄';
    document.querySelector('.lives').innerText = gLives;
    document.querySelector('#hints-indic span').innerText = gSafeClicks;
    document.querySelector('#hints-indic').style.backgroundColor = '';
    var elBtns = document.querySelectorAll('.hint-btn');
    for (var i = 0; i < elBtns.length; i++) {
        elBtns[i].disabled = false;
        elBtns[i].style.backgroundColor = '';
    }
}
// building a board
function buildBoard(size) {
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
        }
    }
    return gBoard;
}
// when called , loop through all the cells in the board and updating the minesAroundCount of each cell.
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
// rendering the board , making it visible to player.
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

                isBomb = board[i][j].minesAroundCount;
            }
            strHTML += `<td id="cell-${i}-${j}"  onclick="cellClicked(this , ${i},${j})" oncontextmenu="cellMarked(this , ${i},${j})"><span class="${isCovered}">${isBomb}</span></td>`;
        }
        strHTML += '</tr>';
    }
    document.querySelector('tbody').innerHTML = strHTML;
}
// operates every time the player clicks on a cell.
function cellClicked(elCell, row, col) {

    if (gGameOver === true) return;                        //if game over. return.

    if (gTimeInterval === null) {                          //starting time count if not counting yet.
        gTimeInterval = setInterval(startTime, 10);
    }

    if (gBoard[row][col].isMarked) return;                 //if cell is marked , can not be clicked.
    if (gBoard[row][col].isShown) return;                  //if cell already revealed , can not be clicked.

    if (gIsHintClick) {                                    //if current click is a hint.
        revealNegs(row, col, gBoard, false);
        setTimeout(function () {
            revealNegs(row, col, gBoard, true);
        }, 1000)
        gIsHintClick = false;
        return;
    }
    //updating model.                                                       
    gBoard[row][col].isShown = true;
    gGame.shownCount++;
    //updating DOM.
    document.querySelector('#' + elCell.id).classList.add('shown');
    document.querySelector('#' + elCell.id + ' span').classList.remove('covered');
    //checking if it's the first click.
    if (gIsFirstTurn) {
        gIsFirstTurn = false;
        gGame.isOn = true;
        // making an empty cells array that's not contain the same cell that was clicked.
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                if (i === row && j === col) {
                } else {
                    gEmptyCells.push(gBoard[i][j]);
                }
            }
        }
        // adding mines to random locations from the emptycells array.
        for (var i = 0; i < gLevel.MINES; i++) {
            var currCell = gEmptyCells.splice(getRandomInt(0, gEmptyCells.length - 1), 1)
            currCell[0].isMine = true;
        }
        //updating the model with all the numbers of mine neighbors. rendering again.
        gBoard = setMinesNegsCount(gBoard);
        renderBoard(gBoard)
        document.querySelector('#' + elCell.id).classList.add('shown')
    }



    //checking if it's a cell without any mines around and calling a recursive function.
    if (gBoard[row][col].minesAroundCount === ' ') {
        expandShown(gBoard, row, col);
        if (isSoundOn) SAFE_CLICK_SOUND.play();
    } else if (!gBoard[row][col].isMine) {
        if (isSoundOn) SAFE_CLICK_SOUND.play();
    }
    //checking if it's a cell with a mine.
    if (gBoard[row][col].isMine) {
        gLives--;
        if (gLives === 2) {
            document.querySelector('#lives-indic').style.backgroundColor = 'orange';
        } else if (gLives === 1) {
            document.querySelector('#lives-indic').style.backgroundColor = 'red';
        }
        document.querySelector('.lives').innerText = gLives;
        if (gLives === 0) {
            for (var row = 0; row < gBoard.length; row++) {
                for (var col = 0; col < gBoard[0].length; col++) {
                    if (gBoard[row][col].isMine) {
                        document.querySelector(`#cell-${row}-${col} span`).classList.remove('covered');
                    }
                }
            }
            document.querySelector('table').style.backgroundColor = 'red';
            gameOver();
        } else {
            document.querySelector('table').style.backgroundColor = 'red';
            gGameOver = true;
            setTimeout(function () {
                document.querySelector('table').style.backgroundColor = '';
                gGameOver = false;
            }, 500)
        }
        if (isSoundOn) MINE_CLICK_SOUND.play();
    }
    //checking if the game is over.
    checkGameOver();
}
//This function is called if the player used the mouse right-click.
function cellMarked(elCell, i, j) {
    if (gGameOver === true) return;
    //disabling it if it's first click.
    if (gIsFirstTurn) {
        openModal('Flags Can not be used at first turn', false, false);
        setTimeout(closeModal, 2000);
        return;
    }
    //disabling it if it's a revealed cell.
    if (gBoard[i][j].isShown) return;

    if (!gBoard[i][j].isMarked) {
        if (gGame.markedCount >= gLevel.MINES) {
            openModal('You are out of flags', true);
            setTimeout(closeModal, 1000)
            return;
        }
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
    //again checking if game is over.
    checkGameOver();
}

function checkGameOver() {
    if (gGame.markedCount + gGame.shownCount === gBoard.length * gBoard[0].length) {
        clearInterval(gTimeInterval);
        gTimeInterval = null;
        document.querySelector('.smiley').innerText = '😎';
        gGameOver = true;
        openModal('You Won!', true, true);
        if (isSoundOn) FINISH_GAME_SOUND.play();
        var currTime = gGame.milisecsPassed;
        document.querySelector('.best-scores').style.display = 'block';
        document.querySelector('.curr-time').innerText = document.querySelector('.timer').innerText;
        // BONUS - Best Scores.
        // saving best score on local storage , and showing the player the best scores.
        switch (gLevel.SIZE) {
            case 4:
                if (currTime < localStorage.getItem('Easy')) {
                    localStorage.setItem('Easy', currTime);
                    document.querySelector('.easy-best').innerText = document.querySelector('.timer').innerText;
                }

                break;
            case 8:
                if (currTime < localStorage.getItem('Medium')) {
                    localStorage.setItem('Medium', currTime);
                    document.querySelector('.medium-best').innerText = document.querySelector('.timer').innerText;
                }
                break;
            case 12:
                if (currTime < localStorage.getItem('Hard')) {
                    localStorage.setItem('Hard', currTime);
                    document.querySelector('.hard-best').innerText = document.querySelector('.timer').innerText;
                }
                break;
        }
    }
}

// when user is out of lives and click on a bomb.
function gameOver() {
    clearInterval(gTimeInterval);
    gTimeInterval = null;
    gGameOver = true;
    document.querySelector('.smiley').innerText = '🤯';
    openModal('You Got Bombed!', false, true)
}



// BONUS - Hints
function useHint(elBtn) {
    if (gIsFirstTurn) {
        openModal('Hints are not allowed at first click!', false, false)
        setTimeout(closeModal, 2000)
        return
    }
    if (elBtn.disabled) return;
    if (!gIsHintClick) {
        gIsHintClick = true;
    } else {
        return;
    }
    elBtn.disabled = true;
    elBtn.style.backgroundColor = 'black';
}
// BONUS - Safe Clicks
function useSafeClick() {
    if (gSafeClicks <= 0) {
        openModal('No Safe Clicks left!', false, false);
        setTimeout(closeModal, 2000);
        return;
    }
    gSafeClicks--;
    document.querySelector('#hints-indic span').innerText = gSafeClicks;
    switch (gSafeClicks) {
        case 3:
            document.querySelector('#hints-indic').style.backgroundColor = 'yellow';
            break;
        case 2:
            document.querySelector('#hints-indic').style.backgroundColor = 'orange';
            break;
        case 1:
            document.querySelector('#hints-indic').style.backgroundColor = 'red';
            break;
    }
    var randomI = getRandomInt(0, gBoard.length - 1)
    var randomJ = getRandomInt(0, gBoard[0].length - 1)
    var randomCell = gBoard[randomI][randomJ];
    var iterCount = 0;
    while (randomCell.isMine && iterCount < gLevel.SIZE ** 2 || randomCell.isShown && iterCount < gLevel.SIZE ** 2) {
        randomI = getRandomInt(0, gBoard.length - 1)
        randomJ = getRandomInt(0, gBoard[0].length - 1)
        randomCell = gBoard[randomI][randomJ];
        iterCount++
    }
    document.querySelector(`#cell-${randomI}-${randomJ}`).style.backgroundColor = 'yellow';
    setTimeout(function () {
        document.querySelector(`#cell-${randomI}-${randomJ}`).style.backgroundColor = '';
    }, 2000)

}
// BONUS - Full Expand.
function expandShown(mat, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;
            if (mat[i][j].isMine) continue;
            if (mat[i][j].isShown === true) continue;
            if (mat[i][j].isShown === false) {
                mat[i][j].isShown = true;
                gGame.shownCount++;
                if (mat[i][j].isMarked) {
                    mat[i][j].isMarked = false;
                    gGame.markedCount--;
                    document.querySelector(`#cell-${i}-${j} span`).innerText = (gBoard[i][j].isMine) ? '🧨' : gBoard[i][j].minesAroundCount;
                }
                document.querySelector(`#cell-${i}-${j} span`).classList.remove('covered')
                document.querySelector(`#cell-${i}-${j}`).classList.add('shown')
            }
            if (mat[i][j].minesAroundCount === ' ') expandShown(mat, i, j)
        }
    }
}

// modal with some messages for the player.
function openModal(msg, isWin, isEnd) {
    document.querySelector('.modal').style.display = 'block';
    document.querySelector('.modal-msg').innerText = msg;
    var backgroundColor = (isWin) ? 'turquoise' : 'red';
    document.querySelector('.modal').style.backgroundColor = backgroundColor;
    document.querySelector('.play-again-msg').style.display = (isEnd) ? 'block' : 'none';
}

function closeModal() {
    document.querySelector('.modal').style.display = 'none';
    document.querySelector('.modal-msg').innerText = '';
    document.querySelector('.play-again-msg').style.display = 'none';
}

function undoTurn() {
    var prevTurn = gGameBoards.pop();
    gBoard = prevTurn.board;
    gLives = prevTurn.lives;
    gSafeClicks = prevTurn.safeClicks;
    renderBoard(gBoard)
}
