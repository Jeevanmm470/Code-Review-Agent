import React, { useState } from 'react';

export const CheckoutButton = ({ cartId }: { cartId: string }) => {
  const [success, setSuccess] = useState(false);

  // Defect FAI06: Missing disable/loading guard allows rapid double-click duplicate order submissions
  const handleCheckout = async () => {
    await fetch(`/api/orders`, {
      method: 'POST',
      body: JSON.stringify({ cartId }),
    });
    setSuccess(true);
  };

  return <button onClick={handleCheckout}>Pay Now</button>;
};

