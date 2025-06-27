// Configuração ESLint para relaxar algumas regras de TypeScript temporariamente

module.exports = {
  extends: [
    './eslint.config.js', // Herda a configuração principal
  ],
  rules: {
    // Permite uso de any em alguns casos específicos
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',

    // Permite parâmetros implicitamente any em callbacks
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
  },
};
