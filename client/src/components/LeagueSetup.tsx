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
    if (name.startsWith('teamName')) {
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
    <form onSubmit={handleSubmit} className="league-setup bg-nfl-blue text-nfl-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">League Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-1">
            Number of Teams:
            <input 
              type="number" 
              name="teamCount" 
              value={settings.teamCount} 
              onChange={(e) => {
                const newTeamCount = parseInt(e.target.value, 10);
                setSettings(prev => ({
                  ...prev,
                  teamCount: newTeamCount,
                  teamNames: Array(newTeamCount).fill('').map((_, i) => prev.teamNames[i] || `Team ${i + 1}`)
                }));
              }} 
              min="4" 
              max="16"
              className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2" />
          </label>
        </div>
        {settings.teamNames.map((teamName, index) => (
          <div key={index}>
            <label className="block mb-1">
              Team {index + 1} Name:
              <input
                type="text"
                name={`teamName${index}`}
                value={teamName}
                onChange={handleChange}
                className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2"
              />
            </label>
          </div>
        ))}
        <div>
          <label className="block mb-1">
            QB Slots:
            <input type="number" name="qbSlots" value={settings.qbSlots} onChange={handleChange} min="1" max="10"
              className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2" />
          </label>
        </div>
        <div>
          <label className="block mb-1">
            RB Slots:
            <input type="number" name="rbSlots" value={settings.rbSlots} onChange={handleChange} min="1" max="10"
              className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2" />
          </label>
        </div>
        <div>
          <label className="block mb-1">
            WR Slots:
            <input type="number" name="wrSlots" value={settings.wrSlots} onChange={handleChange} min="1" max="10"
              className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2" />
          </label>
        </div>
        <div>
          <label className="block mb-1">
            TE Slots:
            <input type="number" name="teSlots" value={settings.teSlots} onChange={handleChange} min="1" max="10"
              className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2" />
          </label>
        </div>
        <div>
          <label className="block mb-1">
            Flex Slots:
            <input type="number" name="flexSlots" value={settings.flexSlots} onChange={handleChange} min="1" max="10"
              className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2" />
          </label>
          </div>
        <div>
          <label className="block mb-1">
            K Slots:
            <input type="number" name="kSlots" value={settings.kSlots} onChange={handleChange} min="1" max="10"
              className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2" />
          </label>
        </div>
        <div>
          <label className="block mb-1">
            DEF Slots:
            <input type="number" name="defSlots" value={settings.defSlots} onChange={handleChange} min="1" max="10"
              className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2" />
          </label>
        </div>
        <div>
          <label className="block mb-1">  
            Bench Slots:
            <input type="number" name="benchSlots" value={settings.benchSlots} onChange={handleChange} min="1" max="10"
              className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2" />
          </label>
        </div>
      </div>
      <button type="submit" className="w-full mt-6 bg-nfl-red hover:bg-red-700 text-nfl-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
        Save Settings
      </button>
    </form>
  );
};

export default LeagueSetup;