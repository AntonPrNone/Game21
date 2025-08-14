document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const gameBoard = document.getElementById('game-board');
    const restartBtn = document.getElementById('restart-btn');
    const levelComplete = document.getElementById('level-complete');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const currentLevelDisplay = document.getElementById('current-level');

    const colorMap = {
        yellow: '#FFD700',
        red: '#FF6B6B',
        blue: '#1E90FF',
        green: '#32CD32',
        purple: '#B57EDC'
    };

    // Создаем элемент таймера
    const timerElement = document.createElement('div');
    timerElement.className = 'timer';
    timerElement.innerHTML = '20:00';
    document.querySelector('.level-indicator').after(timerElement);

    // Состояние игры
    let currentLevel = 1;
    let selectedTiles = [];
    let availableTiles = [];
    let timeLeft = 20 * 60; // 20 минут в секундах
    let timerInterval;
    let selectedShapeType = null; // Для Уровня 5: отслеживание выбранного типа фигуры
    let allShapeTypesOfCurrentType = []; // Для Уровня 5: хранение всех плиток текущего типа

    // Определение уровней
    const levels = {
        1: {
            grid: '2x2',
            columns: 2,
            tiles: [
                { type: 'atom', color: 'yellow' },
                { type: 'atom', color: 'red' },
                { type: 'moon', color: 'yellow' },
                { type: 'moon', color: 'yellow' }
            ],
            rule: (lastSelected, currentTile, index) => {
                if (selectedTiles.length === 0) return true;
                
                const last = lastSelected;
                const lastIndex = selectedTiles[selectedTiles.length - 1].index;
                
                const lastRow = Math.floor(lastIndex / 2);
                const lastCol = lastIndex % 2;
                const currentRow = Math.floor(index / 2);
                const currentCol = index % 2;
                
                const isAdjacent = (
                    (lastRow === currentRow && Math.abs(lastCol - currentCol) === 1) ||
                    (lastCol === currentCol && Math.abs(lastRow - currentRow) === 1)
                );
                
                return isAdjacent && (last.type === currentTile.type || last.color === currentTile.color);
            }
        },
        2: {
            grid: '3x3',
            columns: 3,
            tiles: [
                { type: 'diamond', color: 'blue' },
                { type: 'moon', color: 'yellow' },
                { type: 'diamond', color: 'yellow' },
                { type: 'diamond', color: 'blue' },
                { type: 'moon', color: 'blue' },
                { type: 'atom', color: 'blue' },
                { type: 'moon', color: 'blue' },
                { type: 'moon', color: 'blue' },
                { type: 'atom', color: 'blue' }
            ],
            rule: (lastSelected, currentTile, index) => {
                if (selectedTiles.length === 0) return true;
                
                const last = lastSelected;
                const lastIndex = selectedTiles[selectedTiles.length - 1].index;
                
                const lastRow = Math.floor(lastIndex / 3);
                const lastCol = lastIndex % 3;
                const currentRow = Math.floor(index / 3);
                const currentCol = index % 3;
                
                const isAdjacent = (
                    (lastRow === currentRow && Math.abs(lastCol - currentCol) === 1) ||
                    (lastCol === currentCol && Math.abs(lastRow - currentRow) === 1)
                );
                
                return isAdjacent && (last.type === currentTile.type || last.color === currentTile.color);
            }
        },
        3: {
            grid: '3x3',
            columns: 3,
            tiles: [
                { type: 'diamond', color: 'green' },
                { type: 'diamond', color: 'green' },
                { type: 'diamond', color: 'yellow' },
                { type: 'diamond', color: 'blue' },
                { type: 'diamond', color: 'green' },
                { type: 'atom', color: 'yellow' },
                { type: 'diamond', color: 'red' },
                { type: 'diamond', color: 'green' },
                { type: 'moon', color: 'red' }
            ],
            rule: (lastSelected, currentTile, index) => {
                if (selectedTiles.length === 0) return true;
                const last = lastSelected;
                const lastIndex = selectedTiles[selectedTiles.length - 1].index;
                const lastRow = Math.floor(lastIndex / 3);
                const lastCol = lastIndex % 3;
                const currentRow = Math.floor(index / 3);
                const currentCol = index % 3;
                const rowDiff = Math.abs(lastRow - currentRow);
                const colDiff = Math.abs(lastCol - currentCol);
                const isValidMove = (
                    (rowDiff === 1 && colDiff === 1) || // Диагональ (соседняя)
                    (lastRow === currentRow && colDiff === 1) || // Горизонталь (только соседняя)
                    (lastCol === currentCol && rowDiff === 1)    // Вертикаль (только соседняя)
                );
                return isValidMove && last.color !== currentTile.color;
            }
        },
        4: {
            grid: '4x4',
            columns: 4,
            tiles: [
                { type: 'diamond', color: 'green' },
                { type: 'atom', color: 'blue' },
                { type: 'moon', color: 'yellow' },
                { type: 'diamond', color: 'black' },
                { type: 'atom', color: 'yellow' },
                { type: 'moon', color: 'green' },
                { type: 'diamond', color: 'red' },
                { type: 'atom', color: 'red' },
                { type: 'moon', color: 'blue' },
                { type: 'diamond', color: 'yellow' },
                { type: 'atom', color: 'green' },
                { type: 'moon', color: 'red' },
                { type: 'diamond', color: 'purple' },
                { type: 'atom', color: 'purple' },
                { type: 'moon', color: 'purple' },
                { type: 'diamond', color: 'green' }
            ],
            rule: (lastSelected, currentTile, index) => {
                if (selectedTiles.length === 0) return true;
                
                const last = lastSelected;
                const lastIndex = selectedTiles[selectedTiles.length - 1].index;
                
                const lastRow = Math.floor(lastIndex / 4);
                const lastCol = lastIndex % 4;
                const currentRow = Math.floor(index / 4);
                const currentCol = index % 4;
                
                const rowDiff = Math.abs(lastRow - currentRow);
                const colDiff = Math.abs(lastCol - currentCol);
                
                const isValidMove = (
                    (rowDiff === colDiff) || // Диагональ (любое количество клеток)
                    (rowDiff === 0 && currentCol > lastCol) // Только вправо (любое количество клеток)
                );
                
                return isValidMove;
            }
        },
        5: {
            grid: '4x4',
            columns: 4,
            tiles: [
                { type: 'atom', color: 'red' }, { type: 'atom', color: 'blue' }, { type: 'atom', color: 'green' }, { type: 'atom', color: 'yellow' },
                { type: 'moon', color: 'red' }, { type: 'diamond', color: 'blue' } , { type: 'moon', color: 'green' }, { type: 'moon', color: 'yellow' },
                { type: 'diamond', color: 'red' }, { type: 'moon', color: 'blue' } , { type: 'diamond', color: 'green' }, { type: 'diamond', color: 'yellow' },
                { type: 'atom', color: 'purple' }, { type: 'moon', color: 'purple' }, { type: 'diamond', color: 'purple' }, { type: 'atom', color: 'red' }
            ],
            rule: (lastSelected, currentTile, index) => {
                if (selectedTiles.length === 0) return true; // Первый выбор всегда разрешен

                // Отладочная информация
                console.log('Проверка правила для 5 уровня:');
                console.log('lastSelected:', lastSelected);
                console.log('currentTile:', currentTile);
                console.log('index:', index);

                const lastIndex = lastSelected.index;
                
                const lastRow = Math.floor(lastIndex / 4);
                const lastCol = lastIndex % 4;
                const currentRow = Math.floor(index / 4);
                const currentCol = index % 4;

                const rowDiff = Math.abs(lastRow - currentRow);
                const colDiff = Math.abs(lastCol - currentCol);

                console.log('lastRow:', lastRow, 'lastCol:', lastCol);
                console.log('currentRow:', currentRow, 'currentCol:', currentCol);
                console.log('rowDiff:', rowDiff, 'colDiff:', colDiff);

                const isDiagonalMove = rowDiff === colDiff && rowDiff > 0; // Диагональное движение на любое количество клеток
                const isHorizontalMove = rowDiff === 0 && colDiff > 0; // Горизонтальное движение (влево или вправо) на любое количество клеток

                console.log('isDiagonalMove:', isDiagonalMove, 'isHorizontalMove:', isHorizontalMove);
                console.log('Результат правила:', (isDiagonalMove || isHorizontalMove));

                // Цвет не влияет на правило, поэтому не проверяем его
                return (isDiagonalMove || isHorizontalMove);
            }
        }
    };

    // SVG иконки для элементов
    const svgIcons = {
        atom: (color) => `
            <svg viewBox="0 0 64 64" class="atom">
                <!-- Орбита 1 -->
                <ellipse cx="32" cy="32" rx="20" ry="10" transform="rotate(0 32 32)" stroke="var(--current-color)" fill="none" stroke-width="3"/>
                <!-- Орбита 2 -->
                <ellipse cx="32" cy="32" rx="20" ry="10" transform="rotate(60 32 32)" stroke="var(--current-color)" fill="none" stroke-width="3"/>
                <!-- Орбита 3 -->
                <ellipse cx="32" cy="32" rx="20" ry="10" transform="rotate(120 32 32)" stroke="var(--current-color)" fill="none" stroke-width="3"/>
                <!-- Ядро -->
                <circle cx="32" cy="32" r="3" fill="var(--current-color)" stroke="none" />
            </svg>
        `,
        moon: (color) => `
            <svg viewBox="0 0 100 100" class="moon">
                <path d="
                    M 70,50 
                    A 30,30 0 1,1 40,15 
                    A 20,20 0 1,0 70,50 
                    Z 
                " fill="none" stroke="var(--current-color)" stroke-width="4" transform="rotate(30 35 70)"></path>
            </svg>
        `,
        diamond: (color) => `
            <svg viewBox="0 0 100 100" class="diamond">
                <g transform="translate(12.5, 87.5) scale(0.015,-0.015)" fill="var(--current-color)" stroke="var(--current-color)" stroke-width="30">
                    <path d="M1295 4686 c-16 -7 -310 -297 -652 -644 -666 -676 -655 -662 -639 -746 5 -24 27 -60 65 -104 32 -37 581 -665 1220 -1397 1194 -1367 1201 -1375 1271 -1375 70 0 77 8 1271 1375 639 732 1188 1360 1220 1397 38 44 60 80 65 104 16 84 28 70 -643 749 -407 413 -635 637 -655 644 -21 8 -415 11 -1262 11 -1002 -1 -1237 -3 -1261 -14z m405 -289 c0 -2 -101 -209 -225 -460 l-224 -457 -368 0 -368 0 155 158 c85 86 290 293 455 460 l300 302 137 0 c76 0 138 -2 138 -3z m1603 -452 c125 -250 227 -457 227 -460 0 -3 -436 -5 -970 -5 -533 0 -970 2 -970 5 0 3 102 210 227 460 l228 455 515 0 515 0 228 -455z m692 153 c165 -167 370 -374 455 -460 l155 -158 -368 0 -368 0 -224 457 c-124 251 -225 458 -225 460 0 1 62 3 138 3 l137 0 300 -302z m-2374 -1778 c208 -470 381 -862 384 -870 3 -8 -7 -1 -23 15 -52 53 -1492 1703 -1492 1709 0 4 169 5 376 4 l377 -3 378 -855z m1917 842 c-10 -36 -972 -2202 -978 -2202 -6 0 -968 2166 -978 2202 -4 17 36 18 978 18 942 0 982 -1 978 -18z m1092 12 c0 -6 -1444 -1660 -1492 -1709 l-30 -30 15 35 c8 19 173 393 367 830 194 437 361 814 371 838 l18 42 376 0 c206 0 375 -3 375 -6z"/>
                </g>
            </svg>
        `
    };

    // Инициализация игры
    function initGame() {
        try {
            if (!levels[currentLevel]) throw new Error('Уровень не найден');
            currentLevelDisplay.textContent = currentLevel;
            renderLevel(currentLevel);
            updateAvailableTiles();
            startTimer();
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            alert('Ошибка в игре. Перезапуск.');
            currentLevel = 1;
            initGame();
        }
    }
    
    // Функция для запуска таймера
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert('Время вышло! Игра окончена.');
                currentLevel = 1;
                currentLevelDisplay.textContent = currentLevel;
                renderLevel(currentLevel);
                updateAvailableTiles();
                timeLeft = 10 * 60;
                updateTimerDisplay();
                startTimer();
                levelComplete.classList.remove('show');
            }
        }, 1000);
    }
    
    // Обновление отображения таймера
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Рендеринг уровня
    function renderLevel(level) {
        try {
            const levelData = levels[level];
            if (!levelData) throw new Error('Данные уровня не найдены');
            
            gameBoard.innerHTML = '';
            gameBoard.className = `game-board level-${level}`;
            gameBoard.style.gridTemplateColumns = `repeat(${levelData.columns}, 1fr)`;
            
            selectedTiles = [];
            selectedShapeType = null;
            allShapeTypesOfCurrentType = [];

            levelData.tiles.forEach((tile, index) => {
                const tileElement = document.createElement('div');
                tileElement.className = `tile ${tile.color}`;
                tileElement.innerHTML = svgIcons[tile.type](tile.color);
                tileElement.dataset.index = index;
                tileElement.dataset.type = tile.type;
                tileElement.dataset.color = tile.color;
                tileElement.style.setProperty('--current-color', colorMap[tile.color]);
                
                tileElement.style.animationDelay = `${index * 0.05}s`;
                
                tileElement.addEventListener('animationend', (event) => {
                    if (event.animationName === 'tileAppear') {
                        tileElement.classList.add('tile-appeared');
                    }
                });

                tileElement.addEventListener('click', () => handleTileClick(tileElement, index));
                gameBoard.appendChild(tileElement);
            });
        } catch (error) {
            console.error('Ошибка рендеринга уровня:', error);
            alert('Ошибка рендеринга. Перезапуск уровня.');
            restartLevel();
        }
    }

    // Обработка клика по плитке
    function handleTileClick(tileElement, index) {
        // Проверяем, не выполняется ли уже анимация invalid
        if (tileElement.classList.contains('invalid')) return;

        if (tileElement.classList.contains('selected') || !availableTiles.includes(index)) {
            tileElement.classList.add('invalid');
            setTimeout(() => {
                tileElement.classList.remove('invalid');
            }, 500);
            return;
        }

        const type = tileElement.dataset.type;
        const color = tileElement.dataset.color;
        const levelData = levels[currentLevel];

        const lastSelected = selectedTiles.length > 0 
            ? { 
                type: selectedTiles[selectedTiles.length - 1].type, 
                color: selectedTiles[selectedTiles.length - 1].color,
                index: selectedTiles[selectedTiles.length - 1].index
              }
            : null;

        if (currentLevel === 5) {
            // Для 5 уровня проверяем правило движения и тип фигуры
            if (selectedTiles.length > 0 && !levelData.rule(lastSelected, { type, color }, index)) {
                tileElement.classList.add('invalid');
                setTimeout(() => {
                    tileElement.classList.remove('invalid');
                }, 500);
                return;
            }
            
            // Проверяем, выбран ли уже тип фигуры
            if (selectedShapeType === null) {
                // Первый выбор - устанавливаем тип фигуры
                selectedShapeType = type;
                // Находим все плитки этого типа
                allShapeTypesOfCurrentType = Array.from(document.querySelectorAll('.tile'))
                    .filter(t => t.dataset.type === type)
                    .map(t => parseInt(t.dataset.index));
                console.log('Выбран тип фигуры:', selectedShapeType);
                console.log('Все плитки этого типа:', allShapeTypesOfCurrentType);
            } else if (type !== selectedShapeType) {
                // Проверяем, все ли плитки текущего типа уже выбраны
                const selectedIndices = selectedTiles.map(t => t.index);
                const allOfTypeSelected = allShapeTypesOfCurrentType.every(idx => selectedIndices.includes(idx));
                
                if (!allOfTypeSelected) {
                    // Еще не все плитки текущего типа выбраны
                    tileElement.classList.add('invalid');
                    setTimeout(() => {
                        tileElement.classList.remove('invalid');
                    }, 500);
                    console.log('Нельзя выбрать другой тип, пока не выбраны все плитки текущего типа');
                    return;
                } else {
                    // Все плитки текущего типа выбраны, можно выбрать новый тип
                    selectedShapeType = type;
                    // Находим все плитки нового типа
                    allShapeTypesOfCurrentType = Array.from(document.querySelectorAll('.tile'))
                        .filter(t => t.dataset.type === type && !t.classList.contains('selected'))
                        .map(t => parseInt(t.dataset.index));
                    console.log('Выбран новый тип фигуры:', selectedShapeType);
                    console.log('Все плитки этого типа:', allShapeTypesOfCurrentType);
                }
            }

            // Добавляем плитку к выбранным
            document.querySelectorAll('.tile').forEach(t => t.classList.remove('last-selected'));
            tileElement.classList.add('selected');
            tileElement.classList.add('last-selected');
            selectedTiles.push({ index, type, color, element: tileElement });

            // Выводим отладочную информацию
            console.log('Выбрана плитка:', index, 'тип:', type, 'цвет:', color);
            console.log('Доступные плитки до обновления:', availableTiles);
            
            updateAvailableTiles();
            
            console.log('Доступные плитки после обновления:', availableTiles);
            checkLevelComplete();

        } else if (levelData.rule(lastSelected, { type, color }, index)) {
            document.querySelectorAll('.tile').forEach(t => t.classList.remove('last-selected'));
            tileElement.classList.add('selected');
            tileElement.classList.add('last-selected');
            selectedTiles.push({ index, type, color, element: tileElement });
            
            updateAvailableTiles();
            checkLevelComplete();
        }
    }

    // Обновление доступных плиток
    function updateAvailableTiles() {
        try {
            const levelData = levels[currentLevel];
            const allTiles = document.querySelectorAll('.tile');
            availableTiles = [];

            if (selectedTiles.length === 0) {
                availableTiles = Array.from(allTiles).map((_, i) => i);
                // Удаляем класс 'last-selected' со всех плиток при сбросе выбора
                document.querySelectorAll('.tile').forEach(t => t.classList.remove('last-selected'));
                selectedShapeType = null; // Сбрасываем выбранный тип фигуры
                allShapeTypesOfCurrentType = []; // Сбрасываем список плиток текущего типа
                return;
            }

            const lastSelected = {
                type: selectedTiles[selectedTiles.length - 1].type,
                color: selectedTiles[selectedTiles.length - 1].color,
                index: selectedTiles[selectedTiles.length - 1].index // Добавляем индекс последней выбранной плитки
            };

            allTiles.forEach((tile, index) => {
                if (tile.classList.contains('selected')) return;

                const type = tile.dataset.type;
                const color = tile.dataset.color;

                // Для 5 уровня проверяем тип фигуры
                if (currentLevel === 5) {
                    // Проверяем, все ли плитки текущего типа уже выбраны
                    const selectedIndices = selectedTiles.map(t => t.index);
                    const allOfTypeSelected = allShapeTypesOfCurrentType.every(idx => selectedIndices.includes(idx));
                    
                    if (!allOfTypeSelected && type !== selectedShapeType) {
                        // Если не все плитки текущего типа выбраны, то доступны только плитки этого типа
                        return;
                    }
                }

                if (levelData.rule(lastSelected, { type, color }, index)) {
                    availableTiles.push(index);
                }
            });
        } catch (error) {
            console.error('Ошибка обновления доступных плиток:', error);
        }
    }

    // Проверка завершения уровня
    function checkLevelComplete() {
        try {
            const levelData = levels[currentLevel];
            const totalTiles = levelData.tiles.length;

            if (selectedTiles.length === totalTiles) {
                setTimeout(() => {
                    levelComplete.classList.add('show');
                    // Показываем уведомление о завершении уровня
                    if (currentLevel === 5) {
                        alert('Поздравляем! Вы прошли 5 уровень!');
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Ошибка проверки уровня:', error);
        }
    }

    // Перезапуск уровня
    function restartLevel() {
        renderLevel(currentLevel);
        updateAvailableTiles();
    }

    // Переход к следующему уровню
    function nextLevel() {
        try {
            const maxLevels = Object.keys(levels).length;
            if (currentLevel < maxLevels) {
                currentLevel++;
                currentLevelDisplay.textContent = currentLevel;
                levelComplete.classList.remove('show');
                renderLevel(currentLevel);
                updateAvailableTiles();
            } else {
                levelComplete.querySelector('h2').textContent = 'Поздравляем! Вы прошли все уровни!';
                document.getElementById('next-level-btn').style.display = 'none';
                if (!document.getElementById('new-game-btn')) {
                    const newGameBtn = document.createElement('button');
                    newGameBtn.id = 'new-game-btn';
                    newGameBtn.textContent = 'Новая игра';
                    newGameBtn.addEventListener('click', () => {
                        currentLevel = 1;
                        currentLevelDisplay.textContent = currentLevel;
                        levelComplete.classList.remove('show');
                        renderLevel(currentLevel);
                        updateAvailableTiles();
                        timeLeft = 20 * 60;
                        updateTimerDisplay();
                        document.getElementById('next-level-btn').style.display = 'inline-block';
                        newGameBtn.remove();
                        levelComplete.querySelector('h2').textContent = 'Уровень пройден!';
                    });
                    levelComplete.querySelector('.level-complete-content').appendChild(newGameBtn);
                }
            }
        } catch (error) {
            console.error('Ошибка перехода на следующий уровень:', error);
            alert('Ошибка. Возврат к текущему уровню.');
        }
    }

    // Обработчики событий
    restartBtn.addEventListener('click', restartLevel);
    nextLevelBtn.addEventListener('click', nextLevel);

    // Запуск игры
    initGame();
});
