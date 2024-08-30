import React, { useState } from 'react';
import { LeagueSettings } from '../services/api';

interface LeagueSetupProps {
  onSettingsSubmit: (settings: LeagueSettings) => Promise<void>;
}

const LeagueSetup: React.FC<LeagueSetupProps> = ({ onSettingsSubmit }) => {
  const [settings, setSettings] = useState<LeagueSettings>({
    teamCount: 10,
    teamNames: Array(10).fill('').map((_, i) => `Team ${i + 1}`),
    rosterSize: 16,
    qbSlots: 1,
    rbSlots: 2,
    wrSlots: 3,
    teSlots: 1,
    flexSlots: 1,
    kSlots: 1,
    defSlots: 1,
    benchSlots: 6,
    passingTouchdownPoints: 4,
    rushingTouchdownPoints: 6,
    receptionPoints: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'teamCount') {
      const newTeamCount = parseInt(value, 10);
      setSettings(prev => ({
        ...prev,
        teamCount: newTeamCount,
        teamNames: Array(newTeamCount).fill('').map((_, i) => prev.teamNames[i] || `Team ${i + 1}`)
      }));
    } else if (name.startsWith('teamName')) {
      const index = parseInt(name.replace('teamName', ''), 10);
      setSettings(prev => ({
        ...prev,
        teamNames: prev.teamNames.map((teamName, i) => i === index ? value : teamName)
      }));
    } else {
      setSettings(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSettingsSubmit(settings);
  };

  return (
    <form onSubmit={handleSubmit} className="league-setup bg-nfl-blue bg-opacity-90 text-nfl-white p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">League Settings</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Number of Teams</h3>
        <div className="flex items-center">
          <input 
            type="number" 
            name="teamCount" 
            value={settings.teamCount} 
            onChange={handleChange}
            min="4" 
            max="16"
            className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-nfl-red" 
          />
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Team Names</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {settings.teamNames.map((teamName, index) => (
            <div key={index}>
              <label className="block mb-2 font-semibold">
                Team {index + 1}:
                <input
                  type="text"
                  name={`teamName${index}`}
                  value={teamName}
                  onChange={handleChange}
                  className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-nfl-red"
                />
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Roster Settings</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF', 'Bench'].map(position => (
            <div key={position}>
              <label className="block mb-2 font-semibold">
                {position} Slots:
                <input
                  type="number"
                  name={`${position.toLowerCase()}Slots`}
                  value={settings[`${position.toLowerCase()}Slots` as keyof LeagueSettings]}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-nfl-red"
                />
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <button type="submit" className="w-full mt-8 bg-nfl-red hover:bg-red-700 text-nfl-white font-bold py-3 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
        Save Settings
      </button>
    </form>
  );
};

export default LeagueSetup;