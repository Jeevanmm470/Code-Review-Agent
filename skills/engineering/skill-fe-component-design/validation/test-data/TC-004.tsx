import React from 'react';

interface CardProps {
  isPrimary?: boolean;
  isSecondary?: boolean;
  isGhost?: boolean;
  isOutline?: boolean;
  isLink?: boolean;
}

// Defect FCD04: Multiple conflicting boolean flags creating impossible and undefined UI modes
export const MultiModeCard = ({ isPrimary, isSecondary, isGhost, isOutline, isLink }: CardProps) => {
  return <div className={`card ${isPrimary ? 'p' : ''} ${isSecondary ? 's' : ''}`}>Card</div>;
};

