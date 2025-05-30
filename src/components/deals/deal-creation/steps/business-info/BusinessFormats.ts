
export const formatABN = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
  }
  return digits;
};

export const formatACN = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length >= 3) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }
  return digits;
};
