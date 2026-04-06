// Number input validation utility
export const validateNumberInput = (value, allowNegative = false) => {
  // Remove any non-numeric characters except decimal point and minus sign
  let cleanValue = value.replace(/[^0-9.-]/g, '');

  // Prevent 'e' and other scientific notation
  if (cleanValue.includes('e') || cleanValue.includes('E')) {
    cleanValue = cleanValue.replace(/[eE]/g, '');
  }

  // Convert to number to validate
  const numValue = parseFloat(cleanValue);

  // If not a valid number, return empty string
  if (isNaN(numValue)) {
    return '';
  }

  // If negative numbers not allowed and value is negative, return positive version
  if (!allowNegative && numValue < 0) {
    return Math.abs(numValue).toString();
  }

  // For natural numbers (positive integers), ensure it's a positive integer
  if (!allowNegative && cleanValue.includes('.')) {
    return Math.floor(Math.abs(numValue)).toString();
  }

  return cleanValue;
};

// Input handler for number inputs
export const handleNumberInput = (e, allowNegative = false) => {
  const input = e.target;
  const start = input.selectionStart;
  const end = input.selectionEnd;

  // Validate the input
  const validatedValue = validateNumberInput(input.value, allowNegative);

  // Only update if value changed
  if (validatedValue !== input.value) {
    input.value = validatedValue;

    // Restore cursor position
    input.setSelectionRange(start, end);
  }
};