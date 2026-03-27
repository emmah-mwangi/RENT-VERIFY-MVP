import './styles/main.css';
import { Router } from './services/router.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';

// Global router instance
export const router = new Router();
export default router;

// Register routes
router.register('/login', LoginPage);
router.register('/dashboard', DashboardPage);

// Initialize router on page load
document.addEventListener('DOMContentLoaded', () => {
  // Redirect to login if not authenticated
  if (!router.isAuthenticated() && window.location.pathname !== '/login') {
    window.history.replaceState({ path: '/login' }, '', '/login');
  }

  router.init();
});

// Handle page visibility to refresh data
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && router.isAuthenticated()) {
    // Optionally refresh dashboard data when user returns
    const event = new CustomEvent('pageVisible');
    window.dispatchEvent(event);
  }
});
