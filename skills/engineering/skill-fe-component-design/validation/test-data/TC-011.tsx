import React, { ReactNode } from 'react';

interface CardProps {
  variant?: 'primary' | 'secondary';
  header?: ReactNode;
  children: ReactNode;
  onSelect?: () => void;
}

// Clean Baseline: Cohesive props, slot composition, no leaked abstractions or tangled side effects
export const CohesiveCard = ({ variant = 'primary', header, children, onSelect }: CardProps) => {
  return (
    <div className={`card card--${variant}`} onClick={onSelect}>
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
    </div>
  );
};

