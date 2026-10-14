import React from 'react';

// Defect FCD02: Complex domain calculation and direct fetch embedded inside JSX rendering expression
export const ProductPricingCard = ({ items, threshold }: { items: any[]; threshold: number }) => {
  return (
    <div>
      {items.map((i) => {
        const discounted = i.price * (1 - i.discountRate) * 1.15;
        const interest = discounted > threshold ? discounted * 0.05 : 0;
        return <div key={i.id}>{discounted + interest}</div>;
      })}
    </div>
  );
};

