import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Global error handler to prevent STATUS_PRIVILEGED_INSTRUCTION crashes
if (typeof window !== 'undefined') {
  const originalError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (message && typeof message === 'string' && message.includes('STATUS_PRIVILEGED_INSTRUCTION')) {
      console.warn('Privileged instruction error caught and prevented:', message);
      return true; // Prevent default error handling
    }
    if (originalError) {
      return originalError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('STATUS_PRIVILEGED_INSTRUCTION')) {
      e.preventDefault();
      e.stopPropagation();
      console.warn('Privileged instruction error event caught and prevented');
      return true;
    }
  }, true);

  window.addEventListener('unhandledrejection', function(e) {
    const reason = e.reason;
    if (reason && (
      (typeof reason === 'string' && reason.includes('STATUS_PRIVILEGED_INSTRUCTION')) ||
      (reason instanceof Error && reason.message.includes('STATUS_PRIVILEGED_INSTRUCTION'))
    )) {
      e.preventDefault();
      console.warn('Privileged instruction promise rejection caught and prevented');
      return true;
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
