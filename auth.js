// ---------- CONFIG ----------
export const clientId = "13ff8254c56d4ad2910cee29e3c4d1aa";
export const redirectUri = "http://127.0.0.1:5500/callback.html"; 
export const scopes = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
  "user-library-read"
].join(" ");

// ---------- PKCE HELPERS ----------
function generateRandomString(length) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(arrayBuffer) {
  let string = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
  return btoa(string).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ---------- LOGIN ----------
export async function loginWithSpotify() {
  const codeVerifier = generateRandomString(128);
  sessionStorage.setItem("code_verifier", codeVerifier);

  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(hashed);

  const url = new URL("https://accounts.spotify.com/authorize");
  url.searchParams.append("client_id", clientId);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("redirect_uri", redirectUri);
  url.searchParams.append("code_challenge_method", "S256");
  url.searchParams.append("code_challenge", codeChallenge);
  url.searchParams.append("scope", scopes);

  window.location = url.toString();
}

// ---------- CALLBACK: trade code → token ----------
export async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const codeVerifier = sessionStorage.getItem("code_verifier");

  const body = new URLSearchParams();
  body.append("client_id", clientId);
  body.append("grant_type", "authorization_code");
  body.append("code", code);
  body.append("redirect_uri", redirectUri);
  body.append("code_verifier", codeVerifier);

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const data = await response.json();

  if (data.access_token) {
    sessionStorage.setItem("access_token", data.access_token);
    // Redirecționează către app.html sau pagina principală a aplicației
    window.location = "/app.html";
  } else {
    console.error("Nu s-a primit access token:", data);
    alert("Eroare la autentificare. Te rog încearcă din nou.");
    window.location = "/index.html";
  }
}