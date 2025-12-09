const client_id = "13ff8254c56d4ad2910cee29e3c4d1aa"; 
const redirect_uri = "https://simona185.github.io/MiniSpotify/callback.html";

document.getElementById("login").onclick = () => {
    const scope = "user-read-private user-top-read";
    
    const state = generateRandomString(16); 
    
    const auth_url = new URL("https://accounts.spotify.com/authorize");

    auth_url.searchParams.append("client_id", client_id);
    auth_url.searchParams.append("response_type", "token");
    auth_url.searchParams.append("scope", scope);
    auth_url.searchParams.append("redirect_uri", redirect_uri);
    auth_url.searchParams.append("state", state);

    window.location = auth_url.toString();
};

function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}