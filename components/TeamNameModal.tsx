import React, { useState } from 'react';
import Modal from './Modal.tsx'; // Renamed from Modal.jsx

interface TeamNameModalProps {
  isOpen: boolean;
  onSave: (teamAName: string, teamBName: string) => void;
}

const TeamNameModal: React.FC<TeamNameModalProps> = ({ isOpen, onSave }) => {
  const [nameA, setNameA] = useState('Home Team');
  const [nameB, setNameB] = useState('Away Team');

  const handleSave = () => {
    if (nameA.trim() && nameB.trim()) {
      onSave(nameA.trim(), nameB.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { /* Prevent closing by overlay click */ }} title="Set Team Names">
      <div className="space-y-4">
        <div>
          <label htmlFor="teamAName" className="block text-sm font-medium text-sky-300 mb-1">Team A Name</label>
          <input
            type="text"
            id="teamAName"
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
            className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-100 placeholder-slate-400"
            placeholder="Enter Team A Name"
          />
        </div>
        <div>
          <label htmlFor="teamBName" className="block text-sm font-medium text-sky-300 mb-1">Team B Name</label>
          <input
            type="text"
            id="teamBName"
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
            className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-100 placeholder-slate-400"
            placeholder="Enter Team B Name"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={!nameA.trim() || !nameB.trim()}
          className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-md transition-colors shadow-md disabled:cursor-not-allowed"
        >
          Start Game Setup
        </button>
      </div>
    </Modal>
  );
};

export default TeamNameModal;