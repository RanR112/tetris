document.addEventListener('DOMContentLoaded', () => {
    // Get canvas and context
    const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');
    const nextPieceCanvas = document.getElementById('nextPiece');
    const nextPieceContext = nextPieceCanvas.getContext('2d');
    
    // Define constants
    const BLOCK_SIZE = 20;
    const BOARD_WIDTH = canvas.width / BLOCK_SIZE;
    const BOARD_HEIGHT = canvas.height / BLOCK_SIZE;
    
    // Game states
    let isGameOver = false;
    let isPaused = true;
    let score = 0;
    let level = 1;
    let lines = 0;
    let dropInterval = 1000; // Initial drop speed in ms
    let lastTime = 0;
    let dropCounter = 0;
    
    // Create the board array
    const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);
    
    // Tetromino shapes and colors
    const TETROMINOS = {
        'I': {
            shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            color: '#00FFFF'
        },
        'J': {
            shape: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: '#0000FF'
        },
        'L': {
            shape: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: '#FF8C00'
        },
        'O': {
            shape: [
                [1, 1],
                [1, 1]
            ],
            color: '#FFFF00'
        },
        'S': {
            shape: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            color: '#00FF00'
        },
        'T': {
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: '#800080'
        },
        'Z': {
            shape: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            color: '#FF0000'
        }
    };
    
    // Player object with current piece
    const player = {
        position: { x: 0, y: 0 },
        tetromino: null,
        nextTetromino: null
    };
    
    // Create a board filled with zeros
    function createBoard(width, height) {
        const board = [];
        while (height--) {
            board.push(new Array(width).fill(0));
        }
        return board;
    }
    
    // Reset game state
    function resetGame() {
        // Clear the board
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                board[y][x] = 0;
            }
        }
        
        // Reset score and level
        score = 0;
        level = 1;
        lines = 0;
        dropInterval = 1000;
        updateScore();
        
        // Create new pieces
        player.tetromino = randomTetromino();
        player.nextTetromino = randomTetromino();
        resetPiece();
        
        isGameOver = false;
        isPaused = true;
        drawGameOver();
        pauseGame();
    }
    
    // Generate a random tetromino
    function randomTetromino() {
        const pieces = 'IJLOSTZ';
        const randPiece = pieces[Math.floor(Math.random() * pieces.length)];
        return {
            shape: TETROMINOS[randPiece].shape,
            color: TETROMINOS[randPiece].color
        };
    }
    
    // Reset piece position
    function resetPiece() {
        player.position.y = 0;
        player.position.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(player.tetromino.shape[0].length / 2);
        
        // Check if game is over
        if (checkCollision()) {
            isGameOver = true;
            isPaused = true;
        }
    }
    
    // Draw a block
    function drawBlock(x, y, color, ctx = context) {
        ctx.fillStyle = color;
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#222';
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
    
    // Draw the board
    function drawBoard() {
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (board[y][x]) {
                    drawBlock(x, y, board[y][x]);
                }
            }
        }
    }
    
    // Draw the current tetromino
    function drawTetromino() {
        player.tetromino.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(
                        player.position.x + x,
                        player.position.y + y,
                        player.tetromino.color
                    );
                }
            });
        });
    }
    
    // Draw the next tetromino preview
    function drawNextPiece() {
        // Clear the next piece canvas
        nextPieceContext.fillStyle = '#222';
        nextPieceContext.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
        
        const shape = player.nextTetromino.shape;
        const blockSize = 20;
        const offsetX = (nextPieceCanvas.width - shape[0].length * blockSize) / 2;
        const offsetY = (nextPieceCanvas.height - shape.length * blockSize) / 2;
        
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    nextPieceContext.fillStyle = player.nextTetromino.color;
                    nextPieceContext.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                    nextPieceContext.strokeStyle = '#222';
                    nextPieceContext.strokeRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                }
            });
        });
    }
    
    // Clear the canvas
    function clearCanvas() {
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw game over message
    function drawGameOver() {
        gameOverlay = document.getElementById('gameOverlay');
        finalScore = document.getElementById('finalScore');
        finalScore.textContent = `Final Score: ${score}`;
        return isGameOver ? gameOverlay.classList.add('visible') : gameOverlay.classList.remove('visible');
    }
    
    // Main draw function
    function draw() {
        clearCanvas();
        drawBoard();
        drawTetromino();
        drawNextPiece();
        
        if (isGameOver) {
            drawGameOver();
        }
    }
    
    // Check if there's a collision
    function checkCollision() {
        return player.tetromino.shape.some((row, dy) => {
            return row.some((value, dx) => {
                if (value !== 0) {
                    const x = player.position.x + dx;
                    const y = player.position.y + dy;
                    
                    return (
                        x < 0 || // Left wall
                        x >= BOARD_WIDTH || // Right wall
                        y >= BOARD_HEIGHT || // Bottom wall
                        (y >= 0 && board[y][x]) // Collision with existing pieces
                    );
                }
                return false;
            });
        });
    }
    
    // Merge the tetromino with the board
    function merge() {
        player.tetromino.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    board[player.position.y + y][player.position.x + x] = player.tetromino.color;
                }
            });
        });
    }
    
    // Move the tetromino down
    function moveDown() {
        player.position.y++;
        if (checkCollision()) {
            player.position.y--;
            merge();
            clearLines();
            player.tetromino = player.nextTetromino;
            player.nextTetromino = randomTetromino();
            resetPiece();
        }
        dropCounter = 0;
    }
    
    // Move the tetromino left or right
    function moveHorizontal(direction) {
        player.position.x += direction;
        if (checkCollision()) {
            player.position.x -= direction;
        }
    }
    
    // Rotate the tetromino
    function rotate() {
        const originalShape = player.tetromino.shape;
        const originalX = player.position.x;
        
        // Create a new rotated matrix
        const rotated = [];
        for (let i = 0; i < originalShape[0].length; i++) {
            rotated[i] = [];
            for (let j = 0; j < originalShape.length; j++) {
                rotated[i][j] = originalShape[originalShape.length - 1 - j][i];
            }
        }
        
        player.tetromino.shape = rotated;
        
        // Wall kick - try to adjust position if rotation causes a collision
        let offset = 1;
        while (checkCollision()) {
            player.position.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (Math.abs(offset) > originalShape[0].length) {
                // If we've tried moving too far, revert the rotation
                player.tetromino.shape = originalShape;
                player.position.x = originalX;
                return;
            }
        }
    }
    
    // Drop the piece instantly
    function hardDrop() {
        while (!checkCollision()) {
            player.position.y++;
        }
        player.position.y--;
        merge();
        clearLines();
        player.tetromino = player.nextTetromino;
        player.nextTetromino = randomTetromino();
        resetPiece();
        dropCounter = 0;
    }

    // Pause the game
    function pauseGame() {
        pause = document.getElementById('pauseOverlay')
        isPaused =!isPaused;
        return isPaused ? pause.classList.add('visible') : pause.classList.remove('visible');
    }
    
    // Clear completed lines
    function clearLines() {
        let linesCleared = 0;
        
        outer: for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }
            
            // Line is complete - remove it and move everything down
            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            y++;
            linesCleared++;
        }
        
        if (linesCleared > 0) {
            // Update score and level
            // Scoring system: more lines = exponentially more points
            const points = [0, 100, 300, 500, 800];
            score += points[linesCleared] * level;
            lines += linesCleared;
            
            // Level up every 10 lines
            level = Math.floor(lines / 10) + 1;
            
            // Increase speed with level
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
            
            updateScore();
        }
    }
    
    // Update score display
    function updateScore() {
        document.getElementById('score').textContent = score;
        document.getElementById('level').textContent = level;
        document.getElementById('lines').textContent = lines;
    }
    
    // Game loop
    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;
        
        if (!isPaused) {
            dropCounter += deltaTime;
            if (dropCounter > dropInterval) {
                moveDown();
            }
        }
        
        draw();
        requestAnimationFrame(update);
    }
    
    // Event listeners
    document.addEventListener('keydown', event => {
        if (!isPaused && !isGameOver) {
            switch (event.keyCode) {
                case 37: // Left arrow
                    moveHorizontal(-1);
                    break;
                case 39: // Right arrow
                    moveHorizontal(1);
                    break;
                case 40: // Down arrow
                    moveDown();
                    break;
                case 38: // Up arrow
                    rotate();
                    break;
                case 32: // Space
                    hardDrop();
                    break;
                case 80:
                    pauseGame();
                    break;
            }
        } else if (event.keyCode === 80) {
            pauseGame();
        }
    });
    
    // Start or restart button
    document.getElementById('startBtn').addEventListener('click', () => {
        resetGame();
        document.activeElement.blur();
    });
    
    // Initialize the game
    player.tetromino = randomTetromino();
    player.nextTetromino = randomTetromino();
    resetPiece();
    
    // Start the game loop
    update();
});