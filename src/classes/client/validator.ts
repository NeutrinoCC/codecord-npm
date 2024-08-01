export function containsUppercaseSymbolsOrSpaces(str: string) {
  // Regular expression to check for uppercase letters, symbols, or spaces
  const pattern = /[A-Z\s!@#$%^&*()_+={}\[\]:;"'<>?,./`~]/;
  return pattern.test(str);
}
