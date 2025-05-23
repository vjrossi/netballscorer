import React from 'react';
import { PlusIcon, MinusIcon } from '../icons.tsx'; // Renamed from icons.jsx

interface TeamScoreProps {
  name: string;
  score: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled: boolean;
  isWinning?: boolean;
}

const TeamScore: React.FC<TeamScoreProps> = ({ name, score, onIncrement, onDecrement, disabled, isWinning }) => {
  return (
    <div className={`flex flex-col items-center p-6 rounded-xl shadow-2xl w-full md:w-2/5 transition-all duration-300
                     ${isWinning ? 'bg-green-500/20 border-2 border-green-400' : 'bg-slate-800/70 border border-slate-700'} `}>
      <h2 className="text-2xl md:text-3xl font-bold text-sky-300 mb-3 truncate max-w-full px-2 text-center">{name}</h2>
      <div className="text-7xl md:text-8xl font-mono font-extrabold text-white mb-6 tabular-nums">{score}</div>
      <div className="flex space-x-3">
        <button
          onClick={onDecrement}
          disabled={disabled || score === 0}
          className="p-3 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-600 text-white rounded-full shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-opacity-50 disabled:cursor-not-allowed"
          aria-label={`Decrement score for ${name}`}
        >
          <MinusIcon className="w-6 h-6" />
        </button>
        <button
          onClick={onIncrement}
          disabled={disabled}
          className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white rounded-full shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50 disabled:cursor-not-allowed"
          aria-label={`Increment score for ${name}`}
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default TeamScore;