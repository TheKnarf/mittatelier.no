document.addEventListener('DOMContentLoaded', () => {
    const NUM_COLUMNS = 6;
    const HIGHSCORE_KEY = 'yatzyHighscores';

    // Game state
    let turn = 0;
    let lastMove = null; // To store the last move for undo

    // DOM Elements
    const undoButton = document.getElementById('undo-button');
    const newGameButton = document.getElementById('new-game-button');
    const scoreboardDiv = document.getElementById('scoreboard'); // This will be the table body
    const totalScoreValue = document.getElementById('total-score-value');
    const scoreboardTable = document.getElementById('scoreboard-table');
    const toggleHighscoreButton = document.getElementById('toggle-highscore-button');
    const sidePanel = document.getElementById('side-panel');
    const highscoreList = document.getElementById('highscore-list');

    let scoreCategories = {};

    const initialScoreCategories = {
        // Upper Section
        'Enere': { scores: new Array(NUM_COLUMNS).fill(null) },
        'Toere': { scores: new Array(NUM_COLUMNS).fill(null) },
        'Treere': { scores: new Array(NUM_COLUMNS).fill(null) },
        'Firere': { scores: new Array(NUM_COLUMNS).fill(null) },
        'Femmere': { scores: new Array(NUM_COLUMNS).fill(null) },
        'Seksere': { scores: new Array(NUM_COLUMNS).fill(null) },
        // Lower Section
        'Ett par': { scores: new Array(NUM_COLUMNS).fill(null) },
        'To par': { scores: new Array(NUM_COLUMNS).fill(null) },
        'Tre like': { scores: new Array(NUM_COLUMNS).fill(null) },
        'Fire like': { scores: new Array(NUM_COLUMNS).fill(null) },
        'Liten straight': { scores: new Array(NUM_COLUMNS).fill(null) },
        'Stor straight': { scores: new Array(NUM_COLUMNS).fill(null) },
        'Hus': { scores: new Array(NUM_COLUMNS).fill(null) },
        'Sjanse': { scores: new Array(NUM_COLUMNS).fill(null) },
        'Yatzy': { scores: new Array(NUM_COLUMNS).fill(null) }
    };

    const scoreOptions = {
        'Enere': [0, 1, 2, 3, 4, 5],
        'Toere': [0, 2, 4, 6, 8, 10],
        'Treere': [0, 3, 6, 9, 12, 15],
        'Firere': [0, 4, 8, 12, 16, 20],
        'Femmere': [0, 5, 10, 15, 20, 25],
        'Seksere': [0, 6, 12, 18, 24, 30],
        'Ett par': [0, 2, 4, 6, 8, 10, 12],
        'To par': [0, 6, 8, 10, 12, 14, 16, 18, 20, 22],
        'Tre like': [0, 3, 6, 9, 12, 15, 18],
        'Fire like': [0, 4, 8, 12, 16, 20, 24],
        'Liten straight': [0, 15],
        'Stor straight': [0, 20],
        'Hus': [0, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28],
        'Sjanse': [0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        'Yatzy': [0, 50]
    };

    const suggestedScores = {
        'Enere': 3,
        'Toere': 6,
        'Treere': 9,
        'Firere': 12,
        'Femmere': 15,
        'Seksere': 18,
        'Ett par': 12,
        'To par': 22,
        'Tre like': 18,
        'Fire like': 24,
        'Liten straight': 15,
        'Stor straight': 20,
        // 'Hus': 28,
        // 'Sjanse': 30,
        'Yatzy': 50
    };
    
    const orderedCategories = ['Enere', 'Toere', 'Treere', 'Firere', 'Femmere', 'Seksere', 'Ett par', 'To par', 'Tre like', 'Fire like', 'Liten straight', 'Stor straight', 'Hus', 'Sjanse', 'Yatzy'];

    function initializeGame() {
        newGameButton.addEventListener('click', newGame);
        undoButton.addEventListener('click', undoLastMove);
        toggleHighscoreButton.addEventListener('click', toggleHighscore);
        displayHighscores();
        newGame();
    }

    function newGame() {
        scoreCategories = JSON.parse(JSON.stringify(initialScoreCategories));
        turn = 0;
        lastMove = null;
        undoButton.disabled = true;
        renderScoreboard();
    }

    function renderScoreboard() {
        const tableBody = scoreboardDiv;
        tableBody.innerHTML = '';

        // Header Row
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th></th>';
        for (let i = 1; i <= NUM_COLUMNS; i++) {
            let icon = '';
            if (i === 4) icon = '↓';
            if (i === 5) icon = '↑';
            if (i === 6) icon = '①';
            headerRow.innerHTML += `<th>${i} <span class="header-icon">${icon}</span></th>`;
        }
        scoreboardTable.querySelector('thead').innerHTML = '';
        scoreboardTable.querySelector('thead').appendChild(headerRow);

        const upperSection = ['Enere', 'Toere', 'Treere', 'Firere', 'Femmere', 'Seksere'];
        const lowerSection = ['Ett par', 'To par', 'Tre like', 'Fire like', 'Liten straight', 'Stor straight', 'Hus', 'Sjanse', 'Yatzy'];

        // Upper Section
        upperSection.forEach(category => {
            const row = document.createElement('tr');
            let rowHtml = `<td>${category}</td>`;
            scoreCategories[category].scores.forEach((score, colIndex) => {
                rowHtml += `<td class="score-cell" data-category="${category}" data-column="${colIndex}">${score === null ? '-' : score}</td>`;
            });
            row.innerHTML = rowHtml;
            tableBody.appendChild(row);
        });

        // Upper Subtotal and Bonus Rows
        const upperSubtotalRow = document.createElement('tr');
        upperSubtotalRow.className = 'highlight-row';
        upperSubtotalRow.innerHTML = '<td>Sum øvre</td>';
        for (let i = 0; i < NUM_COLUMNS; i++) upperSubtotalRow.innerHTML += `<td id="upper-subtotal-col-${i}">0</td>`;
        tableBody.appendChild(upperSubtotalRow);

        const bonusRow = document.createElement('tr');
        bonusRow.id = 'bonus-row';
        bonusRow.className = 'highlight-row';
        bonusRow.innerHTML = '<td>Bonus</td>';
        for (let i = 0; i < NUM_COLUMNS; i++) bonusRow.innerHTML += `<td id="bonus-col-${i}">-</td>`;
        tableBody.appendChild(bonusRow);

        // Lower Section
        lowerSection.forEach(category => {
            const row = document.createElement('tr');
            let rowHtml = `<td>${category}</td>`;
            scoreCategories[category].scores.forEach((score, colIndex) => {
                rowHtml += `<td class="score-cell" data-category="${category}" data-column="${colIndex}">${score === null ? '-' : score}</td>`;
            });
            row.innerHTML = rowHtml;
            tableBody.appendChild(row);
        });

        renderFooter();
        addCellClickListeners();
        updateTotalScore();
    }

    function renderFooter() {
        const tableFoot = scoreboardTable.querySelector('tfoot');
        tableFoot.innerHTML = '';
        const subtotalRow = document.createElement('tr');
        subtotalRow.className = 'highlight-row';
        let subtotalHtml = '<td>Sum</td>';
        for (let i = 0; i < NUM_COLUMNS; i++) {
            subtotalHtml += `<td id="subtotal-col-${i}">0</td>`;
        }
        subtotalRow.innerHTML = subtotalHtml;
        tableFoot.appendChild(subtotalRow);
    }
    
    function addCellClickListeners() {
        document.querySelectorAll('.score-cell').forEach(cell => {
            cell.addEventListener('click', scoreTurn);
        });
    }

    function scoreTurn(e) {
        // Remove any existing dropdown
        const existingDropdown = document.querySelector('.score-entry-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }

        const cell = e.target;
        const category = cell.dataset.category;
        const column = parseInt(cell.dataset.column, 10);

        if (scoreCategories[category].scores[column] !== null) {
            return;
        }
        
        // Rule for Column 4 (sequential)
        if (column === 3) {
            const categoryIndex = orderedCategories.indexOf(category);
            if (categoryIndex > 0) {
                const previousCategory = orderedCategories[categoryIndex - 1];
                if (scoreCategories[previousCategory].scores[3] === null) {
                    alert(`Kolonne 4 må fylles i rekkefølge. Vennligst score '${previousCategory}' i denne kolonnen først.`);
                    return;
                }
            }
        }

        // Rule for Column 5 (reverse sequential)
        if (column === 4) {
            const categoryIndex = orderedCategories.indexOf(category);
            if (categoryIndex < orderedCategories.length - 1) {
                const nextCategory = orderedCategories[categoryIndex + 1];
                if (scoreCategories[nextCategory].scores[4] === null) {
                    alert(`Kolonne 5 må fylles i motsatt rekkefølge. Vennligst score '${nextCategory}' i denne kolonnen først.`);
                    return;
                }
            }
        }

        const options = scoreOptions[category];

        if (options) {
            // Create and position dropdown
            const dropdown = document.createElement('select');
            dropdown.className = 'score-entry-dropdown';
            
            const rect = cell.getBoundingClientRect();
            dropdown.style.position = 'absolute';
            dropdown.style.left = `${window.scrollX + rect.left}px`;
            dropdown.style.top = `${window.scrollY + rect.top}px`;
            dropdown.style.width = `${rect.width}px`;
            dropdown.style.height = `${rect.height}px`;

            const suggested = suggestedScores[category];

            // Add a placeholder option
            const placeholder = document.createElement('option');
            placeholder.textContent = 'Select';
            placeholder.disabled = true;
            placeholder.selected = true;
            dropdown.appendChild(placeholder);

            options.forEach(optValue => {
                const option = document.createElement('option');
                option.value = optValue;
                option.textContent = optValue;
                if (optValue === suggested) {
                    option.classList.add('suggested-option');
                }
                dropdown.appendChild(option);
            });

            dropdown.addEventListener('change', () => {
                const score = parseInt(dropdown.value, 10);
                updateScore(category, column, score);
                if (dropdown.parentElement) {
                    dropdown.remove();
                }
            });

            dropdown.addEventListener('blur', () => {
                if (dropdown.parentElement) {
                    dropdown.remove();
                }
            });

            document.body.appendChild(dropdown);
            dropdown.focus();

        }
    }

    function updateScore(category, column, score) {
        // Store state for undo
        lastMove = {
            category,
            column,
            turn,
        };

        scoreCategories[category].scores[column] = score;
        turn++;
        renderScoreboard();

        if (turn >= Object.keys(initialScoreCategories).length * NUM_COLUMNS) {
            endGame();
        } else {
            undoButton.disabled = false;
        }
    }

    function undoLastMove() {
        if (!lastMove) return;

        const { category, column, turn: lastTurn } = lastMove;

        // Revert score
        scoreCategories[category].scores[column] = null;

        // Revert game state
        turn = lastTurn;

        // Update UI
        renderScoreboard();

        // Disable undo button
        undoButton.disabled = true;

        // Clear last move
        lastMove = null;
    }

    function updateTotalScore() {
        let grandTotal = 0;
        const upperCategories = ['Enere', 'Toere', 'Treere', 'Firere', 'Femmere', 'Seksere'];

        for (let col = 0; col < NUM_COLUMNS; col++) {
            let columnSubtotal = 0;
            let upperScore = 0;
            let upperCategoriesFilled = 0;

            upperCategories.forEach(category => {
                const score = scoreCategories[category].scores[col];
                if (score !== null) {
                    upperScore += score;
                    upperCategoriesFilled++;
                }
            });

            for (const category in scoreCategories) {
                const score = scoreCategories[category].scores[col];
                if (score !== null) {
                    columnSubtotal += score;
                }
            }

            const bonusThresholdMet = upperScore >= 63;
            const allUpperFilled = upperCategoriesFilled === upperCategories.length;
            const bonusCell = document.getElementById(`bonus-col-${col}`);
            const bonus = bonusThresholdMet ? 50 : 0;

            if (bonusThresholdMet || allUpperFilled) {
                bonusCell.textContent = bonus;
            } else {
                bonusCell.textContent = '-';
            }

            if (bonus > 0) {
                columnSubtotal += bonus;
            }
            
            document.getElementById(`upper-subtotal-col-${col}`).textContent = upperScore;
            document.getElementById(`subtotal-col-${col}`).textContent = columnSubtotal;
            grandTotal += columnSubtotal * (col + 1);
        }
        totalScoreValue.textContent = grandTotal;
    }

    function endGame() {
        updateTotalScore();
        undoButton.disabled = true;
        const finalScore = totalScoreValue.textContent;
        alert('Spillet er over! Sluttpoengsum: ' + finalScore);
        saveHighscore(parseInt(finalScore, 10));
        displayHighscores();
    }

    function toggleHighscore() {
        sidePanel.style.display = sidePanel.style.display === 'none' ? 'block' : 'none';
    }

    function displayHighscores() {
        const highscores = JSON.parse(localStorage.getItem(HIGHSCORE_KEY)) || [];
        highscoreList.innerHTML = highscores
            .sort((a, b) => b - a)
            .slice(0, 10)
            .map(score => `<li>${score}</li>`)
            .join('');
    }

    function saveHighscore(score) {
        const highscores = JSON.parse(localStorage.getItem(HIGHSCORE_KEY)) || [];
        highscores.push(score);
        highscores.sort((a, b) => b - a);
        localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(highscores.slice(0, 10)));
    }

    initializeGame();
});
