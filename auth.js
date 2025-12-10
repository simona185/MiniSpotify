// --- CONSTANTE ---
const CLIENT_ID = "13ff8254c56d4ad2910cee29e3c4d1aa"; 
// ATENȚIE: Verifică ca acest URI să fie EXACT cel setat în Spotify Dashboard!
const REDIRECT_URI = "https://simona185.github.io/MiniSpotify/callback.html";
const SCOPES = "user-read-private user-read-email user-top-read user-read-currently-playing";

// --- FUNCTII PKCE (Copiază-le exact) ---

function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = crypto.getRandomValues(new Uint8Array(length));
    return randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function sha256(plain) {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
}

function base64urlencode(a) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function generateCodeChallenge(v) {
    const hashed = await sha256(v)
    return base64urlencode(hashed);
}

// --- FUNCTIA DE INITIERE LOGIN (Exportabilă) ---

export async function redirectToAuthCodeFlow() {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Salvăm Verifier-ul local pentru a fi folosit la callback
    localStorage.setItem('code_verifier', codeVerifier); 

    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("response_type", "code"); // ESENTIAL: "code" în loc de "token"
    params.append("redirect_uri", REDIRECT_URI);
    params.append("scope", SCOPES);
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", codeChallenge);

    window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// --- FUNCTIA DE OBȚINERE TOKEN (Exportabilă) ---

export async function exchangeCodeForToken(code) {
    const codeVerifier = localStorage.getItem('code_verifier');
    
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('code_verifier', codeVerifier);

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
    });

    if (!response.ok) {
        throw new Error(`Autentificare eșuată. Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Salvăm token-ul de acces și de refresh (pentru reînnoire)
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.removeItem('code_verifier'); // Curățare

    return data.access_token;
}