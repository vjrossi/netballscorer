import React from 'react';
import { MAX_QUARTERS } from '../constants.ts'; // .ts is fine

interface GameInfoProps {
  currentQuarter: number;
  timeRemaining: number; // in seconds
  isGameStarted: boolean;
  isGameOver: boolean;
  isQuarterBreak: boolean;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const GameInfo: React.FC<GameInfoProps> = ({ currentQuarter, timeRemaining, isGameStarted, isGameOver, isQuarterBreak }) => {
  let quarterText = `Quarter ${currentQuarter}`;
  if (!isGameStarted && !isGameOver) quarterText = "Game Paused";
  if (isQuarterBreak) quarterText = `Break after Q${currentQuarter}`;
  if (isGameOver) quarterText = "Game Over";
  if (!isGameStarted && currentQuarter === 0) quarterText = "Ready to Start";


  return (
    <div className="text-center my-6 md:my-8 p-6 bg-slate-800/70 rounded-xl shadow-xl border border-slate-700 w-full max-w-md">
      <div className="text-5xl md:text-6xl font-mono font-bold text-amber-400 mb-2 tabular-nums tracking-wider">
        {formatTime(timeRemaining)}
      </div>
      <div className="text-xl md:text-2xl text-sky-300 font-semibold">
        {quarterText} {!isGameOver && !isQuarterBreak && isGameStarted && currentQuarter > 0 && `of ${MAX_QUARTERS}`}
      </div>
    </div>
  );
};

export default GameInfo;