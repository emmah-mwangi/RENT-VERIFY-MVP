// Check authentication on dashboard load
if (window.location.pathname.includes('dashboard.html')) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
  }
}

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
