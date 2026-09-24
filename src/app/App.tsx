import { useRoutes } from 'react-router';
import { AuthProvider } from '@/core/auth/AuthProvider';
import { RouteHead } from '@/core/seo/RouteHead';
import { usePageViews } from '@/core/services/analytics/useAnalytics';
import { routeObjects } from '@/routing/routes';
import { NavigationEffects } from './NavigationEffects';

export function App() {
  usePageViews();
  const element = useRoutes(routeObjects);
  return (
    <AuthProvider>
      <RouteHead />
      <NavigationEffects />
      {element}
    </AuthProvider>
  );
}
