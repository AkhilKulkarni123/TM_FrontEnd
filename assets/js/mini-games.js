/**
 * Mini-Games System for Snakes & Ladders Educational Game
 * Contains 25 unique mini-games (5 per lesson topic)
 * Each game is designed to be 30-60 seconds and related to the lesson content
 */

(function() {
    'use strict';

    // Game configuration
    const GAME_DURATION = 45000; // 45 seconds default
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
                            <span style="font-weight: bold; color: #667eea;">💾 Binary Converter</span>
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
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
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
                            <span style="font-weight: bold; color: #667eea;">🔍 Data Type Detective</span>
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
                            <span style="font-weight: bold; color: #667eea;">🏗️ If-Then Tower</span>
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
                            <span style="font-weight: bold; color: #667eea;">🐛 Bug Squasher</span>
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
                            <span style="font-weight: bold; color: #667eea;">👨‍🍳 Algorithm Chef: ${recipe.name}</span>
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
    // LESSON 2: Data Structures
    // Games: Array Assembler, Object Detective, Stack Attack, Queue Quest, Nested Navigator
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
                            <span style="font-weight: bold; color: #667eea;">📦 Array Assembler</span>
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

        // Game 2: Object Detective - Match properties to objects
        objectDetective: {
            name: 'Object Detective',
            description: 'Match the properties to the correct objects!',
            init: function(container, onComplete) {
                const state = { score: 0, total: 6, completed: false };

                const clues = [
                    { clue: 'Has 4 wheels and an engine', answer: 'car', options: ['car', 'bicycle', 'boat'] },
                    { clue: 'Has pages and a cover', answer: 'book', options: ['book', 'phone', 'lamp'] },
                    { clue: 'Has a screen and keyboard', answer: 'laptop', options: ['laptop', 'chair', 'table'] },
                    { clue: 'Has wings and can fly', answer: 'plane', options: ['plane', 'train', 'bus'] },
                    { clue: 'Has strings and makes music', answer: 'guitar', options: ['guitar', 'drum', 'piano'] },
                    { clue: 'Has roots and leaves', answer: 'tree', options: ['tree', 'rock', 'cloud'] }
                ];

                container.innerHTML = `
                    <div class="mini-game object-detective" style="width: 100%;">
                        <div class="game-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div class="game-timer" style="background: #1e1e1e; color: #ffd700; padding: 5px 15px; border-radius: 20px; font-weight: bold;"><span id="timer">45</span>s</div>
                            <span style="font-weight: bold; color: #667eea;">🔍 Object Detective</span>
                            <div class="game-score" style="font-weight: bold;">Solved: <span id="score">0</span>/${state.total}</div>
                        </div>
                        <div class="game-layout-horizontal" style="display: flex; gap: 30px; align-items: center; width: 100%;">
                            <div class="clue-box" id="clue-box" style="flex: 1; padding:15px;background:#f8f9fa;border-radius:10px; min-width: 300px;"></div>
                            <div class="options-grid" id="options-grid" style="display:flex;gap:12px;flex-wrap:wrap; flex: 1;"></div>
                        </div>
                    </div>
                `;

                let currentClue = 0;

                function showClue() {
                    if (currentClue >= clues.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }

                    const clue = clues[currentClue];
                    container.querySelector('#clue-box').innerHTML = `<p style="font-size:1.1em;margin:0;"><strong>Clue:</strong> ${clue.clue}</p>`;

                    const optionsGrid = container.querySelector('#options-grid');
                    optionsGrid.innerHTML = '';
                    const shuffled = [...clue.options].sort(() => Math.random() - 0.5);

                    shuffled.forEach(option => {
                        const btn = document.createElement('button');
                        btn.textContent = option;
                        btn.style.cssText = 'padding:15px 25px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:10px;cursor:pointer;font-size:1em;font-weight:bold;transition:transform 0.2s;';
                        btn.addEventListener('click', () => {
                            if (option === clue.answer) {
                                btn.style.background = '#28a745';
                                state.score++;
                                container.querySelector('#score').textContent = state.score;
                                currentClue++;
                                setTimeout(showClue, 500);
                            } else {
                                btn.style.background = '#dc3545';
                                btn.disabled = true;
                            }
                        });
                        optionsGrid.appendChild(btn);
                    });
                }

                showClue();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.score / state.total) * 100));
                });

                return state;
            }
        },

        // Game 3: Stack Attack - LIFO card stacking game
        stackAttack: {
            name: 'Stack Attack',
            description: 'Use LIFO (Last In, First Out) rules to complete the challenge!',
            init: function(container, onComplete) {
                const state = { completed: false };

                container.innerHTML = `
                    <div class="mini-game stack-attack" style="width: 100%;">
                        <div class="game-header">
                            <div class="game-timer"><span id="timer">45</span>s</div>
                            <span style="font-weight: bold; color: #667eea;">📚 Stack Attack</span>
                        </div>
                        <div class="game-instructions" style="margin-bottom: 8px; font-size: 0.9em; text-align: center;">
                            <strong>🎯 Goal:</strong> Remove all RED cards using LIFO (Last In, First Out). Keep BLUE cards!
                        </div>
                        <div class="game-layout-horizontal" style="display: flex; gap: 40px; align-items: flex-start; width: 100%;">
                            <div class="game-visual-area" style="display: flex; gap: 25px; flex-shrink: 0;">
                                <div style="text-align: center;">
                                    <p style="margin-bottom: 8px; font-weight: bold; color: #333;">Stack</p>
                                    <div class="stack" id="main-stack" style="display:flex;flex-direction:column-reverse;align-items:center;min-height:200px;width:100px;border:3px solid #333;border-radius:10px;padding:10px;background:#f8f9fa;"></div>
                                </div>
                                <div style="text-align: center;">
                                    <p style="margin-bottom: 8px; font-weight: bold; color: #999;">Removed</p>
                                    <div class="removed" id="removed-stack" style="display:flex;flex-direction:column-reverse;align-items:center;min-height:200px;width:100px;border:3px dashed #999;border-radius:10px;padding:10px;"></div>
                                </div>
                            </div>
                            <div class="game-controls-area" style="flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 280px;">
                                <div style="background: #f8f9fa; padding: 18px; border-radius: 10px; margin-bottom: 18px;">
                                    <p style="margin: 0 0 10px 0; font-size: 1em;"><strong>LIFO Rule:</strong> Only the TOP card can be removed!</p>
                                    <p style="margin: 0; font-size: 0.9em; color: #666;">Pop red cards first, before reaching blue ones.</p>
                                </div>
                                <button id="pop-btn" style="padding:16px 40px;background:#dc3545;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:bold;font-size:1.1em;">⬆️ Pop Top Card</button>
                            </div>
                        </div>
                    </div>
                `;

                const mainStack = container.querySelector('#main-stack');
                const removedStack = container.querySelector('#removed-stack');
                const cards = ['red', 'blue', 'red', 'blue', 'red'];
                let stack = [...cards];
                let blueRemoved = false;

                function renderStack() {
                    mainStack.innerHTML = '';
                    stack.forEach((card, i) => {
                        const div = document.createElement('div');
                        div.style.cssText = `width:60px;height:30px;background:${card};border-radius:4px;margin:2px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;`;
                        div.textContent = card.toUpperCase();
                        mainStack.appendChild(div);
                    });
                }

                container.querySelector('#pop-btn').addEventListener('click', () => {
                    if (stack.length === 0) return;

                    const top = stack.pop();
                    if (top === 'blue') {
                        blueRemoved = true;
                        alert('Oops! You removed a BLUE card. Try again!');
                        stack = [...cards];
                        removedStack.innerHTML = '<span style="color:#999;font-size:0.8em;">Removed</span>';
                    } else {
                        const div = document.createElement('div');
                        div.style.cssText = 'width:60px;height:30px;background:red;border-radius:4px;margin:2px;';
                        removedStack.appendChild(div);
                    }

                    renderStack();

                    // Check win - all red cards removed
                    if (stack.every(c => c === 'blue') && stack.length > 0) {
                        state.completed = true;
                        onComplete(true, 100);
                    }
                });

                renderStack();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, 0);
                });

                return state;
            }
        },

        // Game 4: Queue Quest - FIFO customer management
        queueQuest: {
            name: 'Queue Quest',
            description: 'Manage the customer queue using FIFO (First In, First Out)!',
            init: function(container, onComplete) {
                const state = { served: 0, target: 8, completed: false };

                const customers = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
                let queue = [];
                let nextCustomer = 0;

                container.innerHTML = `
                    <div class="mini-game queue-quest" style="width: 100%;">
                        <div class="game-header">
                            <div class="game-timer"><span id="timer">45</span>s</div>
                            <span style="font-weight: bold; color: #667eea;">🎫 Queue Quest</span>
                            <div class="game-score">Served: <span id="score">0</span>/${state.target}</div>
                        </div>
                        <div class="game-instructions" style="margin-bottom: 8px; font-size: 0.9em; text-align: center;">
                            <strong>🎯 Goal:</strong> Serve 8 customers using FIFO (First In, First Out). Gold = first in line.
                        </div>
                        <div class="game-layout-horizontal" style="display: flex; gap: 40px; align-items: flex-start; width: 100%;">
                            <div class="game-visual-area" style="flex: 1; min-width: 350px;">
                                <p style="font-weight: bold; margin-bottom: 10px; color: #555;">Customer Queue:</p>
                                <div class="queue-display" id="queue-display" style="display:flex;gap:12px;flex-wrap:wrap;min-height:70px;padding:15px;background:#f8f9fa;border-radius:12px;border:2px solid #ddd;"></div>
                                <p id="status" style="margin-top:12px;color:#666;min-height:24px;font-size:1em;"></p>
                            </div>
                            <div class="game-controls-area" style="flex-shrink: 0; min-width: 220px;">
                                <div style="background: #f0f7ff; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                                    <p style="margin: 0; font-size: 1em;"><strong>FIFO:</strong> First In, First Out</p>
                                    <p style="margin: 8px 0 0 0; font-size: 0.9em; color: #666;">Always serve the gold customer first!</p>
                                </div>
                                <div style="display:flex;flex-direction:column;gap:12px;">
                                    <button id="add-customer" style="padding:14px 24px;background:#28a745;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:bold;font-size:1em;">➕ New Customer</button>
                                    <button id="serve-customer" style="padding:14px 24px;background:#667eea;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:bold;font-size:1em;">✅ Serve First</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                const queueDisplay = container.querySelector('#queue-display');
                const status = container.querySelector('#status');

                function renderQueue() {
                    queueDisplay.innerHTML = '';
                    if (queue.length === 0) {
                        queueDisplay.innerHTML = '<span style="color:#999;">Queue is empty</span>';
                        return;
                    }
                    queue.forEach((customer, i) => {
                        const div = document.createElement('div');
                        div.style.cssText = `padding:8px 15px;background:${i === 0 ? '#ffd700' : '#e8f4fc'};border:2px solid ${i === 0 ? '#f39c12' : '#3498db'};border-radius:20px;font-weight:bold;`;
                        div.textContent = customer;
                        queueDisplay.appendChild(div);
                    });
                }

                container.querySelector('#add-customer').addEventListener('click', () => {
                    if (queue.length >= 5) {
                        status.textContent = 'Queue is full! Serve customers first.';
                        status.style.color = '#dc3545';
                        return;
                    }
                    queue.push(customers[nextCustomer % customers.length]);
                    nextCustomer++;
                    status.textContent = '';
                    renderQueue();
                });

                container.querySelector('#serve-customer').addEventListener('click', () => {
                    if (queue.length === 0) {
                        status.textContent = 'No customers to serve!';
                        status.style.color = '#dc3545';
                        return;
                    }
                    const served = queue.shift(); // FIFO - remove first
                    state.served++;
                    container.querySelector('#score').textContent = state.served;
                    status.textContent = `Served ${served}!`;
                    status.style.color = '#28a745';
                    renderQueue();

                    if (state.served >= state.target) {
                        state.completed = true;
                        onComplete(true, 100);
                    }
                });

                // Start with some customers
                queue = [customers[0], customers[1], customers[2]];
                nextCustomer = 3;
                renderQueue();

                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.served / state.target) * 100));
                });

                return state;
            }
        },

        // Game 5: Nested Navigator - Navigate through nested objects
        nestedNavigator: {
            name: 'Nested Navigator',
            description: 'Navigate through nested data structures!',
            init: function(container, onComplete) {
                const state = { score: 0, total: 5, completed: false };

                const challenges = [
                    { path: 'user.name', data: { user: { name: 'Alice', age: 25 } }, answer: 'Alice' },
                    { path: 'user.address.city', data: { user: { address: { city: 'NYC', zip: '10001' } } }, answer: 'NYC' },
                    { path: 'items[0]', data: { items: ['apple', 'banana', 'orange'] }, answer: 'apple' },
                    { path: 'products[1].price', data: { products: [{ name: 'A', price: 10 }, { name: 'B', price: 20 }] }, answer: '20' },
                    { path: 'config.settings.theme', data: { config: { settings: { theme: 'dark', lang: 'en' } } }, answer: 'dark' }
                ];

                container.innerHTML = `
                    <div class="mini-game nested-navigator" style="width: 100%;">
                        <div class="game-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div class="game-timer" style="background: #1e1e1e; color: #ffd700; padding: 5px 15px; border-radius: 20px; font-weight: bold;"><span id="timer">45</span>s</div>
                            <span style="font-weight: bold; color: #667eea;">🧭 Nested Navigator</span>
                            <div class="game-score" style="font-weight: bold;">Found: <span id="score">0</span>/${state.total}</div>
                        </div>
                        <div class="game-layout-horizontal" style="display: flex; gap: 30px; align-items: flex-start; width: 100%;">
                            <div style="flex: 1; min-width: 300px;">
                                <div class="path-display" id="path-display" style="font-family:monospace;font-size:1.1em;padding:10px;background:#1e1e1e;color:#ffd700;border-radius:8px;margin-bottom:10px;"></div>
                                <div class="data-display" id="data-display" style="font-family:monospace;padding:12px;background:#f8f9fa;border-radius:10px;font-size:0.9em;"></div>
                            </div>
                            <div style="flex: 1; min-width: 280px; display: flex; flex-direction: column; gap: 10px;">
                                <div style="font-weight: 600; color: #555;">Enter the value at this path:</div>
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
                    container.querySelector('#path-display').textContent = `Find: ${challenge.path}`;
                    container.querySelector('#data-display').innerHTML = `<pre style="margin:0;white-space:pre-wrap;">${JSON.stringify(challenge.data, null, 2)}</pre>`;
                    container.querySelector('#answer-input').value = '';
                }

                container.querySelector('#submit-btn').addEventListener('click', () => {
                    const input = container.querySelector('#answer-input').value.trim();
                    const challenge = challenges[currentChallenge];

                    if (input === challenge.answer) {
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
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
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
                            <span style="font-weight: bold; color: #667eea;">🌐 IP Address Matcher</span>
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
                            <span style="font-weight: bold; color: #667eea;">🌐 DNS Speed Run</span>
                            <div class="game-score" style="font-weight: bold;">Translated: <span id="score">0</span>/${state.total}</div>
                        </div>
                        <div class="game-instructions" style="margin-bottom: 8px; font-size: 0.9em; text-align: center;">
                            <strong>🎯 Goal:</strong> Click the correct IP address for each domain name.
                        </div>
                        <div class="game-layout-horizontal" style="display: flex; gap: 40px; align-items: center; width: 100%;">
                            <div class="domain-display" id="domain-display" style="flex: 1; text-align:center;font-size:1.2em;padding:15px;background:#1e1e1e;color:#00ff00;border-radius:10px;font-family:monospace;min-width:200px;"></div>
                            <div class="ip-options" id="ip-options" style="flex: 2; display:grid;grid-template-columns:repeat(2,1fr);gap:10px;"></div>
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
                    const options = [current.ip];
                    while (options.length < 4) {
                        const randomIP = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
                        if (!options.includes(randomIP)) options.push(randomIP);
                    }
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
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.score / state.total) * 100));
                });

                return state;
            }
        },

        // Game 3: Packet Pathfinder
        packetPathfinder: {
            name: 'Packet Pathfinder',
            description: 'Guide data packets through routers to their destination!',
            init: function(container, onComplete) {
                const state = { delivered: 0, total: 3, completed: false };

                container.innerHTML = `
                    <div class="mini-game packet-pathfinder">
                        <div class="game-timer"><span id="timer">45</span>s</div>
                        <div class="game-score">Delivered: <span id="score">0</span>/${state.total}</div>
                        <div class="network-grid" id="network-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;"></div>
                        <p id="status" style="text-align:center;margin-top:10px;"></p>
                    </div>
                `;

                const grid = container.querySelector('#network-grid');
                let packet = { x: 0, y: 2 };
                let destination = { x: 4, y: 2 };
                let path = [];

                function renderNetwork() {
                    grid.innerHTML = '';
                    for (let y = 0; y < 5; y++) {
                        for (let x = 0; x < 5; x++) {
                            const cell = document.createElement('div');
                            cell.dataset.x = x;
                            cell.dataset.y = y;
                            cell.style.cssText = 'aspect-ratio:1;background:#2a2a4a;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.2em;transition:background 0.2s;';

                            if (x === packet.x && y === packet.y) {
                                cell.textContent = '📦';
                                cell.style.background = '#ffd700';
                            } else if (x === destination.x && y === destination.y) {
                                cell.textContent = '🎯';
                                cell.style.background = '#28a745';
                            } else if ((x === 2 && y === 1) || (x === 2 && y === 3)) {
                                cell.textContent = '📡';
                                cell.style.background = '#3498db';
                            } else if (path.some(p => p.x === x && p.y === y)) {
                                cell.style.background = '#90cdf4';
                            }

                            cell.addEventListener('click', () => {
                                const cx = parseInt(cell.dataset.x);
                                const cy = parseInt(cell.dataset.y);

                                // Check if adjacent to packet or last path point
                                const lastPoint = path.length > 0 ? path[path.length - 1] : packet;
                                const dx = Math.abs(cx - lastPoint.x);
                                const dy = Math.abs(cy - lastPoint.y);

                                if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                                    path.push({ x: cx, y: cy });
                                    renderNetwork();

                                    if (cx === destination.x && cy === destination.y) {
                                        state.delivered++;
                                        container.querySelector('#score').textContent = state.delivered;
                                        container.querySelector('#status').textContent = 'Packet delivered!';
                                        container.querySelector('#status').style.color = '#28a745';

                                        if (state.delivered >= state.total) {
                                            state.completed = true;
                                            onComplete(true, 100);
                                        } else {
                                            // Reset for next packet
                                            setTimeout(() => {
                                                packet = { x: 0, y: Math.floor(Math.random() * 5) };
                                                destination = { x: 4, y: Math.floor(Math.random() * 5) };
                                                path = [];
                                                container.querySelector('#status').textContent = '';
                                                renderNetwork();
                                            }, 500);
                                        }
                                    }
                                }
                            });

                            grid.appendChild(cell);
                        }
                    }
                }

                renderNetwork();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
                    if (!state.completed) onComplete(false, Math.floor((state.delivered / state.total) * 100));
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
                    container.querySelector('#question-area').innerHTML = `<p>Which part is the <strong style="color:${part.color}">${part.part}</strong>?</p>`;

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
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
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
                const state = { sorted: 0, total: 10, completed: false, errors: 0 };

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
                    }
                    showPacket();
                });

                container.querySelector('#network-b').addEventListener('click', () => {
                    if (currentPacket.network === 'Network B') {
                        state.sorted++;
                        container.querySelector('#score').textContent = state.sorted;
                    } else {
                        state.errors++;
                    }
                    showPacket();
                });

                showPacket();
                startTimer(container.querySelector('#timer'), GAME_DURATION, () => {
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
                        const passed = state.correct >= state.total;
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
                        const passed = state.correct >= state.total;
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
                        const passed = state.correct >= state.total;
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

                    const charts = matches.map(x => x.chart).sort(() => Math.random() - 0.5);
                    const optionsDiv = container.querySelector('#chart-options');
                    optionsDiv.innerHTML = '';

                    charts.slice(0, 4).forEach(chart => {
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

        // Game 5: Ethical Dilemma Dash
        ethicalDilemmaDash: {
            name: 'Ethical Dilemma Dash',
            description: 'Make quick ethical decisions on computing scenarios!',
            init: function(container, onComplete) {
                const state = { answered: 0, total: 6, completed: false };

                const dilemmas = [
                    { question: 'Should AI be used for criminal sentencing?', options: ['Yes, more consistent', 'No, potential bias'] },
                    { question: 'Should companies sell user data to advertisers?', options: ['Yes, free services', 'No, privacy matters'] },
                    { question: 'Should facial recognition be used in public?', options: ['Yes, for safety', 'No, surveillance concern'] },
                    { question: 'Should algorithms decide loan approvals alone?', options: ['Yes, faster decisions', 'No, human review needed'] },
                    { question: 'Should kids\' data be collected by educational apps?', options: ['Yes, for personalization', 'No, protect minors'] },
                    { question: 'Should AI-generated content be labeled?', options: ['Yes, transparency', 'No, unnecessary'] }
                ].sort(() => Math.random() - 0.5);

                container.innerHTML = `
                    <div class="mini-game ethical-dash">
                        <div class="game-timer"><span id="timer">45</span>s</div>
                        <div class="game-score">Answered: <span id="score">0</span>/${state.total}</div>
                        <div class="dilemma-display" id="dilemma" style="text-align:center;padding:20px;background:#f8f9fa;border-radius:10px;margin:10px 0;min-height:80px;"></div>
                        <div class="dilemma-options" id="options" style="display:grid;grid-template-columns:1fr 1fr;gap:15px;"></div>
                    </div>
                `;

                let currentIndex = 0;

                function showDilemma() {
                    if (currentIndex >= dilemmas.length) {
                        state.completed = true;
                        onComplete(true, 100);
                        return;
                    }

                    const d = dilemmas[currentIndex];
                    container.querySelector('#dilemma').innerHTML = `<p style="font-size:1.1em;margin:0;">${d.question}</p>`;

                    const optionsDiv = container.querySelector('#options');
                    optionsDiv.innerHTML = '';

                    d.options.forEach(opt => {
                        const btn = document.createElement('button');
                        btn.textContent = opt;
                        btn.style.cssText = 'padding:15px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;';
                        btn.addEventListener('click', () => {
                            state.answered++;
                            container.querySelector('#score').textContent = state.answered;
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
        2: ['arrayAssembler', 'objectDetective', 'stackAttack', 'queueQuest', 'nestedNavigator'],
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
