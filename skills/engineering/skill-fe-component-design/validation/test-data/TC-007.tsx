import React, { useState } from 'react';

// Sibling A
export const CreditCardFormA = () => {
  const [val, setVal] = useState('');
  // Defect FCD07: Duplicated Luhn algorithm and CC validation copied across sibling components
  const validateCard = (num: string) => {
    let sum = 0;
    for (let i = 0; i < num.length; i++) {
      let digit = parseInt(num[i], 10);
      if (i % 2 === 0) digit *= 2;
      sum += digit > 9 ? digit - 9 : digit;
    }
    return sum % 10 === 0;
  };

  return <input value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => validateCard(val)} />;
};

// Sibling B duplicates identical 15 lines of Luhn validation logic
export const QuickPayFormB = () => {
  const [card, setCard] = useState('');
  const validateCard = (num: string) => {
    let sum = 0;
    for (let i = 0; i < num.length; i++) {
      let digit = parseInt(num[i], 10);
      if (i % 2 === 0) digit *= 2;
      sum += digit > 9 ? digit - 9 : digit;
    }
    return sum % 10 === 0;
  };

  return <input value={card} onChange={(e) => setCard(e.target.value)} onBlur={() => validateCard(card)} />;
};

