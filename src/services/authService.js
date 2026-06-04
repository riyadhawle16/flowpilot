// ─── Mock Auth Service ────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** djb2-style mock hash — NOT cryptographically secure */
function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

class AuthError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'AuthError';
  }
}

export async function login(email, password) {
  await delay(600);
  try {
    const raw = localStorage.getItem('flowpilot_credentials');
    const creds = raw ? JSON.parse(raw) : [];
    const match = creds.find((c) => c.email === email.toLowerCase().trim());
    if (!match) throw new AuthError('No account found with this email');
    if (simpleHash(password) !== match.passwordHash)
      throw new AuthError('Incorrect password');
    const userRaw = localStorage.getItem('flowpilot_user_' + match.email);
    const userObj = JSON.parse(userRaw);
    localStorage.setItem('flowpilot_user', JSON.stringify(userObj));
    return userObj;
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError('Login failed. Please try again.');
  }
}

export async function signup(name, email, password) {
  await delay(800);
  try {
    const raw = localStorage.getItem('flowpilot_credentials');
    const creds = raw ? JSON.parse(raw) : [];
    const normalEmail = email.toLowerCase().trim();
    if (creds.find((c) => c.email === normalEmail))
      throw new AuthError('An account with this email already exists');

    const newUser = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: normalEmail,
      createdAt: new Date().toISOString(),
    };
    creds.push({ email: normalEmail, passwordHash: simpleHash(password) });
    localStorage.setItem('flowpilot_credentials', JSON.stringify(creds));
    localStorage.setItem('flowpilot_user_' + normalEmail, JSON.stringify(newUser));
    localStorage.setItem('flowpilot_user', JSON.stringify(newUser));
    return newUser;
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError('Signup failed. Please try again.');
  }
}

export function logout() {
  localStorage.removeItem('flowpilot_user');
}
