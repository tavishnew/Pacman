import React, { useState } from 'react';
import './App.css';
import LoginScreen from './components/LoginScreen';
import GameScreen from './components/GameScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [playerName, setPlayerName] = useState('');

  const handleLogin = (name) => {
    setPlayerName(name);
    setCurrentScreen('game');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
  };

  return (
    <div className="App">
      {currentScreen === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}
      {currentScreen === 'game' && (
        <GameScreen 
          playerName={playerName} 
          onBackToLogin={handleBackToLogin} 
        />
      )}
    </div>
  );
}

export default App;