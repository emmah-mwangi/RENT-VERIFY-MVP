import './styles/main.css';
import { Router } from './services/router.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';

export const router = new Router();
export default router;

router.register('/login', LoginPage);
router.register('/dashboard', DashboardPage);

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isAuthenticated = router.isAuthenticated();

  // Handle root URL and unknown routes
  if (path === '/' || path === '') {
    const target = isAuthenticated ? '/dashboard' : '/login';
    window.history.replaceState({}, '', target);
  } else if (!isAuthenticated && path !== '/login') {
    window.history.replaceState({}, '', '/login');
  }

  router.init();
});