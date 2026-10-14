import React, { useState, useEffect } from 'react';

// TC-002: FSM02 - Derived State & Synchronized Computations
export function ShoppingCartSummary({ items }: { items: Array<{ id: string; price: number }> }) {
  // VIOLATION (FSM02): Storing derived calculation in redundant state synchronized via effect (1-render lag)
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const total = items.reduce((acc, item) => acc + item.price, 0);
    setTotalPrice(total);
  }, [items]);

  return <div className="total">Total: ${totalPrice}</div>;
}

