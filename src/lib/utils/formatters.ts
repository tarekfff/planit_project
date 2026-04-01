export function formatPrice(amount: number, currency: string = 'DZD') {
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatPhone(phone: string) {
  // Assuming Algerian phone format 0XXX XX XX XX
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{4})(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  return phone;
}
