import React, { useState, useEffect, useCallback } from 'react';
import TeamScore from './components/TeamScore.tsx';
import GameInfo from './components/GameInfo.tsx';
import GameControls from './components/GameControls.tsx';
import Modal from './components/Modal.tsx';
import TeamNameModal from './components/TeamNameModal.tsx';
import { generateGameSummary } from './services/geminiService.ts';
import { MAX_QUARTERS, QUARTER_DURATION_SECONDS } from './constants.ts';
import type { GameState, Team } from './types.ts';

const initialTeamState = (name: string): Team => ({ name, score: 0 });

const App: React.FC = () => {
  const [teamA, setTeamA] = useState<Team>(initialTeamState('Team A'));
  const [teamB, setTeamB] = useState<Team>(initialTeamState('Team B'));
  const [currentQuarter, setCurrentQuarter] = useState<number>(0); // 0 means not started
  const [timeRemaining, setTimeRemaining] = useState<number>(QUARTER_DURATION_SECONDS);
  const [isGameSetup, setIsGameSetup] = useState<boolean>(false);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isQuarterBreak, setIsQuarterBreak] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  
  const [showTeamNameModal, setShowTeamNameModal] = useState<boolean>(true);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [gameSummary, setGameSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);

  const resetGameState = useCallback((keepTeamNames = true) => {
    if (!keepTeamNames) {
        setTeamA(initialTeamState(''));
        setTeamB(initialTeamState(''));
        setIsGameSetup(false);
        setShowTeamNameModal(true);
    } else {
        setTeamA(prev => ({ ...prev, score: 0 }));
        setTeamB(prev => ({ ...prev, score: 0 }));
    }
    setCurrentQuarter(0);
    setTimeRemaining(QUARTER_DURATION_SECONDS);
    setIsGameStarted(false);
    setIsTimerRunning(false);
    setIsQuarterBreak(false);
    setIsGameOver(false);
    setShowSummaryModal(false);
    setGameSummary('');
  }, []);
  
  useEffect(() => {
    if (!isGameSetup) {
        setShowTeamNameModal(true);
    }
  }, [isGameSetup]);


  const handleSaveTeamNames = (nameA: string, nameB: string) => {
    setTeamA(initialTeamState(nameA));
    setTeamB(initialTeamState(nameB));
    setIsGameSetup(true);
    setShowTeamNameModal(false);
    resetGameState(true); 
  };

  const handleIncrementScore = useCallback((team: 'A' | 'B') => {
    if (!isGameStarted || isGameOver || isQuarterBreak) return;
    if (team === 'A') {
      setTeamA(prev => ({ ...prev, score: prev.score + 1 }));
    } else {
      setTeamB(prev => ({ ...prev, score: prev.score + 1 }));
    }
  }, [isGameStarted, isGameOver, isQuarterBreak]);

  const handleDecrementScore = useCallback((team: 'A' | 'B') => {
    if (!isGameStarted || isGameOver || isQuarterBreak) return;
    if (team === 'A') {
      setTeamA(prev => ({ ...prev, score: Math.max(0, prev.score - 1) }));
    } else {
      setTeamB(prev => ({ ...prev, score: Math.max(0, prev.score - 1) }));
    }
  }, [isGameStarted, isGameOver, isQuarterBreak]);

  const handleGameOver = useCallback(() => {
    setIsTimerRunning(false);
    setIsGameOver(true);
    setIsQuarterBreak(false);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isGameStarted && isTimerRunning && timeRemaining > 0 && !isQuarterBreak && !isGameOver) {
      intervalId = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (isGameStarted && timeRemaining === 0 && isTimerRunning && !isGameOver) {
      setIsTimerRunning(false);
      if (currentQuarter < MAX_QUARTERS) {
        setIsQuarterBreak(true);
      } else {
        handleGameOver();
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isGameStarted, isTimerRunning, timeRemaining, currentQuarter, isQuarterBreak, isGameOver, handleGameOver]);


  const handleStartGame = () => {
    if (!isGameSetup) return;
    setIsGameStarted(true);
    setCurrentQuarter(1);
    setTimeRemaining(QUARTER_DURATION_SECONDS);
    setIsTimerRunning(true);
    setIsGameOver(false);
    setIsQuarterBreak(false);
  };

  const handleStartTimer = () => {
    if (isGameStarted && !isGameOver && !isQuarterBreak) {
      setIsTimerRunning(true);
    }
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleAdvanceQuarter = () => {
    if (isQuarterBreak && currentQuarter < MAX_QUARTERS) {
      setCurrentQuarter(prev => prev + 1);
      setTimeRemaining(QUARTER_DURATION_SECONDS);
      setIsQuarterBreak(false);
      setIsTimerRunning(true);
    }
  };

  const handleGenerateSummary = async () => {
    if (!isGameOver) return;
    setIsLoadingSummary(true);
    setShowSummaryModal(true);
    const summary = await generateGameSummary(teamA.name, teamA.score, teamB.name, teamB.score);
    setGameSummary(summary);
    setIsLoadingSummary(false);
  };
  
  const scoreButtonsDisabled = !isGameStarted || isGameOver || isQuarterBreak || isTimerRunning === false;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-100 p-4 pt-8 md:p-8 font-sans">
      <header className="mb-6 md:mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-purple-500">
            Netball Scorer Pro
          </span>
        </h1>
      </header>

      <TeamNameModal isOpen={showTeamNameModal} onSave={handleSaveTeamNames} />

      {isGameSetup && (
        <>
          <div className="flex flex-col md:flex-row justify-around w-full max-w-4xl mb-6 md:mb-8 gap-4 md:gap-8">
            <TeamScore 
              name={teamA.name} 
              score={teamA.score} 
              onIncrement={() => handleIncrementScore('A')} 
              onDecrement={() => handleDecrementScore('A')} 
              disabled={scoreButtonsDisabled}
              isWinning={!isGameOver && teamA.score > teamB.score && (teamA.score > 0 || teamB.score > 0)}
            />
            <TeamScore 
              name={teamB.name} 
              score={teamB.score} 
              onIncrement={() => handleIncrementScore('B')} 
              onDecrement={() => handleDecrementScore('B')} 
              disabled={scoreButtonsDisabled}
              isWinning={!isGameOver && teamB.score > teamA.score && (teamA.score > 0 || teamB.score > 0)}
            />
          </div>

          <GameInfo
            currentQuarter={currentQuarter}
            timeRemaining={timeRemaining}
            isGameStarted={isGameStarted}
            isGameOver={isGameOver}
            isQuarterBreak={isQuarterBreak}
          />

          <GameControls
            isGameSetup={isGameSetup}
            isGameStarted={isGameStarted}
            isTimerRunning={isTimerRunning}
            isQuarterBreak={isQuarterBreak}
            isGameOver={isGameOver}
            onStartGame={handleStartGame}
            onStartTimer={handleStartTimer}
            onPauseTimer={handlePauseTimer}
            onAdvanceQuarter={handleAdvanceQuarter}
            onResetGame={() => resetGameState(true)}
            onGenerateSummary={handleGenerateSummary}
            isLoadingSummary={isLoadingSummary}
            canIncrementDecrement={!scoreButtonsDisabled}
          />
        </>
      )}

      <Modal 
        isOpen={showSummaryModal} 
        onClose={() => setShowSummaryModal(false)} 
        title="Game Summary"
        size="lg"
      >
        {isLoadingSummary ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
          </div>
        ) : (
          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{gameSummary || "No summary available."}</p>
        )}
      </Modal>
      
      <footer className="mt-auto pt-10 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Netball Scorer Pro. Powered by React & Gemini.</p>
      </footer>
    </div>
  );
};

export default App;