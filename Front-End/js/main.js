import './style.css';

document.getElementById('app').innerHTML = `
  <meta charset="UTF-8">
  <title>Rent Verifier | Secure Access</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Font -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Icons -->
  <script src="https://kit.fontawesome.com/a2e0b7b6b0.js" crossorigin="anonymous"></script>

  <!-- Google Identity Services -->
  <script src="https://accounts.google.com/gsi/client" async defer></script>

  <link rel="stylesheet" href="/style.css">

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
         data-login_uri="http://localhost:5000/api/auth/google"
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
      Don’t have an account?
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

<script type="module" src="/main.js"></script>
`;
// MODAL HANDLING
const signupModal = document.getElementById("signupModal");
const openSignup = document.getElementById("openSignup");
const closeSignup = document.getElementById("closeSignup");

// Open modal
openSignup.addEventListener("click", (e) => {
  e.preventDefault();
  signupModal.style.display = "flex";
});

// Close modal
closeSignup.addEventListener("click", () => {
  signupModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === signupModal) {
    signupModal.style.display = "none";
  }
});

// --- SIGNUP ---
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirmPassword").value;

  if (password !== confirm) {
    alert("Passwords do not match.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, phone, password })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) signupModal.style.display = "none";
  } catch (err) {
    console.error(err);
    alert("Signup failed.");
  }
});

// --- LOGIN ---
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginIdentifier").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, password })
    });

    const data = await res.json();
    console.log("Login response:", res.status, data);

    if (res.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = "dashboard.html";
    } else {
      alert(data.message || "Login failed.");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Unable to connect to server. Please check if the backend is running.");
  }
});

// --- GOOGLE SIGN IN ---
document.querySelector(".g_id_signin").addEventListener("click", () => {
  alert("Google sign-in is not yet implemented. Please use email login.");
});
