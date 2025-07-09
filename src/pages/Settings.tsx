import React from 'react';
import Card from '../components/common/Card';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <Card>
        <div className="text-gray-700">
          <p>This is the settings page. You can add application settings here in the future.</p>
        </div>
      </Card>
    </div>
  );
};

export default Settings; 