// script.js (keeps original functionality: localStorage, copy, mask, delete)
// plus: robust hamburger toggle (works reliably), click-outside to close, Escape key, resize reset

// ---------- Utility: Toast ----------
const toast = document.getElementById('toast');
let toastTimer = null;
function showToast(message, duration = 2000) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ---------- Mask password ----------
function maskPassword(pass) {
  let str = "";
  for (let i = 0; i < pass.length; i++) str += "*";
  return str;
}

// ---------- Copy to clipboard ----------
function copyText(txt) {
  if (!navigator.clipboard) {
    const ta = document.createElement('textarea');
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('Copied to clipboard'); }
    catch { showToast('Copy failed'); }
    document.body.removeChild(ta);
    return;
  }
  navigator.clipboard.writeText(txt).then(
    () => showToast('Copied to clipboard'),
    () => showToast('Clipboard copying failed')
  );
}

// ---------- Delete password ----------
function deletePassword(website) {
  let data = localStorage.getItem("passwords");
  if (!data) {
    showToast('No passwords stored');
    showPasswords();
    return;
  }
  let arr = JSON.parse(data);
  const arrUpdated = arr.filter(e => e.website !== website);
  localStorage.setItem("passwords", JSON.stringify(arrUpdated));
  showToast(`Deleted ${website}'s password`);
  showPasswords();
}

// ---------- Helper to escape strings used in inline handlers ----------
function escapeForOnclick(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// ---------- Render passwords into table ----------
function showPasswords() {
  const tbBody = document.getElementById("passwordBody");
  let data = localStorage.getItem("passwords");
  if (!data) {
    tbBody.innerHTML = `<tr><td class="empty-row" colspan="4">No Data to show</td></tr>`;
    return;
  }

  const arr = JSON.parse(data);
  if (arr.length === 0) {
    tbBody.innerHTML = `<tr><td class="empty-row" colspan="4">No Data to show</td></tr>`;
    return;
  }

  let rows = "";
  for (let i = 0; i < arr.length; i++) {
    const e = arr[i];
    const websiteEsc = escapeForOnclick(e.website);
    const usernameEsc = escapeForOnclick(e.username);
    const passwordEsc = escapeForOnclick(e.password);

    rows += `<tr>
      <td>${e.website}
        <img class="copy-icon" onclick="copyText('${websiteEsc}')" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%230f172a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect x='9' y='9' width='13' height='13' rx='2' ry='2'></rect><path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path></svg>" alt="copy" />
      </td>
      <td>${e.username}
        <img class="copy-icon" onclick="copyText('${usernameEsc}')" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%230f172a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect x='9' y='9' width='13' height='13' rx='2' ry='2'></rect><path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path></svg>" alt="copy" />
      </td>
      <td>${maskPassword(e.password)}
        <img class="copy-icon" onclick="copyText('${passwordEsc}')" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%230f172a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect x='9' y='9' width='13' height='13' rx='2' ry='2'></rect><path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path></svg>" alt="copy" />
      </td>
      <td><button class="deletebtn" onclick="deletePassword('${websiteEsc}')">Delete</button></td>
    </tr>`;
  }

  tbBody.innerHTML = rows;

  // Clear inputs (mimic original behavior)
  const websiteInput = document.getElementById('website');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  if (websiteInput) websiteInput.value = "";
  if (usernameInput) usernameInput.value = "";
  if (passwordInput) passwordInput.value = "";
}

// ---------- Form submit handling & navbar behavior ----------
document.addEventListener('DOMContentLoaded', () => {
  showPasswords();

  const form = document.getElementById('passForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const website = document.getElementById('website').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!website || !username || !password) {
      showToast('Please fill all fields');
      return;
    }

    let passwords = localStorage.getItem("passwords");
    if (!passwords) {
      let json = [];
      json.push({ website, username, password });
      localStorage.setItem("passwords", JSON.stringify(json));
    } else {
      let json = JSON.parse(passwords);
      json.push({ website, username, password });
      localStorage.setItem("passwords", JSON.stringify(json));
    }
    showToast('Password saved');
    showPasswords();
  });

  document.addEventListener('DOMContentLoaded', () => {
    const navToggleBtn = document.getElementById('navToggle');
    const navLinksEl = document.getElementById('navLinks');
  
    if (navToggleBtn && navLinksEl) {
      navToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.documentElement.classList.toggle('nav-open');
  
        const expanded = navToggleBtn.getAttribute('aria-expanded') === 'true';
        navToggleBtn.setAttribute('aria-expanded', String(!expanded));
        navLinksEl.setAttribute('aria-expanded', String(!expanded));
      });
  
      // Click outside closes nav
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-inner') && document.documentElement.classList.contains('nav-open')) {
          document.documentElement.classList.remove('nav-open');
          navToggleBtn.setAttribute('aria-expanded', 'false');
          navLinksEl.setAttribute('aria-expanded', 'false');
        }
      });
  
      // Escape closes nav
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.documentElement.classList.contains('nav-open')) {
          document.documentElement.classList.remove('nav-open');
          navToggleBtn.setAttribute('aria-expanded', 'false');
          navLinksEl.setAttribute('aria-expanded', 'false');
        }
      });
  
      // Close nav on link click
      navLinksEl.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'a') {
          document.documentElement.classList.remove('nav-open');
          navToggleBtn.setAttribute('aria-expanded', 'false');
          navLinksEl.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });
  

});


// ✅ Reuse navbar toggle (same as in your main page)
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('nav-open');
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navLinks.setAttribute('aria-expanded', String(!expanded));
  });
}

// ✅ Typewriter effect for About page
const typewriterEl = document.getElementById("typewriter");

if (typewriterEl) {
  const lines = [
    "Welcome to Securix",
    "Developed by Raj Joshi",
    "This is your Password Manager",
    "Feel Secure, Always!"
  ];
  
  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    const currentLine = lines[lineIndex];
    let displayed = currentLine.substring(0, charIndex);

    typewriterEl.textContent = displayed;

    if (!isDeleting) {
      if (charIndex < currentLine.length) {
        charIndex++;
        setTimeout(typeEffect, 120);
      } else {
        isDeleting = true;
        setTimeout(typeEffect, 1500); // pause before deleting
      }
    } else {
      if (charIndex > 0) {
        charIndex--;
        setTimeout(typeEffect, 80);
      } else {
        isDeleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        setTimeout(typeEffect, 300);
      }
    }
  }

  typeEffect();
}

const typewriterE2 = document.getElementById("typewriter1");

if (typewriterE2) {
  const lines = [
    "Welcome to Securix!",
    "Your Password Manager",
    "Feel Secure, Always!",
    "Store your passwords here!",
    "Developed by Raj Joshi"
  ];
  
  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect1() {
    const currentLine = lines[lineIndex];
    let displayed = currentLine.substring(0, charIndex);

    typewriterE2.textContent = displayed;

    if (!isDeleting) {
      if (charIndex < currentLine.length) {
        charIndex++;
        setTimeout(typeEffect1, 120);
      } else {
        isDeleting = true;
        setTimeout(typeEffect1, 1500); // pause before deleting
      }
    } else {
      if (charIndex > 0) {
        charIndex--;
        setTimeout(typeEffect1, 80);
      } else {
        isDeleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        setTimeout(typeEffect1, 300);
      }
    }
  }

  typeEffect1();
}
