import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';

export function render(url: string, basename = import.meta.env.BASE_URL.replace(/\/$/, '')) {
  return ReactDOMServer.renderToString(
    <React.StrictMode>
      <StaticRouter location={url} basename={basename}>
        <App />
      </StaticRouter>
    </React.StrictMode>
  );
}