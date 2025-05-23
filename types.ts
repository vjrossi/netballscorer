
export interface Team {
  name: string;
  score: number;
}

export interface GameState {
  teamA: Team;
  teamB: Team;
  currentQuarter: number;
  timeRemaining: number; // in seconds
  isGameSetup: boolean; // True after team names are set
  isGameStarted: boolean;
  isTimerRunning: boolean;
  isQuarterBreak: boolean; // True when between quarters
  isGameOver: boolean;
}
    