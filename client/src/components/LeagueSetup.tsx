import React, { useState } from 'react';
import { LeagueSettings } from '../services/api';

interface LeagueSetupProps {
  onSettingsSubmit: (settings: LeagueSettings) => Promise<void>;
}

const LeagueSetup: React.FC<LeagueSetupProps> = ({ onSettingsSubmit }) => {
    const [settings, setSettings] = useState<LeagueSettings>({
      teamCount: 10,
      rosterSize: 15,
      qbSlots: 1,
      rbSlots: 2,
      wrSlots: 2,
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
    setSettings(prev => ({ ...prev, [name]: parseInt(value, 10) }));
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
            <input type="number" name="teamCount" value={settings.teamCount} onChange={handleChange} min="4" max="16"
              className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2" />
          </label>
        </div>
        <div>
          <label className="block mb-1">
            Roster Size:
            <input type="number" name="rosterSize" value={settings.rosterSize} onChange={handleChange} min="10" max="20"
              className="w-full mt-1 bg-nfl-gray bg-opacity-20 text-nfl-white rounded p-2" />
          </label>
        </div>
        {/* Add more input fields for other settings */}
      </div>
      <button type="submit" className="w-full mt-6 bg-nfl-red hover:bg-red-700 text-nfl-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
        Save Settings
      </button>
    </form>
  );
};

export default LeagueSetup;