#include "game.h"
#include <cstring>

// Global game instance
Game* g_game = nullptr;
uint32_t g_frameBuffer[840 * 900];
float g_deltaTime = 0.016f;

// C interface for JavaScript
extern "C" {
    void game_init() {
        if (g_game) delete g_game;
        g_game = new Game();
    }
    
    void game_update() {
        if (g_game) {
            g_game->Update(g_deltaTime);
        }
    }
    
    void game_render() {
        if (g_game) {
            g_game->Render(g_frameBuffer, 840, 900);
        }
    }
    
    uint32_t* game_get_framebuffer() {
        return g_frameBuffer;
    }
    
    int game_get_score() {
        return g_game ? g_game->GetScore() : 0;
    }
    
    float game_get_time() {
        return g_game ? g_game->GetTime() : 0.0f;
    }
    
    int game_is_game_over() {
        return g_game ? g_game->IsGameOver() : 0;
    }
    
    int game_is_game_won() {
        return g_game ? g_game->IsGameWon() : 0;
    }
    
    int game_is_paused() {
        return g_game ? g_game->IsPaused() : 0;
    }
    
    void game_toggle_pause() {
        if (g_game) g_game->TogglePause();
    }
    
    void game_handle_input(int keyCode) {
        if (g_game) g_game->HandleInput(keyCode);
    }
    
    void game_set_player_direction(int direction) {
        if (g_game) g_game->SetPlayerDirection(direction);
    }
    
    void game_stop() {
        if (g_game) g_game->Stop();
    }
}

// For native builds (optional)
int main() {
    game_init();
    
    for (int i = 0; i < 1000; i++) {
        game_update();
        game_render();
    }
    
    return 0;
}
