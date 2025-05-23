import React from 'react';
import { PlayIcon, PauseIcon, ForwardIcon, RefreshIcon, SparklesIcon } from '../icons.tsx'; // Renamed from icons.jsx

interface GameControlsProps {
  isGameSetup: boolean;
  isGameStarted: boolean;
  isTimerRunning: boolean;
  isQuarterBreak: boolean;
  isGameOver: boolean;
  onStartGame: () => void;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onAdvanceQuarter: () => void;
  onResetGame: () => void;
  onGenerateSummary: () => void;
  isLoadingSummary: boolean;
  canIncrementDecrement: boolean;
}

const GameControlButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode; className?: string, ariaLabel: string }> = 
  ({ onClick, disabled, children, className, ariaLabel }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={`flex items-center justify-center space-x-2 font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:cursor-not-allowed
                ${className || 'bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 text-white focus:ring-sky-400'}`}
  >
    {children}
  </button>
);

const GameControls: React.FC<GameControlsProps> = ({
  isGameSetup,
  isGameStarted,
  isTimerRunning,
  isQuarterBreak,
  isGameOver,
  onStartGame,
  onStartTimer,
  onPauseTimer,
  onAdvanceQuarter,
  onResetGame,
  onGenerateSummary,
  isLoadingSummary,
}) => {
  if (!isGameSetup) {
    return null; 
  }

  return (
    <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 mt-4 md:mt-6 w-full max-w-2xl">
      {!isGameStarted && !isGameOver && (
        <GameControlButton onClick={onStartGame} className="bg-green-500 hover:bg-green-600 text-white focus:ring-green-400" ariaLabel="Start Game">
          <PlayIcon /> <span>Start Game</span>
        </GameControlButton>
      )}

      {isGameStarted && !isGameOver && !isQuarterBreak && (
        isTimerRunning ? (
          <GameControlButton onClick={onPauseTimer} className="bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400" ariaLabel="Pause Timer">
            <PauseIcon /> <span>Pause Timer</span>
          </GameControlButton>
        ) : (
          <GameControlButton onClick={onStartTimer} className="bg-green-500 hover:bg-green-600 text-white focus:ring-green-400" ariaLabel="Start Timer">
            <PlayIcon /> <span>Start Timer</span>
          </GameControlButton>
        )
      )}

      {isGameStarted && isQuarterBreak && !isGameOver && (
        <GameControlButton onClick={onAdvanceQuarter} className="bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400" ariaLabel="Start Next Quarter">
          <ForwardIcon /> <span>Start Next Quarter</span>
        </GameControlButton>
      )}
      
      {isGameOver && (
        <GameControlButton 
            onClick={onGenerateSummary} 
            disabled={isLoadingSummary} 
            className="bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-400"
            ariaLabel="Generate Game Summary"
        >
          <SparklesIcon /> 
          <span>{isLoadingSummary ? 'Generating...' : 'Game Summary'}</span>
        </GameControlButton>
      )}

      {(isGameStarted || isGameOver) && (
         <GameControlButton onClick={onResetGame} className="bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-400" ariaLabel="Reset Game">
          <RefreshIcon /> <span>Reset Game</span>
        </GameControlButton>
      )}
    </div>
  );
};

export default GameControls;