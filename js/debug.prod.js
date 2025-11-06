// js/debug.prod.js
window.DEBUG = false;

// Função vazia → não faz NADA (mais rápido)
window.log = function () {};

// Warn e Error continuam funcionando (para erros reais)
window.warn = console.warn.bind(console);
window.error = console.error.bind(console);