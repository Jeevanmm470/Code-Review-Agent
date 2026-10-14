// TC-010: FSM10 - Multi-Layer Data Flow & Boundary Contracts

export interface OrderState {
  items: Array<{ id: string; price: number }>;
  discountCode: string | null;
  total: number;
}

export function applyDiscountDirectly(order: OrderState, code: string, discountAmount: number) {
  // VIOLATION (FSM10): Mutating order state in disparate UI helper without domain validation, creating invalid total
  order.discountCode = code;
  order.total = order.total - discountAmount; // Can result in negative totals or unvalidated discounts
}

