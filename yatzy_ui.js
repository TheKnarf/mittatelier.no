document.addEventListener('DOMContentLoaded', () => {
    const HIGHSCORE_KEY = 'yatzyHighscores';

    // --- DOM Elements ---
    const diceContainer = document.getElementById('dice-container');
    const rollButton = document.getElementById('roll-button');
    const undoButton = document.getElementById('undo-button');
    const scoreboardDiv = document.getElementById('scoreboard');
    const totalScoreValue = document.getElementById('total-score-value');
    const scoreboardTable = document.getElementById('scoreboard-table');
    const toggleHighscoreButton = document.getElementById('toggle-highscore-button');
    const sidePanel = document.getElementById('side-panel');
    const highscoreList = document.getElementById('highscore-list');
    const newGameButton = document.getElementById('new-game-button');
    const clearHighscoreButton = document.getElementById('clear-highscore-button');
    const toggleTotalsumButton = document.getElementById('toggle-totalsum-button');
    
    // --- Game Rules (from game module) ---
    const { ORDERED_CATEGORIES, NUM_COLUMNS } = YatzyGame.getRules();

    // --- Rendering Functions ---
    function renderDice(state) {
        diceContainer.innerHTML = '';
        state.dice.forEach((value, index) => {
            const die = document.createElement('div');
            die.className = 'dice';
            die.classList.add(`face-${value}`);
            if (state.held[index]) die.classList.add('held');
            if (state.waitingForNextTurn) die.classList.add('scored');

            for (let i = 0; i < value; i++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                die.appendChild(dot);
            }
            if (!state.waitingForNextTurn) {
                die.addEventListener('click', () => handleToggleHold(index));
            }
            diceContainer.appendChild(die);
        });
    }

    function renderScoreboard(state) {
        const tableBody = scoreboardDiv;
        tableBody.innerHTML = '';

        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th></th>';
        for (let i = 1; i <= NUM_COLUMNS; i++) {
            headerRow.innerHTML += `<th>${i} <span class="header-icon">${i === 4 ? '↓' : i === 5 ? '↑' : i === 6 ? '①' : ''}</span></th>`;
        }
        scoreboardTable.querySelector('thead').innerHTML = '';
        scoreboardTable.querySelector('thead').appendChild(headerRow);

        const upperSection = ORDERED_CATEGORIES.slice(0, 6);
        const lowerSection = ORDERED_CATEGORIES.slice(6);

        upperSection.forEach(category => tableBody.appendChild(createCategoryRow(category, state)));
        tableBody.appendChild(createSubtotalRow('Sum øvre', 'upper-subtotal-row'));
        tableBody.appendChild(createSubtotalRow('Bonus', 'bonus-row'));
        lowerSection.forEach(category => tableBody.appendChild(createCategoryRow(category, state)));

        renderFooter();
        updateTotalScore(state);
    }
    
    function createCategoryRow(category, state) {
        const row = document.createElement('tr');
        let rowHtml = `<td>${category}</td>`;
        state.scores[category].scores.forEach((score, colIndex) => {
            const isFilled = score !== null;
            rowHtml += `<td class="score-cell ${isFilled ? 'filled-cell' : ''}" data-category="${category}" data-column="${colIndex}">${isFilled ? (score === 0 ? '—' : score) : ''}</td>`;
        });
        row.innerHTML = rowHtml;
        return row;
    }

    function createSubtotalRow(name, className) {
        const row = document.createElement('tr');
        row.className = `highlight-row ${className}`;
        let html = `<td>${name}</td>`;
        for (let i = 0; i < NUM_COLUMNS; i++) {
            html += `<td id="${className.replace(/-/g, '_')}_${i}"></td>`;
        }
        row.innerHTML = html;
        return row;
    }

    function renderFooter() {
        const tableFoot = scoreboardTable.querySelector('tfoot');
        tableFoot.innerHTML = '';
        const subtotalRow = createSubtotalRow('Sum', 'subtotal-row');
        subtotalRow.id = 'sum-row';
        tableFoot.appendChild(subtotalRow);
    }
    
    function updateTotalScore(state) {
        let grandTotal = 0;
        const upperCategories = ORDERED_CATEGORIES.slice(0, 6);

        for (let col = 0; col < NUM_COLUMNS; col++) {
            let columnSubtotal = 0, upperScore = 0, upperCategoriesFilled = 0;

            ORDERED_CATEGORIES.forEach(category => {
                const score = state.scores[category].scores[col];
                if (score !== null) {
                    columnSubtotal += score;
                    if (upperCategories.includes(category)) {
                        upperScore += score;
                        upperCategoriesFilled++;
                    }
                }
            });
            
            const bonusThresholdMet = upperScore >= 63;
            const allUpperFilled = upperCategoriesFilled === upperCategories.length;
            const bonusCell = document.getElementById(`bonus_row_${col}`);
            const bonus = bonusThresholdMet ? 50 : 0;

            if (bonusThresholdMet || allUpperFilled) {
                bonusCell.textContent = bonus;
                if(bonus > 0) columnSubtotal += bonus;
            } else {
                bonusCell.textContent = '-';
            }
            
            document.getElementById(`upper_subtotal_row_${col}`).textContent = upperScore;
            document.getElementById(`subtotal_row_${col}`).textContent = columnSubtotal;
            grandTotal += columnSubtotal * (col + 1);
        }
        totalScoreValue.textContent = grandTotal;
        return grandTotal;
    }

    // --- UI Update & Event Handlers ---
    function updateUI() {
        const state = YatzyGame.getState();
        renderDice(state);
        renderScoreboard(state);
        undoButton.disabled = !state.lastMove;
        rollButton.disabled = state.rollsLeft === 0 && !state.waitingForNextTurn;
        rollButton.textContent = state.waitingForNextTurn ? 'Neste tur' : `Kast terningene (${state.rollsLeft} igjen)`;

        if (state.isGameOver) {
            const finalScore = updateTotalScore(state);
            rollButton.disabled = true;
            rollButton.textContent = 'Spillet er over';
            undoButton.disabled = true;
            document.getElementById('total-score').style.display = 'block';
            setTimeout(() => {
                alert('Spillet er over! Sluttpoengsum: ' + finalScore);
                saveHighscore(finalScore);
                displayHighscores();
            }, 0);
        }
    }

    function handleToggleHold(index) {
        YatzyGame.toggleHold(index);
        updateUI();
    }

    function handleRollDice() {
        if (rollButton.disabled) return;

        const state = YatzyGame.getState();
        rollButton.disabled = true;
        document.querySelectorAll('.dice').forEach((die, index) => {
            if (state.waitingForNextTurn || !state.held[index]) {
                die.classList.add('rolling');
            }
        });

        setTimeout(() => {
            YatzyGame.rollDice();
            updateUI();
        }, 500);
    }
    
    function handleScoreTurn(category, column) {
        const result = YatzyGame.scoreTurn(category, column);
        if (result && result.error) {
            alert(result.error);
        } else if (!result || !result.cancelled) {
            updateUI();
        }
    }

    function handleUndo() {
        YatzyGame.undo();
        updateUI();
    }

    // --- Highscore Functions ---
    function displayHighscores() {
        const highscores = JSON.parse(localStorage.getItem(HIGHSCORE_KEY)) || [];
        highscoreList.innerHTML = highscores.sort((a, b) => b - a).slice(0, 10).map(score => `<li>${score}</li>`).join('');
    }

    function saveHighscore(score) {
        const highscores = JSON.parse(localStorage.getItem(HIGHSCORE_KEY)) || [];
        highscores.push(score);
        highscores.sort((a, b) => b - a);
        localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(highscores.slice(0, 10)));
    }

    // --- Initial Setup ---
    function addEventListeners() {
        rollButton.addEventListener('click', handleRollDice);
        undoButton.addEventListener('click', handleUndo);
        newGameButton.addEventListener('click', () => {
            const state = YatzyGame.getState();
            const isGameInProgress = state.turn > 0 && !state.isGameOver;
            if (isGameInProgress) {
                if (confirm('Er du sikker på at du vil starte et nytt spill? All fremgang vil gå tapt.')) {
                    YatzyGame.resetGame();
                }
            } else {
                YatzyGame.resetGame();
            }
        });
        toggleHighscoreButton.addEventListener('click', () => {
            sidePanel.style.display = sidePanel.style.display === 'none' ? 'block' : 'none';
        });
        clearHighscoreButton.addEventListener('click', () => {
            if (confirm('Er du sikker på at du vil slette alle highscores?')) {
                localStorage.removeItem(HIGHSCORE_KEY);
                displayHighscores();
            }
        });
        toggleTotalsumButton.addEventListener('click', () => {
            const totalScoreEl = document.getElementById('total-score');
            totalScoreEl.style.display = totalScoreEl.style.display === 'none' ? 'block' : 'none';
        });
        scoreboardDiv.addEventListener('click', (e) => {
            if (e.target.matches('.score-cell:not(.filled-cell)')) {
                handleScoreTurn(e.target.dataset.category, parseInt(e.target.dataset.column, 10));
            }
        });
    }

    addEventListeners();
    updateUI();
    displayHighscores();
});
