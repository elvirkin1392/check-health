import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import {getStoredLang} from './i18n/currentLang';

import './index.css';

// Язык документа — для экранных читалок и переносов, до первой отрисовки (FR-6).
document.documentElement.lang = getStoredLang();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App/>
  </StrictMode>,
)
