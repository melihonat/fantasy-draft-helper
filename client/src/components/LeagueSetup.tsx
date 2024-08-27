import React, { useState } from 'react';
import { LeagueSettings, api } from '../services/api';

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
    <form onSubmit={handleSubmit} className="league-setup">
      <h2>League Settings</h2>
      <div>
        <label>
          Number of Teams:
          <input type="number" name="teamCount" value={settings.teamCount} onChange={handleChange} min="4" max="16" />
        </label>
      </div>
      <div>
        <label>
          Roster Size:
          <input type="number" name="rosterSize" value={settings.rosterSize} onChange={handleChange} min="10" max="20" />
        </label>
      </div>
      {/* Add more input fields for other settings */}
      <button type="submit">Save Settings</button>
    </form>
  );
};

export default LeagueSetup;