import { useQuery, useMutation } from '@tanstack/react-query';

export const useProductCatalog = (category: string, page: number) => {
  // Defect FAI09: Incomplete query key ignores category/page parameters, serving stale cache across filters
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetch(`/api/products?cat=${category}&p=${page}`).then((r) => r.json()),
  });
};

