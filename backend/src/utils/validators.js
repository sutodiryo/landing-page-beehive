const passwordMeetsRules = (password) => {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasLength = password.length >= 12;
  return hasLower && hasUpper && hasDigit && hasSymbol && hasLength;
}

module.exports = { passwordMeetsRules };
