import React from 'react';

// Defect FCD06: Generic UI button primitive leaking feature-specific checkout business logic
export const GenericButton = (props: { label: string; isCheckoutSpecialFlow?: boolean }) => {
  if (props.isCheckoutSpecialFlow) {
    // Feature leak inside reusable UI library primitive
    return <button className="checkout-btn-override" onClick={() => (window.location.href = '/checkout')}>{props.label}</button>;
  }
  return <button>{props.label}</button>;
};

