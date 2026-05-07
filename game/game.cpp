#include "game.h"
#include <cstring>
#include <cmath>
#include <cstdlib>

Game::Game() 
    : gameRunning(true), gamePaused(false), gameOver(false), gameWon(false),
      score(0), gameTime(0), pelletsRemaining(TOTAL_PELLETS),
      playerMoveCounter(0), ghostMoveCounter(0) {
    
    Initialize();
}

Game::~Game() {}

void Game::Initialize() {
    InitializeMaze();
    InitializePellets();
    InitializeGhosts();
    
    // Setup player 1
    player1.x = 14;
    player1.y = 23;
    player1.nextX = 14;
    player1.nextY = 23;
    player1.direction = 0;
    player1.nextDirection = 0;
    player1.alive = true;
    player1.pelletsEaten = 0;
    
    // Setup player 2
    player2.x = 13;
    player2.y = 23;
    player2.nextX = 13;
    player2.nextY = 23;
    player2.direction = 0;
    player2.nextDirection = 0;
    player2.alive = true;
    player2.pelletsEaten = 0;
}

void Game::InitializeMaze() {
    memset(maze, 0, sizeof(maze));
    
    // Draw borders
    for (int x = 0; x < GRID_WIDTH; x++) {
        maze[0][x] = 1;
        maze[GRID_HEIGHT - 1][x] = 1;
    }
    for (int y = 0; y < GRID_HEIGHT; y++) {
        maze[y][0] = 1;
        maze[y][GRID_WIDTH - 1] = 1;
    }
    
    // Internal walls pattern
    for (int y = 2; y < GRID_HEIGHT - 2; y++) {
        for (int x = 2; x < GRID_WIDTH - 2; x++) {
            if ((x == 10 && (y == 5 || y == 15 || y == 25)) ||
                (y == 10 && (x == 5 || x == 15)) ||
                (x % 8 == 0 && y % 7 == 0)) {
                maze[y][x] = 1;
            }
        }
    }
}

void Game::InitializePellets() {
    memset(pellets, true, sizeof(pellets));
    
    // Remove pellets from walls and player spawn
    for (int y = 0; y < GRID_HEIGHT; y++) {
        for (int x = 0; x < GRID_WIDTH; x++) {
            if (maze[y][x] == 1) {
                pellets[y][x] = false;
            }
        }
    }
    
    pelletsRemaining = TOTAL_PELLETS;
}

void Game::InitializeGhosts() {
    ghosts[0] = {13, 11, 0, 0xFF0055}; // Red
    ghosts[1] = {12, 12, 1, 0xFF00FF}; // Magenta
    ghosts[2] = {14, 12, 2, 0x00FFFF}; // Cyan
    ghosts[3] = {15, 11, 3, 0xFFFF00}; // Yellow
}

bool Game::CanMove(int x, int y) {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
        return false;
    }
    return maze[y][x] == 0;
}

void Game::MovePlayer(Player& player) {
    // Try next direction
    int tryX = player.x;
    int tryY = player.y;
    
    switch (player.nextDirection) {
        case 0: tryY--; break;
        case 1: tryX++; break;
        case 2: tryY++; break;
        case 3: tryX--; break;
    }
    
    if (CanMove(tryX, tryY)) {
        player.direction = player.nextDirection;
        player.x = tryX;
        player.y = tryY;
        return;
    }
    
    // Continue current direction
    tryX = player.x;
    tryY = player.y;
    
    switch (player.direction) {
        case 0: tryY--; break;
        case 1: tryX++; break;
        case 2: tryY++; break;
        case 3: tryX--; break;
    }
    
    if (CanMove(tryX, tryY)) {
        player.x = tryX;
        player.y = tryY;
    }
}

void Game::UpdateGhost(Ghost& ghost) {
    int dx = (player1.x > ghost.x) - (player1.x < ghost.x);
    int dy = (player1.y > ghost.y) - (player1.y < ghost.y);
    
    if (CanMove(ghost.x + dx, ghost.y + dy)) {
        ghost.x += dx;
    } else if (CanMove(ghost.x, ghost.y + dy)) {
        ghost.y += dy;
    } else if (CanMove(ghost.x + dx, ghost.y)) {
        ghost.x += dx;
    }
}

int Game::GetDistance(int x1, int y1, int x2, int y2) {
    return abs(x1 - x2) + abs(y1 - y2);
}

void Game::CheckCollisions() {
    // Check pellet collisions
    if (pellets[player1.y][player1.x]) {
        pellets[player1.y][player1.x] = false;
        player1.pelletsEaten++;
        score += 10;
        pelletsRemaining--;
    }
    
    if (pellets[player2.y][player2.x]) {
        pellets[player2.y][player2.x] = false;
        player2.pelletsEaten++;
        score += 10;
        pelletsRemaining--;
    }
    
    // Check ghost collisions
    for (int i = 0; i < GHOST_COUNT; i++) {
        if (ghosts[i].x == player1.x && ghosts[i].y == player1.y) {
            player1.alive = false;
        }
        if (ghosts[i].x == player2.x && ghosts[i].y == player2.y) {
            player2.alive = false;
        }
    }
    
    CheckGameEnd();
}

void Game::CheckGameEnd() {
    if (!player1.alive || !player2.alive) {
        gameOver = true;
    }
    
    if (pelletsRemaining == 0) {
        gameWon = true;
        score += 1000;
    }
}

void Game::Update(float deltaTime) {
    if (gameOver || gameWon || gamePaused || !gameRunning) return;
    
    gameTime += deltaTime;
    
    playerMoveCounter++;
    if (playerMoveCounter >= 5) {
        playerMoveCounter = 0;
        MovePlayer(player1);
        MovePlayer(player2);
    }
    
    ghostMoveCounter++;
    if (ghostMoveCounter >= 7) {
        ghostMoveCounter = 0;
        for (int i = 0; i < GHOST_COUNT; i++) {
            UpdateGhost(ghosts[i]);
        }
    }
    
    CheckCollisions();
}

void Game::HandleInput(int keyCode) {
    switch (keyCode) {
        case 38: player1.nextDirection = 0; break;  // Up
        case 39: player1.nextDirection = 1; break;  // Right
        case 40: player1.nextDirection = 2; break;  // Down
        case 37: player1.nextDirection = 3; break;  // Left
        case 80: TogglePause(); break;               // P
        case 27: Stop(); break;                      // ESC
    }
}

void Game::SetPlayerDirection(int direction) {
    if (direction >= 0 && direction < 4) {
        player1.nextDirection = direction;
    }
}

void Game::FillRect(uint32_t* frameBuffer, int width, int x, int y, int w, int h, uint32_t color) {
    for (int py = y; py < y + h && py < 900; py++) {
        for (int px = x; px < x + w && px < width; px++) {
            if (px >= 0 && py >= 0) {
                frameBuffer[py * width + px] = color;
            }
        }
    }
}

void Game::DrawCircle(uint32_t* frameBuffer, int width, int cx, int cy, int r, uint32_t color) {
    for (int y = -r; y <= r; y++) {
        for (int x = -r; x <= r; x++) {
            if (x * x + y * y <= r * r) {
                int px = cx + x;
                int py = cy + y;
                if (px >= 0 && px < width && py >= 0 && py < 900) {
                    frameBuffer[py * width + px] = color;
                }
            }
        }
    }
}

void Game::DrawMaze(uint32_t* frameBuffer, int width) {
    uint32_t wallColor = 0x0055FF;
    
    for (int y = 0; y < GRID_HEIGHT; y++) {
        for (int x = 0; x < GRID_WIDTH; x++) {
            if (maze[y][x] == 1) {
                int px = x * CELL_SIZE;
                int py = y * CELL_SIZE;
                FillRect(frameBuffer, width, px, py, CELL_SIZE, CELL_SIZE, wallColor);
            }
        }
    }
}

void Game::DrawPellets(uint32_t* frameBuffer, int width) {
    uint32_t pelletColor = 0xFFFFFF;
    
    for (int y = 0; y < GRID_HEIGHT; y++) {
        for (int x = 0; x < GRID_WIDTH; x++) {
            if (pellets[y][x]) {
                int px = x * CELL_SIZE + CELL_SIZE / 2;
                int py = y * CELL_SIZE + CELL_SIZE / 2;
                DrawCircle(frameBuffer, width, px, py, 2, pelletColor);
            }
        }
    }
}

void Game::DrawPlayer(uint32_t* frameBuffer, int width, const Player& p, uint32_t color) {
    if (!p.alive) return;
    
    int cx = p.x * CELL_SIZE + CELL_SIZE / 2;
    int cy = p.y * CELL_SIZE + CELL_SIZE / 2;
    int radius = CELL_SIZE / 2 - 2;
    
    DrawCircle(frameBuffer, width, cx, cy, radius, color);
}

void Game::DrawGhost(uint32_t* frameBuffer, int width, const Ghost& g) {
    int x = g.x * CELL_SIZE;
    int y = g.y * CELL_SIZE;
    FillRect(frameBuffer, width, x, y, CELL_SIZE, CELL_SIZE, g.color);
}

void Game::Render(uint32_t* frameBuffer, int width, int height) {
    // Clear background
    for (int i = 0; i < width * height; i++) {
        frameBuffer[i] = 0x0A0E27;
    }
    
    // Draw game elements
    DrawMaze(frameBuffer, width);
    DrawPellets(frameBuffer, width);
    DrawPlayer(frameBuffer, width, player1, 0xFFFF00);
    DrawPlayer(frameBuffer, width, player2, 0x00FF00);
    
    for (int i = 0; i < GHOST_COUNT; i++) {
        DrawGhost(frameBuffer, width, ghosts[i]);
    }
}
