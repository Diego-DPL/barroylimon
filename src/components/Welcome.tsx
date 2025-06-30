import React from 'react';

interface WelcomeProps {
  title: string;
  subtitle?: string;
}

const Welcome: React.FC<WelcomeProps> = ({ title, subtitle }) => {
  return (
    <div className="welcome-container">
      <h2>{title}</h2>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </div>
  );
};

export default Welcome;
