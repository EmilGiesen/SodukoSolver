let data = []
let errorData = []
const dataString = []
let startTime
let endTime
let timeDif
let min = 1
let max = 9
let min2 = 40
let max2 = 70
$(document).ready(function(){
    let tableContent= ""
    
    for (let i = 0; i < 9; i++) {
        data.push([])
        errorData.push([])
        tableContent += "<tr>"
        for(let o = 0; o < 9; o++){
            data[i].push(null)
            errorData[i].push(true)
            var subBox
            if (i < 3 && o < 3 || i > 5 && o > 5 || i < 3 && o > 5 || i > 5 && o < 3 || (i >= 3 && i <= 5 && o >= 3 && o <= 5)) {
                subBox = "dark";
            } else {
                subBox = "light";
            }
            tableContent += `<td><div class='Sudoku ${subBox}'> <input class='zahlen ${subBox}' id='${i}-${o}' type='text' maxlength='1' oninput="this.value = this.value.replace(/[^1-9]/g, '').replace(/(\..*)\./g, '$1');" /> </div> </td>`;
        }
        tableContent += "</tr>"
    }
    $("#SudokuTable").append(tableContent)
    for (let i = 0; i < 9; i++) {
        for(let o = 0; o < 9; o++){
            $("#"+ i + "-" + o).change(function(){
                var wert = $("#" + i + "-" + o).val()
                data[i][o] = wert ? parseInt(wert) : null;
                // alle Felder neu prüfen, sonst bleiben alte Fehler rot
                for (let x = 0; x < 9; x++) {
                    for (let z = 0; z < 9; z++) {
                        error(isFieldValid(x, z, data[x][z]), x, z)
                    }
                }
            })
        }
    }

    $("#solveButton").click(async function(){
        const ErrorDataString = errorDataToString(errorData); 
        if(ErrorDataString.filter(p => p == 1).length !== 0){
            invalidButton()
        } else {
            validButtob()
            start()
            await sudokuSolve(data);
        }
    })
    $("#generateButton").click(function(){
        resetBoard(data, errorData);
        timeDif = 0;
        timer(timeDif);
        randomSudoku(data);
        
        updateUIFast();
    });
    $("#resetButton").click(function(){
        resetBoard(data, errorData)
        updateUIFast()
        timeDif = 0
        timer(timeDif)
       })

    function invalidButton() {
        var solveButton = $("#solveButton"); 
        solveButton.removeClass("solveButton")
        solveButton.addClass("solveButtonInvalid")
    }
    function validButtob(){
        var solveButton = $("#solveButton");
        solveButton.removeClass("solveButtonInvalid")    
        solveButton.addClass("solveButton")

    }   
    $("#loadButton").click(function(){
        var name = document.getElementById("name").value
        resetBoard(data, errorData)
        $.ajax({url: "http://localhost:5049/Sudoku?name="+name, success: function(result){
            console.log(result)
            gameState = result.gameState
            errorState = result.errorState
            timeDif = result.timeToSolveInMs
            setTimeout(() => {}, 50)
            loadGameState(gameState, data)
            loadErrorState(errorState, errorData)
            timer(timeDif)
            updateUIFast()
            $("#loadMessage").addClass("show-message");
                setTimeout(() => {
                    $("#loadMessage").removeClass("show-message");
                }, 2000)
          }
        });
        })
    $("#sendButton").click(function() {
        var name = document.getElementById("name").value;
        const dataString = datatoString(data); 
        console.log(dataString);
        let gameState = dataString.join('');
        console.log(gameState);
        const ErrorDataString = errorDataToString(errorData); 
        console.log(ErrorDataString);
        let errorState = ErrorDataString.join('');
        console.log(errorState);
        $.ajax({
            type: "POST",
            url: "http://localhost:5049/Sudoku",
            data: JSON.stringify({
                Name: name,
                GameState: gameState,
                ErrorState: errorState,
                TimeToSolveinMs: timeDif,
            }),
            success: function(res) {
                $("#message").addClass("show-message")
                setTimeout(() => {
                    $("#message").removeClass("show-message")
                }, 2000)
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
    })
    });

 


function isFieldValid(i,o, num){
    let wert = num
    if (wert === null || wert === "") {
        return true;
    }
    let Row = isRowValid(i, wert)
    let Spalte =isSpalteValid(o, wert)
    let Block = isBlockValid(i, o, wert)
    return Row && Spalte && Block
}

function isRowValid(i, wert) {
    return data[i].filter((v) => v == wert).length == 1
}

function isSpalteValid(o, wert) {
    const spalte= [];
    for(let y = 0; y < 9 ;y++) {
        let wertSpalte = data[y][o]
        spalte[y] = wertSpalte
    }
    return spalte.filter((v) => v == wert).length == 1
}

function isBlockValid(i, o, wert) {
    let welcherBlockRow = Math.floor(i / 3) * 3
    let welcherBlockSpalte = Math.floor(o /3) * 3
    const block = []

    for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 3; z++) {
            let wertBlock = data[welcherBlockRow + x][welcherBlockSpalte + z]
            block.push(wertBlock)
        }
    }
    return block.filter((v) => v == wert).length == 1
}
function error(isValid, i, o) {
    let inputField = $("#" + i + "-" + o)
    if (!isValid) {
        errorData[i][o] = false
        inputField.addClass("invalid")
    } else {
        errorData[i][o] = true
        inputField.removeClass("invalid")
    }
}
// Visual Backtracking
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));  
}

async function solverWithVisualization(i, o) {
    if (i === 9) return true;
    if (o === 9) return await solverWithVisualization(i + 1, 0);
    if (data[i][o] !== null) return await solverWithVisualization(i, o + 1);

    for (let num = 1; num <= 9; num++) {
        data[i][o] = num;
        updateUI(i, o, num);
        
        end();
        timer(timeDif);
        await sleep(30);

        if (isFieldValid(i, o, num)) {
            if (await solverWithVisualization(i, o + 1)) {
                let inputField = $("#" + i + "-" + o);
                inputField.removeClass("trying");
                return true;
            }
        }

        data[i][o] = null;
        updateUI(i, o, null);
        await sleep(30);
    }
    return false;
}
function updateUI(i, o, num) {
    let inputField = $("#" + i + "-" + o);
    
    if (num !== null) {
        inputField.val(num)
        inputField.addClass("trying")

        
        if (isFieldValid(i, o, num) && num !== "") {
            inputField.addClass("finished")
        }
    } else {
        inputField.val("")
        inputField.removeClass("trying")
        inputField.removeClass("finished")
    }
}

// Fast Backtracking
 function solver(i, o){
    if(i === 9)
        return true
    if(o === 9) {
       return solver(i + 1, 0)
    }

    if(data[i][o] !== null){
        return solver(i, o+1)
    }
    for (let num = 1; num <= 9;num++){
        data[i][o] = num
        if (isFieldValid(i, o, num)){
            if(solver(i, o)){
                return true
            }
        }
    }
    data[i][o] = null
    return false
}


function updateUIFast(){
    for (let i = 0; i < 9; i++) {
        for (let o = 0; o < 9; o++) {
            $("#" + i + "-" + o).val(data[i][o] !== null ? data[i][o] : '');
        }
    }
} 
async function sudokuSolve(data) {
    const Checked = document.getElementById("visualBacktracking").checked;
    let solved = false;
    
    if (!Checked) {
        solved = solver(0, 0);
    } else {
        solved = await solverWithVisualization(0, 0);
    }

    if (solved) {
        end();
        updateUIFast();
        timer(timeDif);
        console.log("Solution found:", data);
    } else {
        console.log("No solution exists");
        end();
        timer(timeDif);
    }
}
function start(){
    startTime = Date.now()
}
function end(){
    endTime = Date.now()
    timeDif = endTime-startTime  
}
function timer(timeDif) {
    const timerElement = document.getElementById("timer");
    let displayTime;
    
    if (timeDif >= 1000) {
        displayTime = (timeDif / 1000).toFixed(1) + " s";
    } else {
        displayTime = timeDif + " ms";
    }
    
    timerElement.textContent = `Time to solve: ${displayTime}`;
}
function datatoString(data) {
    const dataString = [];
    for (let i = 0; i < 9; i++) {
        for (let o = 0; o < 9; o++) {
            var leer = 0
            if(data[i][o] !== null){
                dataString.push(data[i][o]);
        } else {
            dataString.push(leer)
        }
        }
    }
    return dataString;
}
function errorDataToString(errorData) {
    const ErrorDataString = [];
    for (let i = 0; i < 9; i++) {
        for (let o = 0; o < 9; o++) {
            if(!errorData[i][o]){
                let f = 1;
            ErrorDataString.push(f);
        } else {
                let t = 0;
            ErrorDataString.push(t)
        }
    }
    }
    return ErrorDataString;
}
function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomAmount(min2, max2) {
    min2 = Math.ceil(min2);
    max2 = Math.floor(max2);
    return Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
}

function randomSudoku(data) {
    if (!randomSolver(0, 0, data)) {
        console.log("Failed to generate base solution");
        return;
    }


    let randomAmount = getRandomAmount(min2, max2);
    for (let p = 0; p < randomAmount; p++) {
        let x = getRandomNumber(min, max) - 1;
        let y = getRandomNumber(min, max) - 1;
        data[x][y] = null;
    }

    updateUIRandom(data);
}

function randomSolver(i, o, data) {
    if (i === 9) return true;
    if (o === 9) return randomSolver(i + 1, 0, data);
    
    if (data[i][o] !== null) return randomSolver(i, o + 1, data);

    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    for (const num of numbers) {
        data[i][o] = num;
        if (isFieldValid(i, o, num)) {
            if (randomSolver(i, o + 1, data)) {
                return true;
            }
        }
    }
    data[i][o] = null;
    return false;
}
        function updateUIRandom(data){
            for (let i = 0; i < 9; i++) {
                for (let o = 0; o < 9; o++) {
                    $("#" + i + "-" + o).val(data[i][o] !== null ? data[i][o] : '');
                }
            }
        } 
        

function resetBoard(data, errorData) {
    for (let i = 0; i < 9; i++) {
        for(let o = 0; o < 9; o++){
            let inputField = $("#" + i + "-" + o);
            data[i][o] =  null
            errorData[i][o] = true
            inputField.removeClass("trying")
            inputField.removeClass("finished")
            inputField.removeClass("invalid") 
        }
        updateUIFast()
    }
}

function loadGameState(gameState, data) {
var u = 0;
var y = 0;
    for(let a = 0; a < 81; a++){
        let gameStateString = gameState.substring(a, a+1)
        let gameStateNumber = parseInt(gameStateString)
        // 0 = leeres Feld
        data[u][y] = gameStateNumber === 0 ? null : gameStateNumber
        y++
        if( y > 8){
            u++
            y = 0
            console.log(data)
        }
    }
        
}
function loadErrorState(errorState, errorData){
    var u = 0;
    var y = 0;
    for(let a = 0; a < 81; a++){
        let errorStateString = errorState.substring(a, a+1)
        let errorStateNumber = parseInt(errorStateString)
        if(errorStateNumber != 0){
            errorData[u][y] = false
            y++
        } else {
            errorData[u][y] = true
            y++
        }   
        if(y > 8) {
            u++
            y=0
        }   
    }
}