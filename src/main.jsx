import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import App from './App.jsx'
import './index.css'

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    'VITE_CONVEX_URL is not set. Copy .env.example to .env and set it to your ' +
      'Convex deployment URL (see README) so scholarship/opportunity data can load.'
  );
}

const convex = new ConvexReactClient(convexUrl || 'https://placeholder.convex.cloud');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexProvider>
  </React.StrictMode>,
)
