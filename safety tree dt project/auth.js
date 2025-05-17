import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://sklgbhgblgklyjutvami.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbGdiaGdibGdrbHlqdXR2YW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NjI5NDgsImV4cCI6MjA2MjQzODk0OH0.rhCuiYnd05KpEcZvFC6kEDYD2_tZNpO8Q2MV2ixjMDY'
);

// Toggle Forms
window.showForm = function (type) {
  document.getElementById('loginForm').style.display = type === 'login' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = type === 'signup' ? 'block' : 'none';
};

// SIGNUP
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;
  const fullName = document.getElementById('signupName').value;

  if (password !== confirm) return alert("Passwords do not match");

  const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password });
  if (signupError) return alert(signupError.message);

  // Insert into 'profiles' table
  const user = signupData.user;
  if (user) {
    const { error: insertError } = await supabase.from('profiles').insert([
      {
        id: user.id,
        name: fullName,
        role: email === "admin@gmail.com" ? "admin" : "user" // make specific email admin
      }
    ]);
    if (insertError) console.error("Profile insert error:", insertError.message);
  }

  alert("Signup successful. Please check your email to confirm.");
});

// LOGIN
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
  if (loginError) return alert(loginError.message);

  const userId = loginData.user.id;
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error(profileError);
    return alert("Unable to fetch user role.");
  }

  // Redirect based on role
  if (profile.role === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'index1.html';
  }
});

// Toggle buttons (UI)
function showForm(formType) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const buttons = document.querySelectorAll('.form-toggle button');

  if (formType === 'login') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    buttons[0].classList.add('active');
    buttons[1].classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    buttons[0].classList.remove('active');
    buttons[1].classList.add('active');
  }
}

// On load
document.addEventListener('DOMContentLoaded', function () {
  showForm('login');
  for (let i = 0; i < 5; i++) createLeaf();
});

// Decorative floating leaf background
function createLeaf() {
  const leaf = document.createElement('div');
  leaf.className = 'leaf';

  const size = Math.random() * 60 + 40;
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const delay = Math.random() * 5;
  const duration = Math.random() * 10 + 10;

  const colors = ['#4caf50', '#2e7d32', '#8bc34a', '#689f38'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  leaf.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${left}%;
    top: ${top}%;
    animation-delay: ${delay}s;
    animation-duration: ${duration}s;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="${color}" d="M50 0 Q70 30 50 60 Q30 30 50 0" /></svg>');
  `;

  document.body.appendChild(leaf);
}
