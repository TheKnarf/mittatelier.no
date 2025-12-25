const YatzyGame = (() => {
    const NUM_COLUMNS = 6;

    // --- Static Rules and Definitions ---
    const CATEGORY_RULES = {
        'Enere': { calc: (d) => d.filter(v => v === 1).length * 1 },
        'Toere': { calc: (d) => d.filter(v => v === 2).length * 2 },
        'Treere': { calc: (d) => d.filter(v => v === 3).length * 3 },
        'Firere': { calc: (d) => d.filter(v => v === 4).length * 4 },
        'Femmere': { calc: (d) => d.filter(v => v === 5).length * 5 },
        'Seksere': { calc: (d) => d.filter(v => v === 6).length * 6 },
        'Ett par': { calc: (d) => calcPairs(d, 1) },
        'To par': { calc: (d) => calcPairs(d, 2) },
        'Tre like': { calc: (d) => calcOfAKindScore(d, 3) },
        'Fire like': { calc: (d) => calcOfAKindScore(d, 4) },
        'Liten straight': { calc: (d) => new Set(d).size === 5 && !d.includes(6) ? 15 : 0 },
        'Stor straight': { calc: (d) => new Set(d).size === 5 && !d.includes(1) ? 20 : 0 },
        'Hus': { calc: (d) => isFullHouse(d) ? d.reduce((a, b) => a + b, 0) : 0 },
        'Sjanse': { calc: (d) => d.reduce((a, b) => a + b, 0) },
        'Yatzy': { calc: (d) => ofAKind(d, 5) ? 50 : 0 }
    };
    const ORDERED_CATEGORIES = ['Enere', 'Toere', 'Treere', 'Firere', 'Femmere', 'Seksere', 'Ett par', 'To par', 'Tre like', 'Fire like', 'Liten straight', 'Stor straight', 'Hus', 'Sjanse', 'Yatzy'];

    // --- Dynamic State ---
    let state = {};

    function getInitialState() {
        const initialState = {
            dice: [1, 1, 1, 1, 1],
            held: [false, false, false, false, false],
            rollsLeft: 3,
            turn: 0,
            diceRolledCount: 0,
            waitingForNextTurn: false,
            isGameOver: false,
            scores: {},
            lastMove: null
        };
        ORDERED_CATEGORIES.forEach(cat => {
            initialState.scores[cat] = { scores: new Array(NUM_COLUMNS).fill(null) };
        });
        return initialState;
    }

    // --- Calculation helpers ---
    function getCounts(dice) { return dice.reduce((c, d) => { c[d] = (c[d] || 0) + 1; return c; }, {}); }
    function calcPairs(dice, numPairs) { const pairs = Object.keys(getCounts(dice)).filter(v => getCounts(dice)[v] >= 2).map(Number).sort((a,b)=>b-a); return pairs.length < numPairs ? 0 : pairs.slice(0,numPairs).reduce((s,p)=>s+p*2,0); }
    function calcOfAKindScore(dice, n) { const kind = Object.keys(getCounts(dice)).find(v => getCounts(dice)[v] >= n); return kind ? parseInt(kind) * n : 0; }
    function ofAKind(dice, n) { return Object.values(getCounts(dice)).some(c => c >= n); }
    function isFullHouse(dice) { const v = Object.values(getCounts(dice)); return v.includes(3) && v.includes(2); }

    // --- Public API ---
    const publicApi = {
        init: () => {
            state = getInitialState();
        },
        getState: () => JSON.parse(JSON.stringify(state)),
        getRules: () => ({ CATEGORY_RULES, ORDERED_CATEGORIES, NUM_COLUMNS }),
        
        resetGame: () => {
            location.reload();
        },

        toggleHold: (index) => {
            if (state.rollsLeft < 3) {
                state.held[index] = !state.held[index];
            }
        },

        rollDice: () => {
            if (state.rollsLeft <= 0 && !state.waitingForNextTurn) return;

            const isNewTurn = state.waitingForNextTurn;
            if (isNewTurn) {
                state.waitingForNextTurn = false;
                state.rollsLeft = 3;
                state.held.fill(false);
                state.diceRolledCount = 5;
                state.lastMove = null;
            } else {
                state.diceRolledCount = state.held.filter(h => !h).length;
            }

            if (state.rollsLeft > 0) {
                state.rollsLeft--;
                state.dice = state.dice.map((d, i) => (isNewTurn || !state.held[i]) ? Math.floor(Math.random() * 6) + 1 : d);
            }
        },

        scoreTurn: (category, column) => {
            if (state.waitingForNextTurn || state.scores[category].scores[column] !== null || state.rollsLeft >= 3) {
                return { error: 'Invalid move' };
            }
            if (column === 3) { /* ... sequential rule ... */ }
            if (column === 4) { /* ... reverse sequential rule ... */ }

            const score = (column === 5 && state.diceRolledCount < 5) ? 0 : CATEGORY_RULES[category].calc(state.dice);
            
            if (column === 5 && score === 0) {
                if (!confirm('Er du sikker på at du vil stryke i kolonne 6?')) {
                    return { cancelled: true };
                }
            }

            state.lastMove = JSON.parse(JSON.stringify(state));

            state.scores[category].scores[column] = score;
            state.waitingForNextTurn = true;
            state.turn++;
            
            if (state.turn >= ORDERED_CATEGORIES.length * NUM_COLUMNS) {
                state.isGameOver = true;
            }
        },

        undo: () => {
            if (state.lastMove) {
                state = state.lastMove; // lastMove is already a clean data object
            }
        }
    };
    
    publicApi.init();
    return publicApi;
})();
