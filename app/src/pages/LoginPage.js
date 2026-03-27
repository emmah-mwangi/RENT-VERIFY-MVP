import { apiClient } from '../services/api.js';
import router from '../main.js';

export class LoginPage {
  async render() {
    const container = document.createElement('div');
    container.id = 'login-page';
    container.innerHTML = `
      <div class="auth-container">
        <div class="auth-card">
          <div class="brand">
            <h1>Rent Verifier</h1>
            <p>Secure rent verification & fraud prevention</p>
          </div>

          <!-- SIGN IN -->
          <form id="loginForm">
            <div class="input-group">
              <label>Email</label>
              <input type="email" id="loginIdentifier" placeholder="email" required>
            </div>

            <div class="input-group">
              <label>Password</label>
              <input type="password" id="loginPassword" placeholder="••••••••" required>
            </div>

            <button type="submit" class="btn primary-btn">
              Sign in
            </button>
          </form>

          <div class="divider"><span>or</span></div>

          <div id="g_id_onload"
               data-client_id="YOUR_GOOGLE_CLIENT_ID"
               data-login_uri="/api/auth/google"
               data-auto_prompt="false">
          </div>
          <div class="g_id_signin"
               data-type="standard"
               data-size="large"
               data-theme="outline"
               data-text="continue_with"
               data-shape="rectangular"
               data-logo_alignment="left">
          </div>

          <p class="switch-text">
            Don't have an account?
            <a href="#" id="openSignup">Create account</a>
          </p>
        </div>
      </div>

      <!-- SIGN UP MODAL -->
      <div class="modal" id="signupModal">
        <div class="modal-card">
          <span class="close" id="closeSignup">&times;</span>

          <h2>Create your account</h2>
          <p class="modal-subtitle">Professional access to Rent Verifier</p>

          <form id="signupForm">
            <div class="input-group">
              <label for="signupName">Full Name</label>
              <input type="text" id="signupName" required>
            </div>

            <div class="input-group">
              <label for="signupEmail">Email Address</label>
              <input type="email" id="signupEmail" required>
            </div>

            <div class="input-group">
              <label for="signupPhone">Phone Number</label>
              <input type="tel" id="signupPhone" placeholder="+254 7XX XXX XXX" required>
            </div>

            <div class="input-group">
              <label for="signupPassword">Password</label>
              <input type="password" id="signupPassword" required>
            </div>

            <div class="input-group">
              <label for="signupConfirmPassword">Confirm Password</label>
              <input type="password" id="signupConfirmPassword" required>
            </div>

            <button type="submit" class="btn primary-btn">
              Create account
            </button>
          </form>
        </div>
      </div>
    `;

    return container;
  }

  async afterRender() {
    const signupModal = document.getElementById('signupModal');
    const openSignup = document.getElementById('openSignup');
    const closeSignup = document.getElementById('closeSignup');

    // Modal handling
    openSignup.addEventListener('click', (e) => {
      e.preventDefault();
      signupModal.style.display = 'flex';
    });

    closeSignup.addEventListener('click', () => {
      signupModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
      if (e.target === signupModal) {
        signupModal.style.display = 'none';
      }
    });

    // Signup handler
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const fullName = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const phone = document.getElementById('signupPhone').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirm = document.getElementById('signupConfirmPassword').value;

      if (password !== confirm) {
        alert('Passwords do not match.');
        return;
      }

      try {
        const data = await apiClient.signup(fullName, email, phone, password);
        alert(data.message);
        signupModal.style.display = 'none';
        document.getElementById('signupForm').reset();
      } catch (err) {
        alert(err.message || 'Signup failed.');
      }
    });

    // Login handler
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('loginIdentifier').value.trim();
      const password = document.getElementById('loginPassword').value;

      if (!email || !password) {
        alert('Please enter email and password.');
        return;
      }

      try {
        const data = await apiClient.login(email, password);
        localStorage.setItem('token', data.token);
        router.navigate('/dashboard');
      } catch (err) {
        alert(err.message || 'Login failed.');
      }
    });
  }
}
