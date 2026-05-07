#ifndef GAME_H
#define GAME_H

#include <vector>
#include <cstdint>

// Game constants
const int GRID_WIDTH = 28;
const int GRID_HEIGHT = 30;
const int CELL_SIZE = 30;
const int TOTAL_PELLETS = 244;
const int GHOST_COUNT = 4;

// Player structure
struct Player {
    int x, y;
    int nextX, nextY;
    int direction;
    int nextDirection;
    bool alive;
    int pelletsEaten;
};

// Ghost structure
struct Ghost {
    int x, y;
    int id;
    uint32_t color;
};

// Game class
class Game {
private:
    // Grid and maze
    int maze[GRID_HEIGHT][GRID_WIDTH];
    bool pellets[GRID_HEIGHT][GRID_WIDTH];
    
    // Game entities
    Player player1;
    Player player2;
    Ghost ghosts[GHOST_COUNT];
    
    // Game state
    bool gameRunning;
    bool gamePaused;
    bool gameOver;
    bool gameWon;
    int score;
    float gameTime;
    int pelletsRemaining;
    int playerMoveCounter;
    int ghostMoveCounter;
    
public:
    Game();
    ~Game();
    
    // Initialization
    void Initialize();
    void InitializeMaze();
    void InitializePellets();
    void InitializeGhosts();
    
    // Game loop
    void Update(float deltaTime);
    void Render(uint32_t* frameBuffer, int width, int height);
    
    // Player movement
    void MovePlayer(Player& player);
    bool CanMove(int x, int y);
    
    // Ghost AI
    void UpdateGhost(Ghost& ghost);
    int GetDistance(int x1, int y1, int x2, int y2);
    
    // Collision detection
    void CheckCollisions();
    void CheckGameEnd();
    
    // Input handling
    void HandleInput(int keyCode);
    void SetPlayerDirection(int direction);
    
    // State queries
    int GetScore() const { return score; }
    float GetTime() const { return gameTime; }
    bool IsGameOver() const { return gameOver; }
    bool IsGameWon() const { return gameWon; }
    bool IsPaused() const { return gamePaused; }
    
    void TogglePause() { gamePaused = !gamePaused; }
    void Stop() { gameRunning = false; }
    
private:
    // Rendering helpers
    void DrawMaze(uint32_t* frameBuffer, int width);
    void DrawPellets(uint32_t* frameBuffer, int width);
    void DrawPlayer(uint32_t* frameBuffer, int width, const Player& p, uint32_t color);
    void DrawGhost(uint32_t* frameBuffer, int width, const Ghost& g);
    void FillRect(uint32_t* frameBuffer, int width, int x, int y, int w, int h, uint32_t color);
    void DrawCircle(uint32_t* frameBuffer, int width, int cx, int cy, int r, uint32_t color);
};

#endif // GAME_H
