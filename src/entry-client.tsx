import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from '@/app/App';
import { analytics } from '@/core/services/analytics/analytics-service';
import { resolveRoute } from '@/routing/manifest';
import { preloadRoute } from '@/routing/preload';
import '@/routing/routes';
import '@/styles/index.css';

async function boot() {
  const container = document.getElementById('root');
  if (!container) return;

  // Load the current page's chunk before hydrating so markup matches.
  await preloadRoute(window.location.pathname);

  const app = (
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );

  // Hydrate only when the HTML was prerendered for this route. When a host
  // serves 404.html as an SPA fallback for a valid route, render fresh.
  const renderedFor = container.dataset.route;
  if (container.hasChildNodes() && renderedFor === resolveRoute(window.location.pathname).path) {
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }

  analytics.start();
}

void boot();
