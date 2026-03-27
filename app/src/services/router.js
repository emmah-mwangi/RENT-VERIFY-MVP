// Simple SPA Router - no external dependencies

export class Router {
  constructor() {
    this.routes = new Map();
    this.currentPage = null;
  }

  register(path, pageComponent) {
    this.routes.set(path, pageComponent);
  }

  async navigate(path) {
    const page = this.routes.get(path);
    if (!page) {
      console.error(`Route not found: ${path}`);
      return;
    }

    // Update URL without reload
    window.history.pushState({ path }, '', path);

    // Render page
    await this.render(page);
  }

  async render(PageComponent) {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const page = new PageComponent();
    const content = await page.render();
    app.appendChild(content);

    if (page.afterRender) {
      await page.afterRender();
    }
  }

  init() {
    // Handle back/forward buttons
    window.addEventListener('popstate', (e) => {
      const path = e.state?.path || '/login';
      this.navigate(path);
    });

    // Start at login
    const currentPath = window.location.pathname || '/login';
    this.navigate(currentPath);
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}
