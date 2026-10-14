// TC-006: Deep Linking & Direct URL Restoration Defect (FRN06)
// Detail view relies strictly on location.state; crashes on direct link load or tab refresh.
import React from 'react';
import { useLocation } from 'react-router-dom';

export function OrderSummary() {
  const location = useLocation();
  // Defect: Accessing location.state properties directly without fallback or fetch handling
  const order = location.state.order;

  return (
    <div>
      <h1>Order #{order.id}</h1>
      <p>Total: ${order.total}</p>
    </div>
  );
}

