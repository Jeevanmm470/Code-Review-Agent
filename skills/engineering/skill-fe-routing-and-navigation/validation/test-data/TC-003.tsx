// TC-003: URL State & Component Synchronization Defect (FRN03)
// Mount-only useEffect ignoring changes to route parameter id.
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    // Defect: Empty dependency array means product is never refetched when productId changes
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, []); // Missing productId in dependency array

  if (!product) return <div>Loading...</div>;

  return <div>{product.name}</div>;
}

