// js/debug.dev.js
window.DEBUG = true;

// Função de log (ativa apenas em dev)
window.log = function (...args) {
    if (window.DEBUG) {
        console.log('%c[DEV]', 'color: #00bfff; font-weight: bold;', ...args);
    }
};

// Sempre disponíveis (mesmo em produção)
window.warn = console.warn.bind(console);
window.error = console.error.bind(console);