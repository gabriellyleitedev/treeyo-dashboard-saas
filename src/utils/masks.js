// Máscara de digitação DD/MM/AAAA
export function mascaraData(valor) {
  const v = valor.replace(/\D/g, '').slice(0, 8);
  if (v.length >= 5) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
  if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`;
  return v;
}

// Máscara de digitação HH:MM
export function mascaraHora(valor) {
  const v = valor.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 3) return `${v.slice(0, 2)}:${v.slice(2)}`;
  return v;
}
