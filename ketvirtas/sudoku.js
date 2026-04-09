
const boardUrl = "https://6550e0cc7d203ab6626e476a.mockapi.io/api/v1/SudokuBoard/1";
const solutionUrl = "https://6550e0cc7d203ab6626e476a.mockapi.io/api/v1/SudokuSolutions/1";

const boardDataValidator = /^[0-9xX]+$/;
const solutionDataValidator = /^[0-9]+$/;
const inputValidator = /^[0-9]$/;

const correctCellColour = "rgba(0, 150, 0, 0.3)";
const incorrectCellColour = "rgba(150, 0, 0, 0.3)";

$(document).ready(async function () {

    function validateJsonData(boardData, solutionData) {
        if(null == boardData.board || null == boardData.width || null == boardData.height) {
            showErrorMessage("Invalid board data json");
            return false;
        }
        else if(boardData.width % 3 != 0 || boardData.height % 3 != 0) {
            showErrorMessage("Sudoku board dimensions must be multiples of 3");
            return false;
        }
        else if(null == solutionData.solution || solutionData.solution.length != boardData.width * boardData.height) {
            showErrorMessage("Invalid solution data json");
            return false;
        }
        else if(!boardDataValidator.test(boardData.board)) {
            showErrorMessage("Board data contains invalid symbols");
            return false;
        }
        else if(!solutionDataValidator.test(solutionData.solution)) {
            showErrorMessage("Solution data contains invalid symbols");
            return false;
        }

        return true;
    }

    function renderBoard(boardData) {
        for(let i = 0; i < boardData.height; ++i) {
            const row = document.createElement("tr");

            for(let j = 0; j < boardData.width; ++j) {
                const cell = document.createElement("td");
                const cellChar = boardData.board[i * boardData.height + j];

                const input = document.createElement("input");
                if(cellChar.toLowerCase() == 'x') {
                    input.maxLength = 1;
                    input.addEventListener("input", function(event) {
                        let value = event.target.value;
                        event.target.value = inputValidator.test(value) ? value : '';
                    });
                }
                else {
                    input.disabled = true;
                    input.value = cellChar;
                }
                
                cell.appendChild(input);
                row.appendChild(cell);
            }
            $("#sudoku-board").append(row);
        }
    }

    function showErrorMessage(message) {
        const popup = $("#error-popup");
        
        popup.find("p").text(message);
        popup.show().css("display", "flex");
        $("#error-overlay").show();
    }

    const [boardResponse, solutionResponse] = await Promise.all([
        fetch(boardUrl),
        fetch(solutionUrl)
    ]);

    let [boardData, solutionData] = [{}, {}]
    if(!boardResponse.ok) {
        showErrorMessage("Failed to fetch board data");
    }
    else if(!solutionResponse.ok) {
        showErrorMessage("Failed to fetch solution data");
    }
    else {
        boardData = await boardResponse.json();
        solutionData = await solutionResponse.json();

        if(validateJsonData(boardData, solutionData)) {
            renderBoard(boardData);
        }
    }

    $("#check-btn").click(function () {
        const cells = document.querySelectorAll("#sudoku-board td");

        if(null == solutionData.solution || null == solutionData.solution.length || cells.length != solutionData.solution.length) {
            showErrorMessage("Solution and board cell count mismatch!");
        }
        else {
            for(let i = 0; i < cells.length; ++i) {
                const cell = cells[i];
                const input = cell.firstChild;
                const solution = solutionData.solution[i];

                if(input.disabled || input.value == solution) {
                    cell.style.backgroundColor = correctCellColour;
                }
                else {
                    cell.style.backgroundColor = incorrectCellColour;
                    input.value = solution;
                }
            }
        }
    });

    $("#reset-btn").click(function () {
        const cells = document.querySelectorAll("#sudoku-board td");

        cells.forEach(cell => {
            const input = cell.firstChild;
            cell.style.backgroundColor = null;
            if(!input.disabled) {
                input.value = '';
            }
        });
    });

    $("#error-popup button").click(function() {
        $(this).parent().hide();
        $("#error-overlay").hide();
    });
});
