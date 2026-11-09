// ============================================================
// main.jsx - ponto de entrada do React.
// Liga o React ao <div id="root"> do index.html e desenha o App.
// ============================================================
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // o style.css da Entrega 1, adaptado
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
