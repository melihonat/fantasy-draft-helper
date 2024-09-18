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
    <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-red text-nfl-white p-4 md:p-8">
      <form onSubmit={handleSubmit} className="league-setup bg-white bg-opacity-10 p-6 md:p-8 rounded-lg shadow-xl max-w-4xl mx-auto backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">League Settings</h2>
        
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
              className="w-full mt-1 bg-nfl-blue bg-opacity-50 text-nfl-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-nfl-red transition duration-300 ease-in-out" 
            />
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Team Names</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {settings.teamNames.map((teamName, index) => (
              <div key={index}>
                <label className="block mb-2 font-medium">
                  Team {index + 1}:
                  <input
                    type="text"
                    name={`teamName${index}`}
                    value={teamName}
                    onChange={handleChange}
                    className="w-full mt-1 bg-nfl-blue bg-opacity-50 text-nfl-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-nfl-red transition duration-300 ease-in-out"
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
                <label className="block mb-2 font-medium">
                  {position} Slots:
                  <input
                    type="number"
                    name={`${position.toLowerCase()}Slots`}
                    value={settings[`${position.toLowerCase()}Slots` as keyof LeagueSettings]}
                    onChange={handleChange}
                    min="0"
                    max="10"
                    className="w-full mt-1 bg-nfl-blue bg-opacity-50 text-nfl-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-nfl-red transition duration-300 ease-in-out"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Scoring Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 font-medium">
                Passing TD Points:
                <input
                  type="number"
                  name="passingTouchdownPoints"
                  value={settings.passingTouchdownPoints}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full mt-1 bg-nfl-blue bg-opacity-50 text-nfl-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-nfl-red transition duration-300 ease-in-out"
                />
              </label>
            </div>
            <div>
              <label className="block mb-2 font-medium">
                Rushing TD Points:
                <input
                  type="number"
                  name="rushingTouchdownPoints"
                  value={settings.rushingTouchdownPoints}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full mt-1 bg-nfl-blue bg-opacity-50 text-nfl-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-nfl-red transition duration-300 ease-in-out"
                />
              </label>
            </div>
            <div>
              <label className="block mb-2 font-medium">
                Reception Points:
                <input
                  type="number"
                  name="receptionPoints"
                  value={settings.receptionPoints}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full mt-1 bg-nfl-blue bg-opacity-50 text-nfl-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-nfl-red transition duration-300 ease-in-out"
                />
              </label>
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full mt-8 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 shadow-lg"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default LeagueSetup;