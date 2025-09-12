document.addEventListener('DOMContentLoaded', () => {
    const NUM_COLUMNS = 6;
    // Game state
    let dice = [1, 1, 1, 1, 1];
    let held = [false, false, false, false, false];
    let rollsLeft = 3;
    let turn = 0;
    let diceWereHeldThisTurn = false;

    // DOM Elements
    const diceContainer = document.getElementById('dice-container');
    const rollButton = document.getElementById('roll-button');
    const scoreboardDiv = document.getElementById('scoreboard'); // This will be the table body
    const totalScoreValue = document.getElementById('total-score-value');
    const scoreboardTable = document.getElementById('scoreboard-table');

    const scoreCategories = {
        // Upper Section
        'Enere': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => d.filter(v => v === 1).length * 1 },
        'Toere': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => d.filter(v => v === 2).length * 2 },
        'Treere': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => d.filter(v => v === 3).length * 3 },
        'Firere': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => d.filter(v => v === 4).length * 4 },
        'Femmere': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => d.filter(v => v === 5).length * 5 },
        'Seksere': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => d.filter(v => v === 6).length * 6 },
        // Lower Section
        'Ett par': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => calcPairs(d, 1) },
        'To par': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => calcPairs(d, 2) },
        'Tre like': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => calcOfAKindScore(d, 3) },
        'Fire like': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => calcOfAKindScore(d, 4) },
        'Liten straight': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => isStraight(d, 4) ? 15 : 0 },
        'Stor straight': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => isStraight(d, 5) ? 20 : 0 },
        'Hus': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => isFullHouse(d) ? d.reduce((a, b) => a + b, 0) : 0 },
        'Sjanse': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => d.reduce((a, b) => a + b, 0) },
        'Yatzy': { scores: new Array(NUM_COLUMNS).fill(null), calc: (d) => ofAKind(d, 5) ? 50 : 0 }
    };
    
    const orderedCategories = ['Enere', 'Toere', 'Treere', 'Firere', 'Femmere', 'Seksere', 'Ett par', 'To par', 'Tre like', 'Fire like', 'Liten straight', 'Stor straight', 'Hus', 'Sjanse', 'Yatzy'];

    function initializeGame() {
        renderDice();
        renderScoreboard();
        rollButton.textContent = 'Kast terningene';
        rollButton.addEventListener('click', rollDice);
    }

    function renderDice() {
        diceContainer.innerHTML = '';
        dice.forEach((value, index) => {
            const die = document.createElement('div');
            die.className = 'dice';
            if (held[index]) {
                die.classList.add('held');
            }
            die.textContent = value;
            die.addEventListener('click', () => toggleHold(index));
            diceContainer.appendChild(die);
        });
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
            cell.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                const column = parseInt(e.target.dataset.column, 10);
                scoreTurn(category, column);
            });
        });
    }

    function rollDice() {
        if (rollsLeft > 0) {
            rollsLeft--;
            dice = dice.map((d, i) => held[i] ? d : Math.floor(Math.random() * 6) + 1);
            renderDice();
            rollButton.textContent = `Kast terningene (${rollsLeft} igjen)`;
            if (rollsLeft === 0) {
                rollButton.disabled = true;
            }
        }
    }

    function toggleHold(index) {
        if (rollsLeft < 3) { // Can't hold before first roll
            diceWereHeldThisTurn = true;
            held[index] = !held[index];
            renderDice();
        }
    }

    function scoreTurn(category, column) {
        // Rule for Column 6
        if (column === 5 && diceWereHeldThisTurn) {
            alert('Kolonne 6-poeng må komme fra ett enkelt kast med alle fem terningene. Du kan ikke holde terninger for denne kolonnen.');
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

        if (scoreCategories[category].scores[column] === null && rollsLeft < 3) {
            const score = scoreCategories[category].calc(dice);
            scoreCategories[category].scores[column] = score;
            nextTurn();
        }
    }

    function nextTurn() {
        turn++;
        rollsLeft = 3;
        held = [false, false, false, false, false];
        diceWereHeldThisTurn = false;
        dice = [1, 1, 1, 1, 1];
        rollButton.disabled = false;
        rollButton.textContent = 'Kast terningene';

        if (turn >= Object.keys(scoreCategories).length * NUM_COLUMNS) {
            endGame();
        } else {
            renderDice();
            renderScoreboard();
        }
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
        rollButton.disabled = true;
        rollButton.textContent = 'Spillet er over';
        alert('Spillet er over! Sluttpoengsum: ' + totalScoreValue.textContent);
    }

    // --- Calculation helpers ---
    function getCounts(dice) {
        return dice.reduce((counts, d) => {
            counts[d] = (counts[d] || 0) + 1;
            return counts;
        }, {});
    }

    function calcPairs(dice, numPairs) {
        const counts = getCounts(dice);
        const pairs = Object.keys(counts).filter(val => counts[val] >= 2).map(Number).sort((a, b) => b - a);
        if (pairs.length < numPairs) return 0;
        let score = 0;
        for(let i = 0; i < numPairs; i++) {
            score += pairs[i] * 2;
        }
        return score;
    }

    function calcOfAKindScore(dice, n) {
        const counts = getCounts(dice);
        const kindValue = Object.keys(counts).find(val => counts[val] >= n);
        if (kindValue) {
            return parseInt(kindValue) * n;
        }
        return 0;
    }

    function ofAKind(dice, n) {
        const counts = getCounts(dice);
        return Object.values(counts).some(count => count >= n);
    }

    function isFullHouse(dice) {
        const counts = getCounts(dice);
        const values = Object.values(counts);
        return values.includes(3) && values.includes(2);
    }

    function isStraight(dice, n) {
        const uniqueDice = [...new Set(dice)].sort();
        if (uniqueDice.length < n) return false;
        let count = 1;
        for (let i = 0; i < uniqueDice.length - 1; i++) {
            if (uniqueDice[i+1] === uniqueDice[i] + 1) {
                count++;
                if (count >= n) return true;
            } else {
                count = 1;
            }
        }
        return false;
    }

    initializeGame();
});
