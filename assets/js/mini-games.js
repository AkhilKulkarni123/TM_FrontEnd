/**
 * Mini-Games System for Snakes & Ladders Educational Game
 * Contains 25 unique mini-games (5 per lesson topic)
 * Each game is designed to be 30-60 seconds and related to the lesson content
 */

(function() {
    'use strict';

    // Game configuration
    const GAME_DURATION = 45000; // 45 seconds default
    const CHALLENGE_DURATION = 40000; // Slightly harder pace for board challenge rounds
    const GAMES_PER_LESSON = 5;

    // =====================================================
    // LESSON 1: AP CSP Programming Fundamentals
    // Games: Binary Converter, Variable Scope Explorer, Data Type Detective, Algorithm Sorter, Debug Detective
    // =====================================================

    const LESSON_1_GAMES = {
        // Game 1: Binary Converter - Convert decimal to binary (AP CSP 2.3)
        binaryConverter: {
            name: 'Binary Converter',
            description: 'Convert decimal numbers to binary! Essential for computer representation!',
            init: function(container, onComplete) {
                const state = { score: 0, total: 5, completed: false };
                const challenges = [
                    { decimal: 5, binary: '101' },
                    { decimal: 10, binary: '1010' },
                    { decimal: 13, binary: '1101' },
                    { decimal: 21, binary: '10101' },
                    { decimal: 42, binary: '101010' }
                ];
                
                container.innerHTML = `
                    <div class="mini-game binary-converter" style="width: 100%;">
                        <div class="game-header">
                            <div class="game-timer"><span id="timer">45</span>s</div>
                            <span class="game-title">💾 Binary Converter</span>
                            <div class="game-score">Score: <span id="score">0</span>/${state.total}</div>
                        </div>
                        <div class="game-instructions" style="margin-bottom: 15px; font-size: 0.9em;">
                            <strong>🎯 Goal:</strong> Convert decimal numbers to binary (base-2). Computers store all data as binary!
                            <strong style="margin-left: 10px;">💡 AP CSP:</strong> Topic 2.3 - Data Representation
                        </div>
                        <div class="conversion-area" id="conversion-area" style="width: 100%;"></div>
                    </div>
                `;
                
                const conversionArea = container.querySelector('#conversion-area');
                let currentChallenge = 0;
                
                function showChallenge() {
                    if (currentChallenge >= challenges.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }
                    
                    const challenge = challenges[currentChallenge];
                    conversionArea.innerHTML = `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; text-align: center;">
                                <div style="font-size: 1.2em; font-weight: bold; color: #1976d2; margin-bottom: 10px;">Decimal</div>
                                <div style="font-size: 2em; font-weight: bold; color: #0d47a1;">${challenge.decimal}</div>
                            </div>
                            <div style="background: #f3e5f5; padding: 20px; border-radius: 10px; text-align: center;">
                                <div style="font-size: 1.2em; font-weight: bold; color: #7b1fa2; margin-bottom: 10px;">Binary</div>
                                <input type="text" id="binary-input" placeholder="Enter binary" style="font-size: 1.5em; padding: 10px; border: 2px solid #9c27b0; border-radius: 8px; text-align: center; width: 100%;">
                            </div>
                        </div>
                        <button id="check-binary" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #4caf50, #45a049); color: white; border: none; border-radius: 10px; font-size: 1.1em; font-weight: bold; cursor: pointer;">Check Answer</button>
                    `;
                    
                    const input = container.querySelector('#binary-input');
                    const checkBtn = container.querySelector('#check-binary');
                    
                    checkBtn.addEventListener('click', () => {
                        if (input.value.trim() === challenge.binary) {
                            state.score++;
                            container.querySelector('#score').textContent = state.score;
                            currentChallenge++;
                            showChallenge();
                        } else {
                            input.style.borderColor = '#f44336';
                            setTimeout(() => {
                                input.style.borderColor = '#9c27b0';
                            }, 500);
                        }
                    });
                    
                    input.focus();
                }
                
                showChallenge();
                startTimer(container.querySelector('#timer'), CHALLENGE_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.score / state.total) * 100));
                });
                
                return state;
            }
        },

        // Game 2: Data Type Detective - Identify data types (AP CSP 2.2)
        dataTypeDetective: {
            name: 'Data Type Detective',
            description: 'Identify data types! Critical for understanding variables in programming!',
            init: function(container, onComplete) {
                const state = { score: 0, total: 8, completed: false };
                
                const challenges = [
                    { value: '42', type: 'Number', hint: 'Whole numbers' },
                    { value: '"hello"', type: 'String', hint: 'Text in quotes' },
                    { value: 'true', type: 'Boolean', hint: 'True or false' },
                    { value: '[1,2,3]', type: 'Array/List', hint: 'Square brackets' },
                    { value: '3.14', type: 'Number', hint: 'Decimal numbers' },
                    { value: 'null', type: 'Null/None', hint: 'Empty value' },
                    { value: '{name:"John"}', type: 'Object', hint: 'Curly braces' },
                    { value: 'false', type: 'Boolean', hint: 'True or false' }
                ];
                
                const shuffled = [...challenges].sort(() => Math.random() - 0.5);
                
                container.innerHTML = `
                    <div class="mini-game data-type-detective" style="width: 100%;">
                        <div class="game-header">
                            <div class="game-timer"><span id="timer">45</span>s</div>
                            <span class="game-title">🔍 Data Type Detective</span>
                            <div class="game-score">Found: <span id="score">0</span>/${state.total}</div>
                        </div>
                        <div class="game-instructions" style="margin-bottom: 15px;">
                            <strong>📋 Instructions:</strong> Look at the value and identify its data type.
                            <strong style="margin-left: 10px;">💡 AP CSP:</strong> Topic 2.2 - Data Types
                        </div>
                        <div class="detective-area" id="detective-area" style="width: 100%;"></div>
                    </div>
                `;
                
                const detectiveArea = container.querySelector('#detective-area');
                let currentChallenge = 0;
                
                function showChallenge() {
                    if (currentChallenge >= shuffled.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }
                    
                    const challenge = shuffled[currentChallenge];
                    const types = ['Number', 'String', 'Boolean', 'Array/List', 'Object', 'Null/None'];
                    
                    detectiveArea.innerHTML = `
                        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                            <div style="font-size: 1.1em; margin-bottom: 10px; color: #333;">What data type is this value?</div>
                            <div style="font-size: 1.8em; font-weight: bold; font-family: monospace; background: #333; color: #4caf50; padding: 15px; border-radius: 8px; margin: 10px 0;">${challenge.value}</div>
                            <div style="font-size: 0.9em; color: #666; font-style: italic;">Hint: ${challenge.hint}</div>
                        </div>
                        <div class="type-options" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;"></div>
                    `;
                    
                    const optionsContainer = detectiveArea.querySelector('.type-options');
                    types.forEach(type => {
                        const btn = document.createElement('button');
                        btn.className = 'type-btn';
                        btn.textContent = type;
                        btn.style.cssText = 'padding: 12px; background: #e3f2fd; border: 2px solid #2196f3; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;';
                        
                        btn.addEventListener('click', () => {
                            if (type === challenge.type) {
                                state.score++;
                                container.querySelector('#score').textContent = state.score;
                                btn.style.background = '#4caf50';
                                btn.style.borderColor = '#2e7d32';
                                btn.style.color = 'white';
                                setTimeout(() => {
                                    currentChallenge++;
                                    showChallenge();
                                }, 500);
                            } else {
                                btn.style.background = '#f44336';
                                btn.style.borderColor = '#d32f2f';
                                setTimeout(() => {
                                    btn.style.background = '#e3f2fd';
                                    btn.style.borderColor = '#2196f3';
                                }, 500);
                            }
                        });
                        
                        optionsContainer.appendChild(btn);
                    });
                }
                
                showChallenge();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.score / state.total) * 100));
                });
                
                return state;
            }
        },

        // Game 3: If-Then Tower - Evaluate conditionals (AP CSP 2.4)
        ifThenTower: {
            name: 'If-Then Tower',
            description: 'Master conditional logic! Build towers by evaluating boolean expressions!',
            init: function(container, onComplete) {
                const state = { height: 0, target: 6, completed: false };

                const conditions = [
                    { condition: 'age >= 18', trueBlock: 'blue', falseBlock: 'red', value: 21, context: 'Voting eligibility' },
                    { condition: 'score >= 60', trueBlock: 'green', falseBlock: 'orange', value: 75, context: 'Passing grade' },
                    { condition: 'hasPermission === true', trueBlock: 'purple', falseBlock: 'gray', value: true, context: 'Access granted' },
                    { condition: 'temperature > 32', trueBlock: 'yellow', falseBlock: 'lightblue', value: 98, context: 'Water boiling' },
                    { condition: 'username !== null', trueBlock: 'gold', falseBlock: 'silver', value: 'student123', context: 'Login check' },
                    { condition: 'batteryLevel <= 20', trueBlock: 'red', falseBlock: 'green', value: 15, context: 'Low battery warning' }
                ];

                container.innerHTML = `
                    <div class="mini-game if-then-tower" style="width: 100%;">
                        <div class="game-header">
                            <div class="game-timer"><span id="timer">45</span>s</div>
                            <span class="game-title">🏗️ If-Then Tower</span>
                            <div class="game-score">Height: <span id="score">0</span>/6</div>
                        </div>
                        <div class="game-instructions" style="margin-bottom: 10px; font-size: 0.95em;">
                            <strong>🎯 Goal:</strong> Evaluate if-statements. If TRUE, pick the first color; if FALSE, pick the second.
                            <strong style="margin-left: 10px;">💡 AP CSP:</strong> Topic 2.4 - Conditional Statements
                        </div>
                        <div class="game-layout-horizontal" style="display: flex; gap: 50px; align-items: flex-start; flex-wrap: nowrap; width: 100%;">
                            <div class="game-visual-area" style="flex-shrink: 0;">
                                <div class="tower" id="tower" style="display:flex;flex-direction:column-reverse;align-items:center;min-height:220px;min-width:150px;border-bottom:4px solid #333;padding:15px;background:#f8f9fa;border-radius:12px;"></div>
                            </div>
                            <div class="game-controls-area" style="flex: 1; min-width: 450px;">
                                <div class="condition-panel" id="condition-panel"></div>
                            </div>
                        </div>
                    </div>
                `;

                const tower = container.querySelector('#tower');
                const panel = container.querySelector('#condition-panel');
                tower.style.cssText = 'display:flex;flex-direction:column-reverse;align-items:center;min-height:200px;border-bottom:4px solid #333;';

                function nextCondition() {
                    if (state.height >= state.target) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }

                    const cond = conditions[state.height];
                    const isTrue = eval(cond.condition.replace(/score|lives|time|level|coins|health/g, cond.value));
                    const correctBlock = isTrue ? cond.trueBlock : cond.falseBlock;

                    panel.innerHTML = `
                        <div class="condition-text" style="margin-bottom:10px;font-family:monospace;background:#1e1e1e;color:#d4d4d4;padding:10px;border-radius:8px;">
                            if (${cond.condition}) { add ${cond.trueBlock} } else { add ${cond.falseBlock} }
                            <br><small style="color:#888;">Context: ${cond.context} | Current value: ${cond.value}</small>
                        </div>
                        <div class="block-choices" style="display:flex;gap:10px;justify-content:center;">
                            <button class="block-btn" data-block="${cond.trueBlock}" style="padding:15px 30px;background:${cond.trueBlock};border:none;border-radius:8px;cursor:pointer;font-weight:bold;color:${cond.trueBlock === 'yellow' || cond.trueBlock === 'gold' ? '#333' : '#fff'};">${cond.trueBlock}</button>
                            <button class="block-btn" data-block="${cond.falseBlock}" style="padding:15px 30px;background:${cond.falseBlock};border:none;border-radius:8px;cursor:pointer;font-weight:bold;color:${cond.falseBlock === 'yellow' || cond.falseBlock === 'gold' || cond.falseBlock === 'pink' ? '#333' : '#fff'};">${cond.falseBlock}</button>
                        </div>
                    `;

                    panel.querySelectorAll('.block-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            if (btn.dataset.block === correctBlock) {
                                const block = document.createElement('div');
                                block.style.cssText = `width:${80 - state.height * 8}px;height:25px;background:${correctBlock};border-radius:4px;margin:2px;`;
                                tower.appendChild(block);
                                state.height++;
                                nextCondition();
                            } else {
                                btn.style.opacity = '0.5';
                                btn.disabled = true;
                            }
                        });
                    });
                }

                nextCondition();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.height / state.target) * 100));
                });

                return state;
            }
        },

        // Game 4: Bug Squasher - Find errors in code
        bugSquasher: {
            name: 'Bug Squasher',
            description: 'Spot the bugs in the code! Click on the line with the error.',
            init: function(container, onComplete) {
                const state = { found: 0, total: 5, completed: false };

                const buggyCode = [
                    { lines: ['let x = 10;', 'let y = 20', 'console.log(x + y);'], bugLine: 1, hint: 'Missing semicolon' },
                    { lines: ['function add(a, b) {', '  return a + b', '}'], bugLine: 1, hint: 'Missing semicolon' },
                    { lines: ['let name = "Alice";', 'console.log(Name);', '// prints name'], bugLine: 1, hint: 'Case sensitivity - Name vs name' },
                    { lines: ['for (let i = 0; i < 5; i++) {', '  console.log(i)', '}'], bugLine: 1, hint: 'Missing semicolon' },
                    { lines: ['let arr = [1, 2, 3];', 'arr.push(4;', 'console.log(arr);'], bugLine: 1, hint: 'Missing closing parenthesis' }
                ];

                container.innerHTML = `
                    <div class="mini-game bug-squasher" style="width: 100%;">
                        <div class="game-header">
                            <div class="game-timer"><span id="timer">45</span>s</div>
                            <span class="game-title">🐛 Bug Squasher</span>
                            <div class="game-score">Bugs Found: <span id="score">0</span>/${state.total}</div>
                        </div>
                        <div class="game-instructions" style="margin-bottom: 15px;">
                            <strong>📋 Instructions:</strong> Look at the code below and find the buggy line. The hint tells you what to look for. Click on the line with the bug!
                        </div>
                        <div class="code-display" id="code-display" style="min-height: 150px; width: 100%;"></div>
                        <div class="hint-box" id="hint-box" style="display:none; margin-top: 15px; width: 100%;"></div>
                    </div>
                `;

                const codeDisplay = container.querySelector('#code-display');
                const hintBox = container.querySelector('#hint-box');
                let currentBug = 0;

                function showCode() {
                    if (currentBug >= buggyCode.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }

                    const bug = buggyCode[currentBug];
                    codeDisplay.innerHTML = `
                        <div class="code-block" style="background:#1e1e1e;padding:15px;border-radius:10px;font-family:monospace;">
                            ${bug.lines.map((line, i) => `
                                <div class="code-line" data-line="${i}" style="padding:5px 10px;margin:2px 0;border-radius:4px;cursor:pointer;color:#d4d4d4;transition:background 0.2s;">
                                    <span style="color:#666;margin-right:10px;">${i + 1}</span>${escapeHtml(line)}
                                </div>
                            `).join('')}
                        </div>
                    `;

                    hintBox.style.cssText = 'display:block;background:#fff3cd;padding:10px;border-radius:8px;margin-top:10px;';
                    hintBox.textContent = 'Hint: ' + bug.hint;

                    codeDisplay.querySelectorAll('.code-line').forEach(line => {
                        line.addEventListener('click', () => {
                            const lineNum = parseInt(line.dataset.line);
                            if (lineNum === bug.bugLine) {
                                line.style.background = '#28a745';
                                line.style.color = '#fff';
                                state.found++;
                                container.querySelector('#score').textContent = state.found;
                                currentBug++;
                                setTimeout(showCode, 500);
                            } else {
                                line.style.background = '#dc3545';
                                line.style.color = '#fff';
                                setTimeout(() => {
                                    line.style.background = 'transparent';
                                    line.style.color = '#d4d4d4';
                                }, 300);
                            }
                        });
                    });
                }

                showCode();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.found / state.total) * 100));
                });

                return state;
            }
        },

        // Game 5: Algorithm Chef - Arrange recipe steps
        algorithmChef: {
            name: 'Algorithm Chef',
            description: 'Arrange the recipe steps in the correct order!',
            init: function(container, onComplete) {
                const state = { completed: false };

                const recipes = [
                    {
                        name: 'Make a Sandwich',
                        steps: ['Get bread slices', 'Add peanut butter', 'Add jelly', 'Put slices together', 'Serve']
                    },
                    {
                        name: 'Boil Water',
                        steps: ['Fill pot with water', 'Place pot on stove', 'Turn on heat', 'Wait for bubbles', 'Turn off heat']
                    },
                    {
                        name: 'Login to Website',
                        steps: ['Open browser', 'Enter URL', 'Click login button', 'Enter credentials', 'Submit form']
                    }
                ];

                const recipe = recipes[Math.floor(Math.random() * recipes.length)];
                const shuffled = [...recipe.steps].sort(() => Math.random() - 0.5);

                container.innerHTML = `
                    <div class="mini-game algorithm-chef" style="width: 100%;">
                        <div class="game-header">
                            <div class="game-timer"><span id="timer">45</span>s</div>
                            <span class="game-title">👨‍🍳 Algorithm Chef: ${recipe.name}</span>
                        </div>
                        <div class="game-instructions" style="margin-bottom: 15px;">
                            <strong>📋 Instructions:</strong> Drag and drop the steps to arrange them in the correct logical order. Think: What must happen FIRST?
                        </div>
                        <div class="steps-container" id="steps-container" style="width: 100%; max-width: 700px; margin: 0 auto;"></div>
                        <button id="check-order" style="display:block;margin:20px auto;padding:14px 50px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:10px;cursor:pointer;font-weight:bold;font-size:1.1em;">✅ Check Order</button>
                    </div>
                `;

                const stepsContainer = container.querySelector('#steps-container');
                stepsContainer.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

                shuffled.forEach((step, i) => {
                    const div = document.createElement('div');
                    div.className = 'step-item';
                    div.draggable = true;
                    div.dataset.step = step;
                    div.innerHTML = `<span class="step-num">${i + 1}</span> ${step}`;
                    div.style.cssText = 'padding:12px;background:#f8f9fa;border:2px solid #dee2e6;border-radius:8px;cursor:grab;display:flex;align-items:center;gap:10px;transition:all 0.2s;';

                    div.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', i);
                        div.style.opacity = '0.5';
                    });
                    div.addEventListener('dragend', () => div.style.opacity = '1');
                    div.addEventListener('dragover', (e) => e.preventDefault());
                    div.addEventListener('drop', (e) => {
                        e.preventDefault();
                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        const items = [...stepsContainer.children];
                        const toIndex = items.indexOf(div);
                        if (fromIndex !== toIndex) {
                            const item = items[fromIndex];
                            if (fromIndex < toIndex) {
                                div.after(item);
                            } else {
                                div.before(item);
                            }
                            updateNumbers();
                        }
                    });

                    stepsContainer.appendChild(div);
                });

                function updateNumbers() {
                    stepsContainer.querySelectorAll('.step-item').forEach((el, i) => {
                        el.querySelector('.step-num').textContent = i + 1;
                    });
                }

                container.querySelector('#check-order').addEventListener('click', () => {
                    const current = [...stepsContainer.querySelectorAll('.step-item')].map(el => el.dataset.step);
                    const correct = recipe.steps.every((step, i) => step === current[i]);

                    if (correct) {
                        state.completed = true;
                        stepsContainer.querySelectorAll('.step-item').forEach(el => {
                            el.style.background = '#d4edda';
                            el.style.borderColor = '#28a745';
                        });
                        onComplete(true, 100);
                    } else {
                        stepsContainer.querySelectorAll('.step-item').forEach((el, i) => {
                            if (el.dataset.step === recipe.steps[i]) {
                                el.style.background = '#d4edda';
                                el.style.borderColor = '#28a745';
                            } else {
                                el.style.background = '#f8d7da';
                                el.style.borderColor = '#dc3545';
                            }
                        });
                        setTimeout(() => {
                            stepsContainer.querySelectorAll('.step-item').forEach(el => {
                                el.style.background = '#f8f9fa';
                                el.style.borderColor = '#dee2e6';
                            });
                        }, 500);
                    }
                });

                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, 0);
                });

                return state;
            }
        }
    };

    // =====================================================
    // LESSON 2: AP CSP Data Abstraction & Lists
    // Games: Array Assembler, List Loop Tracer, Data Cleaner, Abstraction Builder, Nested Navigator
    // =====================================================

    const LESSON_2_GAMES = {
        // Game 1: Array Assembler - Fill arrays with items at correct indices
        arrayAssembler: {
            name: 'Array Assembler',
            description: 'Fill the shopping cart array with items at the correct indices!',
            init: function(container, onComplete) {
                const state = { score: 0, total: 5, completed: false };

                const challenges = [
                    { instruction: 'Put milk at index 0', items: ['milk', 'eggs', 'bread'], correctIndex: 0, correctItem: 'milk' },
                    { instruction: 'Put eggs at index 2', items: ['milk', 'eggs', 'bread'], correctIndex: 2, correctItem: 'eggs' },
                    { instruction: 'Put bread at index 1', items: ['milk', 'eggs', 'bread'], correctIndex: 1, correctItem: 'bread' },
                    { instruction: 'Put apple at index 0', items: ['apple', 'banana', 'orange'], correctIndex: 0, correctItem: 'apple' },
                    { instruction: 'Put orange at index 2', items: ['apple', 'banana', 'orange'], correctIndex: 2, correctItem: 'orange' }
                ];

                container.innerHTML = `
                    <div class="mini-game array-assembler" style="width: 100%;">
                        <div class="game-header">
                            <div class="game-timer"><span id="timer">45</span>s</div>
                            <span class="game-title">📦 Array Assembler</span>
                            <div class="game-score">Completed: <span id="score">0</span>/${state.total}</div>
                        </div>
                        <div class="game-instructions" style="margin-bottom: 8px; font-size: 0.9em; text-align: center;">
                            <strong>🎯 Goal:</strong> Click an item, then click the correct array slot. Arrays start at index 0!
                        </div>
                        <div class="game-layout-horizontal" style="display: flex; gap: 30px; align-items: center; width: 100%;">
                            <div style="flex: 1;">
                                <div class="instruction" id="instruction" style="font-size:1em;padding:12px;background:#fff3cd;border-radius:10px;font-weight:600;margin-bottom:12px;"></div>
                                <div class="items-panel" id="items-panel" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
                            </div>
                            <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                                <div style="font-weight: 600; margin-bottom: 10px; color: #555;">Array Slots:</div>
                                <div class="array-visual" id="array-visual" style="display:flex;gap:12px;"></div>
                            </div>
                        </div>
                    </div>
                `;

                let currentChallenge = 0;
                let selectedItem = null;

                function showChallenge() {
                    if (currentChallenge >= challenges.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }

                    const challenge = challenges[currentChallenge];
                    container.querySelector('#instruction').textContent = challenge.instruction;

                    const arrayVisual = container.querySelector('#array-visual');
                    arrayVisual.innerHTML = '';
                    for (let i = 0; i < 3; i++) {
                        const slot = document.createElement('div');
                        slot.className = 'array-slot';
                        slot.dataset.index = i;
                        slot.innerHTML = `<div class="index-label">[${i}]</div><div class="slot-content"></div>`;
                        slot.style.cssText = 'width:60px;height:70px;background:#e8f4fc;border:2px dashed #3498db;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;';
                        slot.addEventListener('click', () => {
                            if (selectedItem && parseInt(slot.dataset.index) === challenge.correctIndex && selectedItem === challenge.correctItem) {
                                slot.querySelector('.slot-content').textContent = selectedItem;
                                slot.style.background = '#d4edda';
                                slot.style.borderColor = '#28a745';
                                state.score++;
                                container.querySelector('#score').textContent = state.score;
                                currentChallenge++;
                                setTimeout(showChallenge, 500);
                            } else if (selectedItem) {
                                slot.style.background = '#f8d7da';
                                setTimeout(() => slot.style.background = '#e8f4fc', 300);
                            }
                        });
                        arrayVisual.appendChild(slot);
                    }

                    const itemsPanel = container.querySelector('#items-panel');
                    itemsPanel.innerHTML = '';
                    challenge.items.forEach(item => {
                        const btn = document.createElement('button');
                        btn.textContent = item;
                        btn.style.cssText = 'padding:10px 20px;background:#fff;border:2px solid #667eea;border-radius:8px;cursor:pointer;font-weight:bold;';
                        btn.addEventListener('click', () => {
                            itemsPanel.querySelectorAll('button').forEach(b => b.style.background = '#fff');
                            btn.style.background = '#e8ebff';
                            selectedItem = item;
                        });
                        itemsPanel.appendChild(btn);
                    });
                }

                showChallenge();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.score / state.total) * 100));
                });

                return state;
            }
        },

        // Game 2: List Loop Tracer - Predict output of list iteration
        listLoopTracer: {
            name: 'List Loop Tracer',
            description: 'Trace loops over lists and predict the output (AP CSP iteration + lists)!',
            init: function(container, onComplete) {
                const state = { score: 0, total: 8, completed: false };

                const prompts = [
                    { code: 'total = 0\nFOR EACH n IN [2, 4, 6]\n  total <- total + n\nDISPLAY(total)', options: ['12', '6', '24', '8'], answer: 0 },
                    { code: 'count = 0\nFOR EACH item IN ["a","b","c","d"]\n  count <- count + 1\nDISPLAY(count)', options: ['4', '3', '5', '1'], answer: 0 },
                    { code: 'sum = 1\nFOR EACH x IN [3, 2]\n  sum <- sum * x\nDISPLAY(sum)', options: ['6', '5', '3', '8'], answer: 0 },
                    { code: 'nums = [5, 1, 2]\nFOR EACH v IN nums\n  DISPLAY(v)', options: ['5 1 2', '1 2 5', '8', '2'], answer: 0 },
                    { code: 'hits = 0\nFOR EACH n IN [1,2,3,4]\n  IF n > 2\n    hits <- hits + 1\nDISPLAY(hits)', options: ['2', '1', '3', '4'], answer: 0 },
                    { code: 'words = ["code","is","fun"]\nDISPLAY(words[1])', options: ['is', 'code', 'fun', 'undefined'], answer: 0 },
                    { code: 'nums = [1,2,3]\ntotal = 0\nFOR EACH n IN nums\n  total <- total + n * 2\nDISPLAY(total)', options: ['12', '6', '9', '3'], answer: 0 },
                    { code: 'a = [9,8,7,6]\nDISPLAY(a[2])', options: ['7', '8', '6', '9'], answer: 0 }
                ];

                container.innerHTML = `
                    <div class="mini-game list-loop-tracer" style="width: 100%;">
                        <div class="game-header">
                            <div class="game-timer"><span id="timer">45</span>s</div>
                            <span class="game-title">🔁 List Loop Tracer</span>
                            <div class="game-score">Correct: <span id="score">0</span>/${state.total}</div>
                        </div>
                        <div class="game-instructions">
                            <strong>🎯 Goal:</strong> Read the pseudocode and choose the correct output.
                        </div>
                        <div id="prompt-wrap"></div>
                    </div>
                `;

                let current = 0;

                function renderPrompt() {
                    if (current >= prompts.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }

                    const prompt = prompts[current];
                    const shuffledPrompt = shuffleOptionsWithAnswer(prompt.options, prompt.answer);
                    const wrap = container.querySelector('#prompt-wrap');
                    wrap.innerHTML = `
                        <pre style="margin:0 0 12px 0;"><code>${escapeHtml(prompt.code)}</code></pre>
                        <div class="answers-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"></div>
                    `;
                    const answers = wrap.querySelector('.answers-grid');

                    shuffledPrompt.options.forEach((opt, i) => {
                        const btn = document.createElement('button');
                        btn.textContent = opt;
                        btn.style.cssText = 'padding:12px;border-radius:8px;border:2px solid #2b5ec4;background:#f7fbff;color:#0f172a;font-weight:700;cursor:pointer;';
                        btn.addEventListener('click', () => {
                            if (i === shuffledPrompt.answer) {
                                state.score++;
                                container.querySelector('#score').textContent = state.score;
                                btn.style.background = '#d1fae5';
                                btn.style.borderColor = '#10b981';
                                current++;
                                setTimeout(renderPrompt, 280);
                            } else {
                                btn.style.background = '#fee2e2';
                                btn.style.borderColor = '#ef4444';
                            }
                        });
                        answers.appendChild(btn);
                    });
                }

                renderPrompt();
                startTimer(container.querySelector('#timer'), CHALLENGE_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.score / state.total) * 100));
                });
                return state;
            }
        },

        // Game 3: Data Cleaner - Pick the best cleaning step for each dataset issue
        dataCleaner: {
            name: 'Data Cleaner',
            description: 'Choose the best data-cleaning action for each AP CSP data problem.',
            init: function(container, onComplete) {
                const state = { score: 0, total: 7, completed: false };
                const tasks = [
                    { issue: 'A list of survey IDs contains duplicates.', snippet: 'ids = [101, 103, 103, 104]', options: ['Remove duplicates', 'Sort alphabetically', 'Add random IDs', 'Ignore it'], answer: 0 },
                    { issue: 'Some rows have missing ages: age = "".', snippet: 'rows = [{age:16}, {age:""}, {age:17}]', options: ['Flag or fill missing values', 'Delete the whole dataset', 'Convert all to text', 'Duplicate rows'], answer: 0 },
                    { issue: 'Dates are mixed: 01/05/26 and 2026-01-05.', snippet: 'dates = ["01/05/26", "2026-01-05"]', options: ['Standardize date format', 'Randomize order', 'Delete newest rows', 'Store as images'], answer: 0 },
                    { issue: 'A score column has value 9999 by mistake.', snippet: 'scores = [91, 88, 9999, 87]', options: ['Detect and fix outlier/error', 'Keep it for variety', 'Multiply all scores', 'Hide the column'], answer: 0 },
                    { issue: 'State names are NY, New York, ny.', snippet: 'states = ["NY", "New York", "ny"]', options: ['Normalize labels/case', 'Split into many columns', 'Drop all state data', 'Encrypt immediately'], answer: 0 },
                    { issue: 'Device type column has extra spaces: " laptop ".', snippet: 'device = " laptop "', options: ['Trim whitespace', 'Add more spaces', 'Use random capitalization', 'Convert to binary'], answer: 0 },
                    { issue: 'Rows use mixed yes/no values: "Yes", "Y", "yes", "No".', snippet: 'answers = ["Yes", "Y", "yes", "No"]', options: ['Standardize to one encoding scheme', 'Keep every spelling style', 'Delete all no values', 'Turn into emojis'], answer: 0 }
                ];

                container.innerHTML = `
                    <div class="mini-game data-cleaner" style="width: 100%;">
                        <div class="game-header">
                            <div class="game-timer"><span id="timer">45</span>s</div>
                            <span class="game-title">🧹 Data Cleaner</span>
                            <div class="game-score">Fixed: <span id="score">0</span>/${state.total}</div>
                        </div>
                        <div class="game-instructions">
                            <strong>🎯 Goal:</strong> Pick the best cleaning action for each dataset issue.
                        </div>
                        <div id="task-wrap"></div>
                    </div>
                `;

                let current = 0;

                function renderTask() {
                    if (current >= tasks.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }
                    const task = tasks[current];
                    const shuffledTask = shuffleOptionsWithAnswer(task.options, task.answer);
                    const wrap = container.querySelector('#task-wrap');
                    wrap.innerHTML = `
                        <div style="background:#fff7ed;border:2px solid #fdba74;color:#111827;padding:12px;border-radius:10px;margin-bottom:12px;font-weight:700;">
                            Dataset issue: ${task.issue}
                        </div>
                        <pre style="margin:0 0 12px 0;"><code>${escapeHtml(task.snippet || '')}</code></pre>
                        <div class="answers-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"></div>
                    `;
                    const answers = wrap.querySelector('.answers-grid');

                    shuffledTask.options.forEach((opt, i) => {
                        const btn = document.createElement('button');
                        btn.textContent = opt;
                        btn.style.cssText = 'padding:12px;border-radius:8px;border:2px solid #2b5ec4;background:#f7fbff;color:#0f172a;font-weight:700;cursor:pointer;';
                        btn.addEventListener('click', () => {
                            if (i === shuffledTask.answer) {
                                state.score++;
                                container.querySelector('#score').textContent = state.score;
                                btn.style.background = '#d1fae5';
                                btn.style.borderColor = '#10b981';
                                current++;
                                setTimeout(renderTask, 280);
                            } else {
                                btn.style.background = '#fee2e2';
                                btn.style.borderColor = '#ef4444';
                            }
                        });
                        answers.appendChild(btn);
                    });
                }

                renderTask();
                startTimer(container.querySelector('#timer'), CHALLENGE_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.score / state.total) * 100));
                });
                return state;
            }
        },

        // Game 4: Abstraction Builder - Choose the best abstraction for a scenario
        abstractionBuilder: {
            name: 'Abstraction Builder',
            description: 'Choose whether a list, variable, or procedure best handles each coding scenario.',
            init: function(container, onComplete) {
                const state = { score: 0, total: 7, completed: false };
                const scenarios = [
                    { prompt: 'Track all scores from 30 snake rounds.', snippet: 'score1 = 12\nscore2 = 15\n...\nscore30 = 9', options: ['Single variable', 'List', 'Hard-code all values', 'Random function'], answer: 1 },
                    { prompt: 'Reuse collision logic in many places.', snippet: '// collision check repeated in 6 files', options: ['Procedure/function', 'More comments only', 'Duplicate code', 'New color theme'], answer: 0 },
                    { prompt: 'Store one player name only.', snippet: 'playerName = "Ada"', options: ['Single variable', 'List of 100 items', 'Nested object', 'Queue'], answer: 0 },
                    { prompt: 'Process every fruit position in snake body.', snippet: 'for each segment in snakeBody:\n  checkCollision(segment)', options: ['List + loop', 'One giant IF', 'Screenshot it', 'Manual counting'], answer: 0 },
                    { prompt: 'Hide detail of score calculation behind one call.', snippet: 'final = calcScore(apples, time, bonus)', options: ['Procedure abstraction', 'Delete formula', 'Inline everywhere', 'Use emoji names'], answer: 0 },
                    { prompt: 'Keep difficulty presets easy/medium/hard.', snippet: 'difficulty = {easy:{speed:2}, medium:{speed:4}, hard:{speed:6}}', options: ['Data abstraction object/list', 'Three unrelated files', 'No structure', 'Only comments'], answer: 0 },
                    { prompt: 'Reuse “moveSnake(speed)” logic in multiple levels.', snippet: 'function moveSnake(speed) { /* reused everywhere */ }', options: ['Create one parameterized procedure', 'Copy-paste five versions', 'Use magic numbers only', 'Inline with no function'], answer: 0 }
                ];

                container.innerHTML = `
                    <div class="mini-game abstraction-builder" style="width: 100%;">
                        <div class="game-header">
                            <div class="game-timer"><span id="timer">45</span>s</div>
                            <span class="game-title">🧩 Abstraction Builder</span>
                            <div class="game-score">Correct: <span id="score">0</span>/${state.total}</div>
                        </div>
                        <div class="game-instructions">
                            <strong>🎯 Goal:</strong> Pick the best abstraction for each scenario.
                        </div>
                        <div id="scenario-wrap"></div>
                    </div>
                `;

                let current = 0;

                function renderScenario() {
                    if (current >= scenarios.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }
                    const sc = scenarios[current];
                    const shuffledScenario = shuffleOptionsWithAnswer(sc.options, sc.answer);
                    const wrap = container.querySelector('#scenario-wrap');
                    wrap.innerHTML = `
                        <div style="background:#eef2ff;border:2px solid #93c5fd;color:#111827;padding:12px;border-radius:10px;margin-bottom:12px;font-weight:700;">
                            ${sc.prompt}
                        </div>
                        <pre style="margin:0 0 12px 0;"><code>${escapeHtml(sc.snippet || '')}</code></pre>
                        <div class="answers-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"></div>
                    `;
                    const answers = wrap.querySelector('.answers-grid');

                    shuffledScenario.options.forEach((opt, i) => {
                        const btn = document.createElement('button');
                        btn.textContent = opt;
                        btn.style.cssText = 'padding:12px;border-radius:8px;border:2px solid #2b5ec4;background:#f7fbff;color:#0f172a;font-weight:700;cursor:pointer;';
                        btn.addEventListener('click', () => {
                            if (i === shuffledScenario.answer) {
                                state.score++;
                                container.querySelector('#score').textContent = state.score;
                                btn.style.background = '#d1fae5';
                                btn.style.borderColor = '#10b981';
                                current++;
                                setTimeout(renderScenario, 280);
                            } else {
                                btn.style.background = '#fee2e2';
                                btn.style.borderColor = '#ef4444';
                            }
                        });
                        answers.appendChild(btn);
                    });
                }

                renderScenario();
                startTimer(container.querySelector('#timer'), CHALLENGE_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.score / state.total) * 100));
                });
                return state;
            }
        },

        // Game 5: Nested Navigator - Navigate through nested objects
        nestedNavigator: {
            name: 'Nested Navigator',
            description: 'Read the code and evaluate nested paths!',
            init: function(container, onComplete) {
                const state = { score: 0, total: 5, completed: false };

                const challenges = [
                    {
                        path: 'user.name',
                        code: 'const data = { user: { name: "Alice", age: 25 } };\nconsole.log(data.user.name);',
                        answer: 'Alice'
                    },
                    {
                        path: 'user.address.city',
                        code: 'const data = { user: { address: { city: "NYC", zip: "10001" } } };\nconsole.log(data.user.address.city);',
                        answer: 'NYC'
                    },
                    {
                        path: 'items[0]',
                        code: 'const data = { items: ["apple", "banana", "orange"] };\nconsole.log(data.items[0]);',
                        answer: 'apple'
                    },
                    {
                        path: 'products[1].price',
                        code: 'const data = { products: [{ name: "A", price: 10 }, { name: "B", price: 20 }] };\nconsole.log(data.products[1].price);',
                        answer: '20'
                    },
                    {
                        path: 'config.settings.theme',
                        code: 'const data = { config: { settings: { theme: "dark", lang: "en" } } };\nconsole.log(data.config.settings.theme);',
                        answer: 'dark'
                    }
                ];

                container.innerHTML = `
                    <div class="mini-game nested-navigator" style="width: 100%;">
                        <div class="game-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div class="game-timer" style="background: #1e1e1e; color: #ffd700; padding: 5px 15px; border-radius: 20px; font-weight: bold;"><span id="timer">45</span>s</div>
                            <span class="game-title">🧭 Nested Navigator</span>
                            <div class="game-score" style="font-weight: bold;">Found: <span id="score">0</span>/${state.total}</div>
                        </div>
                        <div class="game-layout-horizontal" style="display: flex; gap: 30px; align-items: flex-start; width: 100%;">
                            <div style="flex: 1; min-width: 300px;">
                                <div class="path-display" id="path-display" style="font-family:monospace;font-size:1.1em;padding:10px;background:#1e1e1e;color:#ffd700;border-radius:8px;margin-bottom:10px;"></div>
                                <div class="data-display" id="data-display" style="font-family:monospace;padding:12px;background:#f8f9fa;border-radius:10px;font-size:0.9em;"></div>
                            </div>
                            <div style="flex: 1; min-width: 280px; display: flex; flex-direction: column; gap: 10px;">
                                <div style="font-weight: 700; color: #0f172a;">Enter the output value from this line:</div>
                                <input type="text" id="answer-input" placeholder="Type your answer..." style="padding:12px;border:2px solid #667eea;border-radius:8px;font-size:1em;">
                                <button id="submit-btn" style="padding:14px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:1.05em;">Submit Answer</button>
                            </div>
                        </div>
                    </div>
                `;

                let currentChallenge = 0;

                function showChallenge() {
                    if (currentChallenge >= challenges.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }

                    const challenge = challenges[currentChallenge];
                    container.querySelector('#path-display').textContent = `Evaluate: ${challenge.path}`;
                    container.querySelector('#data-display').innerHTML = `<pre style="margin:0;white-space:pre-wrap;color:#0f172a;background:#eef2ff;padding:10px;border-radius:8px;border:1px solid #c7d2fe;"><code>${escapeHtml(challenge.code)}</code></pre>`;
                    container.querySelector('#answer-input').value = '';
                }

                container.querySelector('#submit-btn').addEventListener('click', () => {
                    const input = container.querySelector('#answer-input').value.trim();
                    const challenge = challenges[currentChallenge];

                    if (input.toLowerCase() === String(challenge.answer).toLowerCase()) {
                        state.score++;
                        container.querySelector('#score').textContent = state.score;
                        currentChallenge++;
                        showChallenge();
                    } else {
                        container.querySelector('#answer-input').style.borderColor = '#dc3545';
                        setTimeout(() => container.querySelector('#answer-input').style.borderColor = '#667eea', 300);
                    }
                });

                container.querySelector('#answer-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') container.querySelector('#submit-btn').click();
                });

                showChallenge();
                startTimer(container.querySelector('#timer'), CHALLENGE_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.score / state.total) * 100));
                });

                return state;
            }
        }
    };

    // =====================================================
    // LESSON 3: Internet & Networking
    // Games: IP Address Matcher, DNS Speed Run, Packet Pathfinder, URL Decoder, Router Rush
    // =====================================================

    const LESSON_3_GAMES = {
        // Game 1: IP Address Matcher
        ipAddressMatcher: {
            name: 'IP Address Matcher',
            description: 'Connect devices to their IP addresses!',
            init: function(container, onComplete) {
                const state = { score: 0, total: 5, completed: false };

                const devices = [
                    { device: 'Router', ip: '192.168.1.1' },
                    { device: 'Computer', ip: '192.168.1.100' },
                    { device: 'Printer', ip: '192.168.1.50' },
                    { device: 'Phone', ip: '192.168.1.75' },
                    { device: 'Server', ip: '192.168.1.10' }
                ];

                const shuffledIPs = [...devices].map(d => d.ip).sort(() => Math.random() - 0.5);

                container.innerHTML = `
                    <div class="mini-game ip-matcher" style="width: 100%;">
                        <div class="game-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div class="game-timer" style="background: #1e1e1e; color: #ffd700; padding: 5px 15px; border-radius: 20px; font-weight: bold;"><span id="timer">45</span>s</div>
                            <span class="game-title">🌐 IP Address Matcher</span>
                            <div class="game-score" style="font-weight: bold;">Matched: <span id="score">0</span>/${state.total}</div>
                        </div>
                        <div class="game-instructions" style="margin-bottom: 8px; font-size: 0.9em; text-align: center;">
                            <strong>🎯 Goal:</strong> Click a device, then click its matching IP address.
                        </div>
                        <div class="match-container" style="display:flex; gap:40px; justify-content: center; width: 100%;">
                            <div class="devices-col" id="devices-col" style="flex: 1; max-width: 300px;">
                                <div style="font-weight: bold; margin-bottom: 8px; color: #3498db; text-align: center;">📱 Devices</div>
                            </div>
                            <div class="ips-col" id="ips-col" style="flex: 1; max-width: 300px;">
                                <div style="font-weight: bold; margin-bottom: 8px; color: #e67e22; text-align: center;">🔢 IP Addresses</div>
                            </div>
                        </div>
                    </div>
                `;

                const devicesCol = container.querySelector('#devices-col');
                const ipsCol = container.querySelector('#ips-col');
                let selectedDevice = null;

                devices.forEach(d => {
                    const div = document.createElement('div');
                    div.className = 'device-box';
                    div.dataset.device = d.device;
                    div.dataset.ip = d.ip;
                    div.innerHTML = `<span style="font-size:1.3em;">${d.device === 'Router' ? '📡' : d.device === 'Computer' ? '💻' : d.device === 'Printer' ? '🖨️' : d.device === 'Phone' ? '📱' : '🖥️'}</span> ${d.device}`;
                    div.style.cssText = 'padding:8px 12px;background:#e8f4fc;border:2px solid #3498db;border-radius:8px;margin:4px 0;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:0.95em;';
                    div.addEventListener('click', () => {
                        if (div.classList.contains('matched')) return;
                        devicesCol.querySelectorAll('.device-box').forEach(el => {
                            el.classList.remove('selected');
                            if (!el.classList.contains('matched')) el.style.background = '#e8f4fc';
                        });
                        div.classList.add('selected');
                        div.style.background = '#cce5ff';
                        selectedDevice = d;
                    });
                    devicesCol.appendChild(div);
                });

                shuffledIPs.forEach(ip => {
                    const div = document.createElement('div');
                    div.className = 'ip-box';
                    div.dataset.ip = ip;
                    div.innerHTML = `<code style="font-size: 0.95em;">${ip}</code>`;
                    div.style.cssText = 'padding:8px 12px;background:#fef3e2;border:2px solid #e67e22;border-radius:8px;margin:4px 0;cursor:pointer;font-family:monospace;';
                    div.addEventListener('click', () => {
                        if (div.classList.contains('matched') || !selectedDevice) return;
                        if (selectedDevice.ip === ip) {
                            state.score++;
                            container.querySelector('#score').textContent = state.score;
                            div.classList.add('matched');
                            div.style.background = '#d4edda';
                            const deviceBox = devicesCol.querySelector(`[data-device="${selectedDevice.device}"]`);
                            deviceBox.classList.add('matched');
                            deviceBox.style.background = '#d4edda';
                            selectedDevice = null;

                            if (state.score >= state.total) {
                                state.completed = true;
                                onComplete(true, 100);
                            }
                        } else {
                            div.style.background = '#f8d7da';
                            setTimeout(() => div.style.background = '#fef3e2', 300);
                        }
                    });
                    ipsCol.appendChild(div);
                });

                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.score / state.total) * 100));
                });

                return state;
            }
        },

        // Game 2: DNS Speed Run
        dnsSpeedRun: {
            name: 'DNS Speed Run',
            description: 'Race to translate domain names to IP addresses!',
            init: function(container, onComplete) {
                const state = { score: 0, total: 6, completed: false };

                const translations = [
                    { domain: 'google.com', ip: '142.250.80.14' },
                    { domain: 'facebook.com', ip: '157.240.1.35' },
                    { domain: 'amazon.com', ip: '54.239.28.85' },
                    { domain: 'netflix.com', ip: '54.74.73.31' },
                    { domain: 'twitter.com', ip: '104.244.42.1' },
                    { domain: 'github.com', ip: '140.82.121.4' }
                ];

                container.innerHTML = `
                    <div class="mini-game dns-speedrun" style="width: 100%;">
                        <div class="game-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div class="game-timer" style="background: #1e1e1e; color: #ffd700; padding: 5px 15px; border-radius: 20px; font-weight: bold;"><span id="timer">45</span>s</div>
                            <span class="game-title">🌐 DNS Speed Run</span>
                            <div class="game-score" style="font-weight: bold;">Translated: <span id="score">0</span>/${state.total}</div>
                        </div>
                        <div class="game-instructions" style="margin-bottom: 8px; font-size: 0.9em; text-align: center;">
                            <strong>🎯 Goal:</strong> Click the correct IP address for each domain name.
                        </div>
                        <div class="game-layout-horizontal" style="display: flex; gap: 40px; align-items: center; width: 100%;">
                            <div class="domain-display" id="domain-display" style="flex: 1; text-align:center;font-size:1.2em;padding:15px;background:#1e1e1e;color:#00ff00;border-radius:10px;font-family:monospace;min-width:200px;"></div>
                            <div style="flex: 2;">
                                <pre id="dns-code" style="margin:0 0 10px 0;"></pre>
                                <div class="ip-options" id="ip-options" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;"></div>
                            </div>
                        </div>
                    </div>
                `;

                let currentIndex = 0;

                function showTranslation() {
                    if (currentIndex >= translations.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }

                    const current = translations[currentIndex];
                    container.querySelector('#domain-display').textContent = current.domain;

                    const optionsDiv = container.querySelector('#ip-options');
                    const dnsCode = container.querySelector('#dns-code');
                    if (dnsCode) dnsCode.innerHTML = `<code>${escapeHtml(`// DNS lookup\nresolve("${current.domain}") => ?`)}</code>`;
                    const distractors = translations
                        .map(t => t.ip)
                        .filter(ip => ip !== current.ip)
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 3);
                    const options = [current.ip, ...distractors];
                    options.sort(() => Math.random() - 0.5);

                    optionsDiv.innerHTML = '';
                    options.forEach(ip => {
                        const btn = document.createElement('button');
                        btn.textContent = ip;
                        btn.style.cssText = 'padding:12px;background:#f8f9fa;border:2px solid #667eea;border-radius:8px;cursor:pointer;font-family:monospace;font-size:0.9em;';
                        btn.addEventListener('click', () => {
                            if (ip === current.ip) {
                                btn.style.background = '#d4edda';
                                state.score++;
                                container.querySelector('#score').textContent = state.score;
                                currentIndex++;
                                setTimeout(showTranslation, 300);
                            } else {
                                btn.style.background = '#f8d7da';
                                btn.disabled = true;
                            }
                        });
                        optionsDiv.appendChild(btn);
                    });
                }

                showTranslation();
                startTimer(container.querySelector('#timer'), CHALLENGE_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.score / state.total) * 100));
                });

                return state;
            }
        },

        // Game 3: Packet Pathfinder (AP CSP packet/routing scenarios)
        packetPathfinder: {
            name: 'Packet Pathfinder',
            description: 'Solve packet-routing scenarios from AP CSP networking concepts!',
            init: function(container, onComplete) {
                const state = { score: 0, total: 7, completed: false };
                const prompts = [
                    {
                        prompt: 'A message is sent across the Internet. Which is most accurate?',
                        options: [
                            'It is split into packets that may take different paths',
                            'It must stay as one piece on one path',
                            'DNS stores the whole message until complete',
                            'Routers cannot reroute packets'
                        ],
                        answer: 0
                    },
                    {
                        prompt: 'Why does packet switching improve reliability?',
                        options: [
                            'Packets can reroute if one path fails',
                            'All packets are duplicated forever',
                            'Only one router is used',
                            'It prevents any packet loss completely'
                        ],
                        answer: 0
                    },
                    {
                        prompt: 'What does a router mainly do?',
                        options: [
                            'Forwards packets toward a destination',
                            'Converts every URL to HTML',
                            'Creates passwords for users',
                            'Stores all internet data permanently'
                        ],
                        answer: 0
                    },
                    {
                        prompt: 'Which statement about packet order is correct?',
                        options: [
                            'Packets may arrive out of order and are reassembled',
                            'Packets always arrive in send order',
                            'Packets never need destination info',
                            'Packets skip protocol rules'
                        ],
                        answer: 0
                    },
                    {
                        prompt: 'A path is congested. What likely happens?',
                        options: [
                            'Routers choose alternate routes when possible',
                            'Internet stops permanently',
                            'DNS disables all domains',
                            'Every packet becomes encrypted automatically'
                        ],
                        answer: 0
                    },
                    {
                        prompt: 'Which protocol pair is commonly discussed in AP CSP networking?',
                        options: [
                            'IP for addressing and TCP for reliable delivery',
                            'HTML and CSS',
                            'PNG and JPG',
                            'GPU and CPU'
                        ],
                        answer: 0
                    },
                    {
                        prompt: 'A packet includes source and destination addresses. Why?',
                        options: [
                            'So routers know where to forward it',
                            'So DNS can style the webpage',
                            'So only one path is possible',
                            'So the packet never needs reassembly'
                        ],
                        answer: 0
                    }
                ];

                container.innerHTML = `
                    <div class="mini-game packet-pathfinder" style="width: 100%;">
                        <div class="game-timer"><span id="timer">45</span>s</div>
                        <div class="game-score">Correct: <span id="score">0</span>/${state.total}</div>
                        <div class="game-instructions">
                            <strong>🎯 Goal:</strong> Pick the best networking answer for each scenario.
                        </div>
                        <div id="packet-quiz-wrap"></div>
                    </div>
                `;

                let currentIndex = 0;
                function showPrompt() {
                    if (currentIndex >= prompts.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }

                    const prompt = prompts[currentIndex];
                    const shuffledPrompt = shuffleOptionsWithAnswer(prompt.options, prompt.answer);
                    const wrap = container.querySelector('#packet-quiz-wrap');
                    wrap.innerHTML = `
                        <div style="background:#f0f9ff;border:2px solid #7dd3fc;padding:12px;border-radius:10px;margin:8px 0 12px 0;font-weight:700;color:#0f172a;">
                            ${prompt.prompt}
                        </div>
                        <div class="answers-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"></div>
                    `;

                    const answers = wrap.querySelector('.answers-grid');
                    shuffledPrompt.options.forEach((opt, i) => {
                        const btn = document.createElement('button');
                        btn.textContent = opt;
                        btn.style.cssText = 'padding:12px;background:#f8fafc;border:2px solid #3b82f6;border-radius:8px;cursor:pointer;font-weight:700;color:#0f172a;';
                        btn.addEventListener('click', () => {
                            if (i === shuffledPrompt.answer) {
                                state.score++;
                                container.querySelector('#score').textContent = state.score;
                                btn.style.background = '#d1fae5';
                                btn.style.borderColor = '#10b981';
                                currentIndex++;
                                setTimeout(showPrompt, 250);
                            } else {
                                btn.style.background = '#fee2e2';
                                btn.style.borderColor = '#ef4444';
                            }
                        });
                        answers.appendChild(btn);
                    });
                }

                showPrompt();
                startTimer(container.querySelector('#timer'), CHALLENGE_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.score / state.total) * 100));
                });

                return state;
            }
        },

        // Game 4: URL Decoder
        urlDecoder: {
            name: 'URL Decoder',
            description: 'Identify the parts of a URL!',
            init: function(container, onComplete) {
                const state = { score: 0, total: 4, completed: false };

                const urlParts = [
                    { part: 'protocol', example: 'https', color: '#e74c3c' },
                    { part: 'domain', example: 'www.example.com', color: '#3498db' },
                    { part: 'path', example: '/products/item', color: '#27ae60' },
                    { part: 'query', example: '?id=123&color=red', color: '#9b59b6' }
                ];

                container.innerHTML = `
                    <div class="mini-game url-decoder">
                        <div class="game-timer"><span id="timer">45</span>s</div>
                        <div class="game-score">Identified: <span id="score">0</span>/${state.total}</div>
                        <div class="url-display" style="font-family:monospace;font-size:1.1em;padding:15px;background:#1e1e1e;border-radius:10px;margin:10px 0;text-align:center;">
                            <span style="color:#e74c3c">https://</span><span style="color:#3498db">www.example.com</span><span style="color:#27ae60">/products/item</span><span style="color:#9b59b6">?id=123&color=red</span>
                        </div>
                        <div class="question-area" id="question-area" style="text-align:center;margin:15px 0;"></div>
                        <div class="options-area" id="options-area" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;"></div>
                    </div>
                `;

                let currentPart = 0;
                const shuffledParts = [...urlParts].sort(() => Math.random() - 0.5);

                function showQuestion() {
                    if (currentPart >= shuffledParts.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }

                    const part = shuffledParts[currentPart];
                    container.querySelector('#question-area').innerHTML = `
                        <p>Which part is the <strong style="color:${part.color}">${part.part}</strong>?</p>
                        <pre style="margin:8px 0 0 0;"><code>const u = new URL("https://www.example.com/products/item?id=123&color=red");\n// identify u.${part.part === 'protocol' ? 'protocol' : part.part === 'domain' ? 'hostname' : part.part === 'path' ? 'pathname' : 'search'}</code></pre>
                    `;

                    const optionsArea = container.querySelector('#options-area');
                    const options = urlParts.map(p => p.example).sort(() => Math.random() - 0.5);
                    optionsArea.innerHTML = '';

                    options.forEach(opt => {
                        const btn = document.createElement('button');
                        btn.textContent = opt;
                        btn.style.cssText = 'padding:12px;background:#f8f9fa;border:2px solid #667eea;border-radius:8px;cursor:pointer;font-family:monospace;';
                        btn.addEventListener('click', () => {
                            if (opt === part.example) {
                                btn.style.background = '#d4edda';
                                state.score++;
                                container.querySelector('#score').textContent = state.score;
                                currentPart++;
                                setTimeout(showQuestion, 300);
                            } else {
                                btn.style.background = '#f8d7da';
                                btn.disabled = true;
                            }
                        });
                        optionsArea.appendChild(btn);
                    });
                }

                showQuestion();
                startTimer(container.querySelector('#timer'), CHALLENGE_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.score / state.total) * 100));
                });

                return state;
            }
        },

        // Game 5: Router Rush
        routerRush: {
            name: 'Router Rush',
            description: 'Sort incoming packets to the correct network!',
            init: function(container, onComplete) {
                const state = { sorted: 0, total: 12, completed: false, errors: 0 };

                const networks = [
                    { name: 'Network A', prefix: '192.168.1' },
                    { name: 'Network B', prefix: '10.0.0' }
                ];

                container.innerHTML = `
                    <div class="mini-game router-rush">
                        <div class="game-timer"><span id="timer">45</span>s</div>
                        <div class="game-score">Sorted: <span id="score">0</span>/${state.total}</div>
                        <div class="packet-display" id="packet-display" style="text-align:center;padding:20px;background:#1e1e1e;border-radius:10px;margin:10px 0;">
                            <div id="current-packet" style="font-family:monospace;font-size:1.3em;color:#00ff00;"></div>
                        </div>
                        <div class="network-buttons" style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-top:15px;">
                            <button id="network-a" style="padding:20px;background:#3498db;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:bold;">
                                Network A<br><small>192.168.1.x</small>
                            </button>
                            <button id="network-b" style="padding:20px;background:#e67e22;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:bold;">
                                Network B<br><small>10.0.0.x</small>
                            </button>
                        </div>
                    </div>
                `;

                let currentPacket = null;

                function generatePacket() {
                    const network = networks[Math.floor(Math.random() * 2)];
                    const lastOctet = Math.floor(Math.random() * 254) + 1;
                    return { ip: `${network.prefix}.${lastOctet}`, network: network.name };
                }

                function showPacket() {
                    if (state.sorted >= state.total) {
                        state.completed = true;
                        onComplete(true, Math.max(0, 100 - state.errors * 10));
                        return;
                    }

                    currentPacket = generatePacket();
                    container.querySelector('#current-packet').textContent = `📦 ${currentPacket.ip}`;
                }

                container.querySelector('#network-a').addEventListener('click', () => {
                    if (currentPacket.network === 'Network A') {
                        state.sorted++;
                        container.querySelector('#score').textContent = state.sorted;
                    } else {
                        state.errors++;
                        if (state.sorted > 0) state.sorted--;
                        container.querySelector('#score').textContent = state.sorted;
                    }
                    showPacket();
                });

                container.querySelector('#network-b').addEventListener('click', () => {
                    if (currentPacket.network === 'Network B') {
                        state.sorted++;
                        container.querySelector('#score').textContent = state.sorted;
                    } else {
                        state.errors++;
                        if (state.sorted > 0) state.sorted--;
                        container.querySelector('#score').textContent = state.sorted;
                    }
                    showPacket();
                });

                showPacket();
                startTimer(container.querySelector('#timer'), CHALLENGE_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.sorted / state.total) * 100));
                });

                return state;
            }
        }
    };

    // =====================================================
    // LESSON 4: Cybersecurity & Encryption
    // Games: Password Strength Smash, Caesar Cipher Cracker, Phishing Detector, Firewall Frenzy, Encryption Key Match
    // =====================================================

    const LESSON_4_GAMES = {
        // Game 1: Password Strength Smash
        passwordStrengthSmash: {
            name: 'Password Strength Smash',
            description: 'Rate passwords as weak, medium, or strong!',
            init: function(container, onComplete) {
                const state = { score: 0, total: 10, completed: false };

                const passwords = [
                    { password: 'password', strength: 'weak' },
                    { password: '123456', strength: 'weak' },
                    { password: 'qwerty', strength: 'weak' },
                    { password: 'MyPet2020', strength: 'medium' },
                    { password: 'Summer#21', strength: 'medium' },
                    { password: 'John1985!', strength: 'medium' },
                    { password: 'T9$mK#pL2@qR', strength: 'strong' },
                    { password: 'Xy7!kM3@nP9$', strength: 'strong' },
                    { password: '&Hj2*Lm5^Rw9', strength: 'strong' },
                    { password: 'admin', strength: 'weak' }
                ].sort(() => Math.random() - 0.5);

                container.innerHTML = `
                    <div class="mini-game password-smash" style="max-width: 100%; overflow: hidden;">
                        <div class="game-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div class="game-timer" style="background: #1e1e1e; color: #ffd700; padding: 5px 15px; border-radius: 20px; font-weight: bold;"><span id="timer">45</span>s</div>
                            <div class="game-score" style="font-weight: bold;">Correct: <span id="score">0</span>/${state.total}</div>
                        </div>
                        ${createInstructionBox(
                            'Weak: simple words, short, common. Medium: mix of letters/numbers, 6-10 chars. Strong: 12+ chars with uppercase, lowercase, numbers, and special characters like !@#$.',
                            'Rate all 10 passwords correctly by clicking Weak, Medium, or Strong.'
                        )}
                        <div class="password-display" id="password-display" style="text-align:center;padding:20px;background:#1e1e1e;border-radius:10px;margin:10px 0;">
                            <code id="current-password" style="font-size:1.4em;color:#00ff00;"></code>
                        </div>
                        <div class="strength-buttons" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
                            <button data-strength="weak" style="padding:15px;background:#dc3545;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Weak</button>
                            <button data-strength="medium" style="padding:15px;background:#ffc107;color:#333;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Medium</button>
                            <button data-strength="strong" style="padding:15px;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Strong</button>
                        </div>
                    </div>
                `;

                let currentIndex = 0;

                function showPassword() {
                    if (currentIndex >= passwords.length) {
                        state.completed = true;
                        // Must get ALL passwords correct to pass
                        const passed = state.score >= state.total;
                        onComplete(passed, Math.floor((state.score / state.total) * 100));
                        return;
                    }

                    container.querySelector('#current-password').textContent = passwords[currentIndex].password;
                }

                container.querySelectorAll('[data-strength]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        if (btn.dataset.strength === passwords[currentIndex].strength) {
                            state.score++;
                            container.querySelector('#score').textContent = state.score;
                        }
                        currentIndex++;
                        showPassword();
                    });
                });

                showPassword();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.score / state.total) * 100));
                });

                return state;
            }
        },

        // Game 2: Caesar Cipher Cracker
        caesarCipherCracker: {
            name: 'Caesar Cipher Cracker',
            description: 'Decode secret messages encrypted with Caesar cipher!',
            init: function(container, onComplete) {
                const state = { decoded: 0, total: 5, completed: false };

                const messages = [
                    { encrypted: 'KHOOR', decrypted: 'HELLO', shift: 3 },
                    { encrypted: 'ZRUOG', decrypted: 'WORLD', shift: 3 },
                    { encrypted: 'FRGH', decrypted: 'CODE', shift: 3 },
                    { encrypted: 'VHFUHW', decrypted: 'SECRET', shift: 3 },
                    { encrypted: 'SURJUDP', decrypted: 'PROGRAM', shift: 3 }
                ];

                container.innerHTML = `
                    <div class="mini-game caesar-cracker" style="max-width: 100%; overflow: hidden;">
                        <div class="game-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div class="game-timer" style="background: #1e1e1e; color: #ffd700; padding: 5px 15px; border-radius: 20px; font-weight: bold;"><span id="timer">45</span>s</div>
                            <div class="game-score" style="font-weight: bold;">Decoded: <span id="score">0</span>/${state.total}</div>
                        </div>
                        ${createInstructionBox(
                            'The Caesar cipher shifts each letter by a number. To decode, shift letters BACKWARD. Example: with shift 3, D→A, E→B, K→H. So "KHOOR" becomes "HELLO".',
                            'Decode all 5 encrypted messages by typing the original text.'
                        )}
                        <div class="cipher-display" style="text-align:center;margin:15px 0;">
                            <p>Encrypted message (Shift: <span id="shift">3</span>):</p>
                            <code id="encrypted" style="font-size:1.5em;background:#1e1e1e;color:#ff6b6b;padding:10px 20px;border-radius:8px;display:inline-block;"></code>
                        </div>
                        <div class="decode-area" style="text-align:center;">
                            <input type="text" id="decode-input" placeholder="Enter decoded message..." style="width:80%;padding:12px;border:2px solid #667eea;border-radius:8px;font-size:1.1em;text-transform:uppercase;">
                            <button id="decode-btn" style="display:block;margin:10px auto;padding:12px 30px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Decode</button>
                        </div>
                    </div>
                `;

                let currentIndex = 0;

                function showMessage() {
                    if (currentIndex >= messages.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }

                    const msg = messages[currentIndex];
                    container.querySelector('#encrypted').textContent = msg.encrypted;
                    container.querySelector('#shift').textContent = msg.shift;
                    container.querySelector('#decode-input').value = '';
                }

                container.querySelector('#decode-btn').addEventListener('click', () => {
                    const input = container.querySelector('#decode-input').value.toUpperCase().trim();
                    if (input === messages[currentIndex].decrypted) {
                        state.decoded++;
                        container.querySelector('#score').textContent = state.decoded;
                        currentIndex++;
                        showMessage();
                    } else {
                        container.querySelector('#decode-input').style.borderColor = '#dc3545';
                        setTimeout(() => container.querySelector('#decode-input').style.borderColor = '#667eea', 300);
                    }
                });

                container.querySelector('#decode-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') container.querySelector('#decode-btn').click();
                });

                showMessage();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.decoded / state.total) * 100));
                });

                return state;
            }
        },

        // Game 3: Phishing Detector
        phishingDetector: {
            name: 'Phishing Detector',
            description: 'Identify phishing emails vs legitimate ones!',
            init: function(container, onComplete) {
                const state = { correct: 0, total: 6, completed: false };

                const emails = [
                    { from: 'support@paypa1.com', subject: 'URGENT: Your account will be suspended!', isPhishing: true },
                    { from: 'newsletter@amazon.com', subject: 'Your order has shipped', isPhishing: false },
                    { from: 'security@bank0famerica.com', subject: 'Verify your account NOW!!!', isPhishing: true },
                    { from: 'no-reply@github.com', subject: 'Pull request merged', isPhishing: false },
                    { from: 'prize@win-money-now.xyz', subject: 'You won $1,000,000!', isPhishing: true },
                    { from: 'receipts@apple.com', subject: 'Your receipt from Apple', isPhishing: false }
                ].sort(() => Math.random() - 0.5);

                container.innerHTML = `
                    <div class="mini-game phishing-detector">
                        <div class="game-timer"><span id="timer">45</span>s</div>
                        <div class="game-score">Correct: <span id="score">0</span>/${state.total}</div>
                        <div class="email-display" id="email-display" style="background:#fff;border:1px solid #ddd;border-radius:10px;padding:15px;margin:10px 0;"></div>
                        <div class="detect-buttons" style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                            <button id="legit-btn" style="padding:15px;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Legitimate</button>
                            <button id="phish-btn" style="padding:15px;background:#dc3545;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Phishing!</button>
                        </div>
                    </div>
                `;

                let currentIndex = 0;

                function showEmail() {
                    if (currentIndex >= emails.length) {
                        state.completed = true;
                        const passed = state.correct >= state.total;
                        onComplete(passed, Math.floor((state.correct / state.total) * 100));
                        return;
                    }

                    const email = emails[currentIndex];
                    container.querySelector('#email-display').innerHTML = `
                        <p style="margin:0 0 10px 0;"><strong>From:</strong> <code style="background:#f8f9fa;padding:2px 6px;border-radius:4px;">${email.from}</code></p>
                        <p style="margin:0;"><strong>Subject:</strong> ${email.subject}</p>
                    `;
                }

                container.querySelector('#legit-btn').addEventListener('click', () => {
                    if (!emails[currentIndex].isPhishing) state.correct++;
                    container.querySelector('#score').textContent = state.correct;
                    currentIndex++;
                    showEmail();
                });

                container.querySelector('#phish-btn').addEventListener('click', () => {
                    if (emails[currentIndex].isPhishing) state.correct++;
                    container.querySelector('#score').textContent = state.correct;
                    currentIndex++;
                    showEmail();
                });

                showEmail();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.correct / state.total) * 100));
                });

                return state;
            }
        },

        // Game 4: Firewall Frenzy
        firewallFrenzy: {
            name: 'Firewall Frenzy',
            description: 'Allow safe traffic and block malicious requests!',
            init: function(container, onComplete) {
                const state = { correct: 0, total: 12, completed: false, processed: 0 };

                const traffic = [
                    { type: 'GET /index.html', safe: true },
                    { type: 'POST /login (valid)', safe: true },
                    { type: 'SQL Injection attempt', safe: false },
                    { type: 'GET /images/logo.png', safe: true },
                    { type: 'XSS script attack', safe: false },
                    { type: 'POST /api/data (valid)', safe: true },
                    { type: 'Brute force login', safe: false },
                    { type: 'GET /style.css', safe: true },
                    { type: 'DDoS flood request', safe: false },
                    { type: 'GET /favicon.ico', safe: true },
                    { type: 'Malware download', safe: false },
                    { type: 'POST /checkout (valid)', safe: true }
                ].sort(() => Math.random() - 0.5);

                container.innerHTML = `
                    <div class="mini-game firewall-frenzy">
                        <div class="game-timer"><span id="timer">45</span>s</div>
                        <div class="game-score">Accuracy: <span id="score">0</span>/${state.total}</div>
                        <div class="traffic-display" id="traffic-display" style="text-align:center;padding:20px;background:#1e1e1e;border-radius:10px;margin:10px 0;">
                            <p id="traffic-type" style="font-family:monospace;font-size:1.2em;color:#fff;"></p>
                        </div>
                        <div class="firewall-buttons" style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                            <button id="allow-btn" style="padding:20px;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:1.1em;">ALLOW</button>
                            <button id="block-btn" style="padding:20px;background:#dc3545;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:1.1em;">BLOCK</button>
                        </div>
                    </div>
                `;

                let currentIndex = 0;

                function showTraffic() {
                    if (currentIndex >= traffic.length) {
                        state.completed = true;
                        const passed = state.correct >= state.total;
                        onComplete(passed, Math.floor((state.correct / state.total) * 100));
                        return;
                    }

                    const t = traffic[currentIndex];
                    const display = container.querySelector('#traffic-type');
                    display.textContent = t.type;
                    display.style.color = t.safe ? '#00ff00' : '#ff6b6b';
                }

                container.querySelector('#allow-btn').addEventListener('click', () => {
                    if (traffic[currentIndex].safe) state.correct++;
                    state.processed++;
                    container.querySelector('#score').textContent = state.correct;
                    currentIndex++;
                    showTraffic();
                });

                container.querySelector('#block-btn').addEventListener('click', () => {
                    if (!traffic[currentIndex].safe) state.correct++;
                    state.processed++;
                    container.querySelector('#score').textContent = state.correct;
                    currentIndex++;
                    showTraffic();
                });

                showTraffic();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.correct / state.total) * 100));
                });

                return state;
            }
        },

        // Game 5: Encryption Key Match
        encryptionKeyMatch: {
            name: 'Encryption Key Match',
            description: 'Match encrypted messages with their decryption keys!',
            init: function(container, onComplete) {
                const state = { matched: 0, total: 4, completed: false };

                const pairs = [
                    { message: 'XYZZY', key: 'KEY-001' },
                    { message: 'QWERT', key: 'KEY-002' },
                    { message: 'ABCDE', key: 'KEY-003' },
                    { message: 'LMNOP', key: 'KEY-004' }
                ];

                const shuffledMessages = [...pairs].sort(() => Math.random() - 0.5);
                const shuffledKeys = [...pairs].sort(() => Math.random() - 0.5);

                container.innerHTML = `
                    <div class="mini-game encryption-match">
                        <div class="game-timer"><span id="timer">45</span>s</div>
                        <div class="game-score">Matched: <span id="score">0</span>/${state.total}</div>
                        <div class="match-container" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                            <div class="messages-col" id="messages-col"></div>
                            <div class="keys-col" id="keys-col"></div>
                        </div>
                    </div>
                `;

                const messagesCol = container.querySelector('#messages-col');
                const keysCol = container.querySelector('#keys-col');
                let selectedMessage = null;

                shuffledMessages.forEach((p, i) => {
                    const div = document.createElement('div');
                    div.className = 'message-box';
                    div.dataset.message = p.message;
                    div.dataset.key = p.key;
                    div.innerHTML = `<span style="font-size:1.2em;">🔒</span> ${p.message}`;
                    div.style.cssText = 'padding:12px;background:#e8f4fc;border:2px solid #3498db;border-radius:8px;margin:5px;cursor:pointer;display:flex;align-items:center;gap:10px;';
                    div.addEventListener('click', () => {
                        if (div.classList.contains('matched')) return;
                        messagesCol.querySelectorAll('.message-box').forEach(el => el.classList.remove('selected'));
                        div.classList.add('selected');
                        div.style.background = '#cce5ff';
                        selectedMessage = p;
                    });
                    messagesCol.appendChild(div);
                });

                shuffledKeys.forEach((p, i) => {
                    const div = document.createElement('div');
                    div.className = 'key-box';
                    div.dataset.key = p.key;
                    div.innerHTML = `<span style="font-size:1.2em;">🔑</span> ${p.key}`;
                    div.style.cssText = 'padding:12px;background:#fef3e2;border:2px solid #e67e22;border-radius:8px;margin:5px;cursor:pointer;display:flex;align-items:center;gap:10px;';
                    div.addEventListener('click', () => {
                        if (div.classList.contains('matched') || !selectedMessage) return;
                        if (selectedMessage.key === p.key) {
                            state.matched++;
                            container.querySelector('#score').textContent = state.matched;
                            div.classList.add('matched');
                            div.style.background = '#d4edda';
                            const msgBox = messagesCol.querySelector(`[data-message="${selectedMessage.message}"]`);
                            msgBox.classList.add('matched');
                            msgBox.style.background = '#d4edda';
                            selectedMessage = null;

                            if (state.matched >= state.total) {
                                state.completed = true;
                                onComplete(true, 100);
                            }
                        } else {
                            div.style.background = '#f8d7da';
                            setTimeout(() => div.style.background = '#fef3e2', 300);
                        }
                    });
                    keysCol.appendChild(div);
                });

                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.matched / state.total) * 100));
                });

                return state;
            }
        }
    };

    // =====================================================
    // LESSON 5: Computing Impacts & Data Analysis
    // Games: Bias Buster, Privacy Protector, Data Trend Spotter, Chart Champion, Ethical Dilemma Dash
    // =====================================================

    const LESSON_5_GAMES = {
        // Game 1: Bias Buster
        biasBuster: {
            name: 'Bias Buster',
            description: 'Identify biased datasets and ethical concerns!',
            init: function(container, onComplete) {
                const state = { correct: 0, total: 6, completed: false };

                const scenarios = [
                    { scenario: 'Face recognition trained only on light-skinned faces', hasBias: true },
                    { scenario: 'Loan algorithm using applicant zip code heavily', hasBias: true },
                    { scenario: 'Weather app using data from multiple global stations', hasBias: false },
                    { scenario: 'Hiring AI trained on past (mostly male) employees', hasBias: true },
                    { scenario: 'Translation app trained on diverse language samples', hasBias: false },
                    { scenario: 'Crime prediction based on arrest data from one neighborhood', hasBias: true }
                ].sort(() => Math.random() - 0.5);

                container.innerHTML = `
                    <div class="mini-game bias-buster">
                        <div class="game-timer"><span id="timer">45</span>s</div>
                        <div class="game-score">Correct: <span id="score">0</span>/${state.total}</div>
                        <div class="scenario-display" id="scenario-display" style="text-align:center;padding:20px;background:#f8f9fa;border-radius:10px;margin:10px 0;min-height:80px;"></div>
                        <div class="bias-buttons" style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                            <button id="biased-btn" style="padding:15px;background:#dc3545;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Biased!</button>
                            <button id="fair-btn" style="padding:15px;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Fair</button>
                        </div>
                    </div>
                `;

                let currentIndex = 0;

                function showScenario() {
                    if (currentIndex >= scenarios.length) {
                        state.completed = true;
                        const passed = state.correct >= Math.ceil(state.total * 0.7);
                        onComplete(passed, Math.floor((state.correct / state.total) * 100));
                        return;
                    }

                    container.querySelector('#scenario-display').innerHTML = `<p style="font-size:1.1em;margin:0;">${scenarios[currentIndex].scenario}</p>`;
                }

                container.querySelector('#biased-btn').addEventListener('click', () => {
                    if (scenarios[currentIndex].hasBias) state.correct++;
                    container.querySelector('#score').textContent = state.correct;
                    currentIndex++;
                    showScenario();
                });

                container.querySelector('#fair-btn').addEventListener('click', () => {
                    if (!scenarios[currentIndex].hasBias) state.correct++;
                    container.querySelector('#score').textContent = state.correct;
                    currentIndex++;
                    showScenario();
                });

                showScenario();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.correct / state.total) * 100));
                });

                return state;
            }
        },

        // Game 2: Privacy Protector
        privacyProtector: {
            name: 'Privacy Protector',
            description: 'Decide which data permissions to approve or deny!',
            init: function(container, onComplete) {
                const state = { decisions: 0, total: 8, correct: 0, completed: false };

                const permissions = [
                    { app: 'Weather App', permission: 'Location', necessary: true },
                    { app: 'Calculator', permission: 'Contacts', necessary: false },
                    { app: 'Camera App', permission: 'Camera', necessary: true },
                    { app: 'Flashlight', permission: 'Microphone', necessary: false },
                    { app: 'Maps', permission: 'Location', necessary: true },
                    { app: 'Notes App', permission: 'Call History', necessary: false },
                    { app: 'Music Player', permission: 'Storage', necessary: true },
                    { app: 'Clock', permission: 'SMS Access', necessary: false }
                ].sort(() => Math.random() - 0.5);

                container.innerHTML = `
                    <div class="mini-game privacy-protector">
                        <div class="game-timer"><span id="timer">45</span>s</div>
                        <div class="game-score">Decisions: <span id="score">0</span>/${state.total}</div>
                        <div class="permission-display" id="permission-display" style="text-align:center;padding:20px;background:#f8f9fa;border-radius:10px;margin:10px 0;"></div>
                        <div class="privacy-buttons" style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                            <button id="approve-btn" style="padding:15px;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Approve</button>
                            <button id="deny-btn" style="padding:15px;background:#dc3545;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Deny</button>
                        </div>
                    </div>
                `;

                let currentIndex = 0;

                function showPermission() {
                    if (currentIndex >= permissions.length) {
                        state.completed = true;
                        const passed = state.correct >= Math.ceil(state.total * 0.7);
                        onComplete(passed, Math.floor((state.correct / state.total) * 100));
                        return;
                    }

                    const p = permissions[currentIndex];
                    container.querySelector('#permission-display').innerHTML = `
                        <p style="font-size:1.2em;margin:0 0 10px 0;"><strong>${p.app}</strong></p>
                        <p style="margin:0;">wants access to: <strong>${p.permission}</strong></p>
                    `;
                }

                container.querySelector('#approve-btn').addEventListener('click', () => {
                    if (permissions[currentIndex].necessary) state.correct++;
                    state.decisions++;
                    container.querySelector('#score').textContent = state.decisions;
                    currentIndex++;
                    showPermission();
                });

                container.querySelector('#deny-btn').addEventListener('click', () => {
                    if (!permissions[currentIndex].necessary) state.correct++;
                    state.decisions++;
                    container.querySelector('#score').textContent = state.decisions;
                    currentIndex++;
                    showPermission();
                });

                showPermission();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.correct / state.total) * 100));
                });

                return state;
            }
        },

        // Game 3: Data Trend Spotter
        dataTrendSpotter: {
            name: 'Data Trend Spotter',
            description: 'Look at simple graphs and identify the trend!',
            init: function(container, onComplete) {
                const state = { correct: 0, total: 6, completed: false };

                const trends = [
                    { data: [10, 20, 30, 40, 50], trend: 'rising', label: 'Temperature' },
                    { data: [50, 40, 30, 20, 10], trend: 'falling', label: 'Stock Price' },
                    { data: [30, 32, 28, 31, 29], trend: 'stable', label: 'Humidity' },
                    { data: [5, 15, 25, 35, 45], trend: 'rising', label: 'Sales' },
                    { data: [100, 80, 60, 40, 20], trend: 'falling', label: 'Inventory' },
                    { data: [50, 48, 52, 49, 51], trend: 'stable', label: 'Average Score' }
                ].sort(() => Math.random() - 0.5);

                container.innerHTML = `
                    <div class="mini-game trend-spotter">
                        <div class="game-timer"><span id="timer">45</span>s</div>
                        <div class="game-score">Correct: <span id="score">0</span>/${state.total}</div>
                        <div class="chart-display" id="chart-display" style="padding:15px;background:#f8f9fa;border-radius:10px;margin:10px 0;min-height:120px;"></div>
                        <div class="trend-buttons" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
                            <button data-trend="rising" style="padding:15px;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Rising</button>
                            <button data-trend="stable" style="padding:15px;background:#ffc107;color:#333;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Stable</button>
                            <button data-trend="falling" style="padding:15px;background:#dc3545;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Falling</button>
                        </div>
                    </div>
                `;

                let currentIndex = 0;

                function showChart() {
                    if (currentIndex >= trends.length) {
                        state.completed = true;
                        const passed = state.correct >= Math.ceil(state.total * 0.7);
                        onComplete(passed, Math.floor((state.correct / state.total) * 100));
                        return;
                    }

                    const t = trends[currentIndex];
                    const maxVal = Math.max(...t.data);
                    const chartHtml = t.data.map((v, i) => {
                        const height = (v / maxVal) * 80;
                        return `<div style="width:40px;height:${height}px;background:linear-gradient(180deg,#667eea,#764ba2);border-radius:4px 4px 0 0;"></div>`;
                    }).join('');

                    container.querySelector('#chart-display').innerHTML = `
                        <p style="text-align:center;margin:0 0 10px 0;font-weight:bold;">${t.label}</p>
                        <div style="display:flex;align-items:flex-end;justify-content:center;gap:8px;height:100px;">${chartHtml}</div>
                    `;
                }

                container.querySelectorAll('[data-trend]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        if (btn.dataset.trend === trends[currentIndex].trend) state.correct++;
                        container.querySelector('#score').textContent = state.correct;
                        currentIndex++;
                        showChart();
                    });
                });

                showChart();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.correct / state.total) * 100));
                });

                return state;
            }
        },

        // Game 4: Chart Champion
        chartChampion: {
            name: 'Chart Champion',
            description: 'Match data types with the best visualization!',
            init: function(container, onComplete) {
                const state = { matched: 0, total: 5, completed: false };

                const matches = [
                    { dataType: 'Time series data', chart: 'Line chart' },
                    { dataType: 'Proportions/percentages', chart: 'Pie chart' },
                    { dataType: 'Comparing categories', chart: 'Bar chart' },
                    { dataType: 'Relationship between variables', chart: 'Scatter plot' },
                    { dataType: 'Geographic data', chart: 'Map' }
                ];

                container.innerHTML = `
                    <div class="mini-game chart-champion">
                        <div class="game-timer"><span id="timer">45</span>s</div>
                        <div class="game-score">Matched: <span id="score">0</span>/${state.total}</div>
                        <div class="data-type-display" id="data-type" style="text-align:center;padding:15px;background:#1e1e1e;color:#00ff00;border-radius:10px;margin:10px 0;font-size:1.1em;"></div>
                        <div class="chart-options" id="chart-options" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;"></div>
                    </div>
                `;

                let currentIndex = 0;

                function showDataType() {
                    if (currentIndex >= matches.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }

                    const m = matches[currentIndex];
                    container.querySelector('#data-type').textContent = m.dataType;

                    const allCharts = matches.map(x => x.chart).filter(c => c !== m.chart);
                    const randomDistractors = allCharts.sort(() => Math.random() - 0.5).slice(0, 3);
                    const charts = [m.chart, ...randomDistractors].sort(() => Math.random() - 0.5);
                    const optionsDiv = container.querySelector('#chart-options');
                    optionsDiv.innerHTML = '';

                    charts.forEach(chart => {
                        const btn = document.createElement('button');
                        btn.textContent = chart;
                        btn.style.cssText = 'padding:12px;background:#f8f9fa;border:2px solid #667eea;border-radius:8px;cursor:pointer;font-weight:bold;';
                        btn.addEventListener('click', () => {
                            if (chart === m.chart) {
                                btn.style.background = '#d4edda';
                                state.matched++;
                                container.querySelector('#score').textContent = state.matched;
                                currentIndex++;
                                setTimeout(showDataType, 300);
                            } else {
                                btn.style.background = '#f8d7da';
                                btn.disabled = true;
                            }
                        });
                        optionsDiv.appendChild(btn);
                    });
                }

                showDataType();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.matched / state.total) * 100));
                });

                return state;
            }
        },

        // Game 5: Ethical Dilemma Dash (scored AP CSP impacts decisions)
        ethicalDilemmaDash: {
            name: 'Ethical Dilemma Dash',
            description: 'Choose the most responsible computing decision for each scenario.',
            init: function(container, onComplete) {
                const state = { correct: 0, answered: 0, total: 6, completed: false };

                const dilemmas = [
                    { question: 'A school AI tool gives lower scores to one demographic. Best next step?', options: ['Ignore because AI is objective', 'Audit data/model for bias and retrain'], answer: 1 },
                    { question: 'An app asks for contacts but only needs a calculator feature. Best action?', options: ['Deny unnecessary permission', 'Allow all permissions always'], answer: 0 },
                    { question: 'A company wants to publish student data with names attached. Best practice?', options: ['Anonymize/de-identify data first', 'Publish full names for transparency'], answer: 0 },
                    { question: 'AI-generated study guide is posted as human-written. Best practice?', options: ['Label AI-generated content clearly', 'Hide AI use to avoid confusion'], answer: 0 },
                    { question: 'Facial recognition is used with no opt-out in public spaces. Best response?', options: ['Require safeguards, limits, and oversight', 'Deploy everywhere immediately'], answer: 0 },
                    { question: 'A recommendation system amplifies harmful misinformation. Best step?', options: ['Adjust algorithm and add safety review', 'Increase engagement regardless of harm'], answer: 0 }
                ].sort(() => Math.random() - 0.5);

                container.innerHTML = `
                    <div class="mini-game ethical-dash">
                        <div class="game-timer"><span id="timer">45</span>s</div>
                        <div class="game-score">Correct: <span id="score">0</span>/${state.total}</div>
                        <div class="dilemma-display" id="dilemma" style="text-align:center;padding:20px;background:#f8f9fa;border-radius:10px;margin:10px 0;min-height:80px;"></div>
                        <div class="dilemma-options" id="options" style="display:grid;grid-template-columns:1fr 1fr;gap:15px;"></div>
                    </div>
                `;

                let currentIndex = 0;

                function showDilemma() {
                    if (currentIndex >= dilemmas.length) {
                        state.completed = true;
                        const passed = state.correct >= Math.ceil(state.total * 0.7);
                        onComplete(passed, Math.floor((state.correct / state.total) * 100));
                        return;
                    }

                    const d = dilemmas[currentIndex];
                    const shuffledDilemma = shuffleOptionsWithAnswer(d.options, d.answer);
                    container.querySelector('#dilemma').innerHTML = `<p style="font-size:1.1em;margin:0;">${d.question}</p>`;

                    const optionsDiv = container.querySelector('#options');
                    optionsDiv.innerHTML = '';

                    shuffledDilemma.options.forEach((opt, i) => {
                        const btn = document.createElement('button');
                        btn.textContent = opt;
                        btn.style.cssText = 'padding:15px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;';
                        btn.addEventListener('click', () => {
                            if (i === shuffledDilemma.answer) {
                                state.correct++;
                            }
                            state.answered++;
                            container.querySelector('#score').textContent = state.correct;
                            currentIndex++;
                            showDilemma();
                        });
                        optionsDiv.appendChild(btn);
                    });
                }

                showDilemma();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.answered / state.total) * 100));
                });

                return state;
            }
        }
    };

    // =====================================================
    // UTILITY FUNCTIONS
    // =====================================================

    /**
     * Create an instruction box for mini-games
     * @param {string} howToPlay - Instructions on how to play
     * @param {string} goal - The goal to complete the game
     * @returns {string} HTML string for the instruction box
     */
    function createInstructionBox(howToPlay, goal) {
        return `
            <div class="game-instructions" style="background: linear-gradient(135deg, #e8f4fc 0%, #d4edda 100%); border-left: 4px solid #28a745; padding: 12px 15px; margin-bottom: 15px; border-radius: 8px; font-size: 0.9em;">
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <span style="font-size: 1.2em;">📋</span>
                    <div>
                        <strong style="color: #155724; display: block; margin-bottom: 5px;">How to Play:</strong>
                        <p style="margin: 0 0 8px 0; color: #333;">${howToPlay}</p>
                        <strong style="color: #155724; display: block; margin-bottom: 5px;">Goal:</strong>
                        <p style="margin: 0; color: #333;">${goal}</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create a two-column layout for games with code/controls
     * @param {string} leftContent - HTML for the left column (game area)
     * @param {string} rightContent - HTML for the right column (controls)
     * @returns {string} HTML string for the layout
     */
    function createTwoColumnLayout(leftContent, rightContent) {
        return `
            <div class="game-layout-columns" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; align-items: start;">
                <div class="game-left-column">${leftContent}</div>
                <div class="game-right-column">${rightContent}</div>
            </div>
        `;
    }

    function shuffleOptionsWithAnswer(options, answerIndex) {
        const entries = (options || []).map((text, idx) => ({ text, idx }));
        for (let i = entries.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = entries[i];
            entries[i] = entries[j];
            entries[j] = tmp;
        }

        const shuffledOptions = entries.map(e => e.text);
        const newAnswerIndex = entries.findIndex(e => e.idx === answerIndex);

        return {
            options: shuffledOptions,
            answer: newAnswerIndex < 0 ? 0 : newAnswerIndex
        };
    }

    function startTimer(timerElement, duration, onTimeout) {
        let remaining = Math.floor(duration / 1000);
        timerElement.textContent = remaining;

        const interval = setInterval(() => {
            remaining--;
            timerElement.textContent = remaining;

            if (remaining <= 0) {
                clearInterval(interval);
                onTimeout();
            }
        }, 1000);

        return () => clearInterval(interval);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =====================================================
    // GAME REGISTRY - Maps lesson numbers to games
    // =====================================================

    const GAME_REGISTRY = {
        1: LESSON_1_GAMES,
        2: LESSON_2_GAMES,
        3: LESSON_3_GAMES,
        4: LESSON_4_GAMES,
        5: LESSON_5_GAMES
    };

    const GAME_NAMES = {
        1: ['binaryConverter', 'dataTypeDetective', 'ifThenTower', 'bugSquasher', 'algorithmChef'],
        2: ['arrayAssembler', 'listLoopTracer', 'dataCleaner', 'abstractionBuilder', 'nestedNavigator'],
        3: ['ipAddressMatcher', 'dnsSpeedRun', 'packetPathfinder', 'urlDecoder', 'routerRush'],
        4: ['passwordStrengthSmash', 'caesarCipherCracker', 'phishingDetector', 'firewallFrenzy', 'encryptionKeyMatch'],
        5: ['biasBuster', 'privacyProtector', 'dataTrendSpotter', 'chartChampion', 'ethicalDilemmaDash']
    };

    // =====================================================
    // PUBLIC API
    // =====================================================

    /**
     * Get a random game for a specific lesson
     * @param {number} lessonNumber - The lesson number (1-5)
     * @returns {Object} The game object with name, description, and init function
     */
    function getRandomGameForLesson(lessonNumber) {
        const games = GAME_REGISTRY[lessonNumber];
        const gameNames = GAME_NAMES[lessonNumber];
        if (!games || !gameNames) return null;

        const randomName = gameNames[Math.floor(Math.random() * gameNames.length)];
        return games[randomName];
    }

    /**
     * Get a specific game by lesson and game name
     * @param {number} lessonNumber - The lesson number (1-5)
     * @param {string} gameName - The game name (e.g., 'loopRacer')
     * @returns {Object} The game object
     */
    function getGame(lessonNumber, gameName) {
        const games = GAME_REGISTRY[lessonNumber];
        return games ? games[gameName] : null;
    }

    /**
     * Get all games for a lesson
     * @param {number} lessonNumber - The lesson number (1-5)
     * @returns {Object} Object containing all games for the lesson
     */
    function getGamesForLesson(lessonNumber) {
        return GAME_REGISTRY[lessonNumber];
    }

    /**
     * Get game distribution for a row (2 same games, 3 different)
     * @param {number} lessonNumber - The lesson number (1-5)
     * @returns {Array} Array of 5 game names with 2 duplicates at random positions
     */
    function getGameDistributionForRow(lessonNumber) {
        const gameNames = GAME_NAMES[lessonNumber];
        if (!gameNames) return [];

        // Pick which game will be duplicated
        const duplicateGame = gameNames[Math.floor(Math.random() * gameNames.length)];

        // Get other unique games
        const otherGames = gameNames.filter(g => g !== duplicateGame);
        const selectedOthers = otherGames.slice(0, 3);

        // Create array with duplicate and others
        const distribution = [duplicateGame, duplicateGame, ...selectedOthers];

        // Shuffle to randomize positions
        for (let i = distribution.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [distribution[i], distribution[j]] = [distribution[j], distribution[i]];
        }

        return distribution;
    }

    /**
     * Get the lesson mini-game (first game in the list for that lesson)
     * @param {number} lessonNumber - The lesson number (1-5)
     * @returns {Object} The game object for the lesson's main mini-game
     */
    function getLessonMiniGame(lessonNumber) {
        const games = GAME_REGISTRY[lessonNumber];
        const gameNames = GAME_NAMES[lessonNumber];
        if (!games || !gameNames) return null;

        // Return the first game as the lesson mini-game
        return games[gameNames[0]];
    }

    // Export to global scope
    window.MiniGames = {
        getRandomGameForLesson,
        getGame,
        getGamesForLesson,
        getGameDistributionForRow,
        getLessonMiniGame,
        GAME_REGISTRY,
        GAME_NAMES
    };

})();
