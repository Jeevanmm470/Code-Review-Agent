// TC-009: FSEC09 - Sensitive Data Exposure in Browser Storage

export function rememberPaymentDetails(cardNumber: string, cvv: string) {
  // VIOLATION (FSEC09): Storing unencrypted payment card number and CVV in persistent localStorage
  localStorage.setItem('cached_card_num', cardNumber);
  localStorage.setItem('cached_card_cvv', cvv);
}

