const client_id = "13ff8254c56d4ad2910cee29e3c4d1aa"; 
const redirect_uri = "https://simona185.github.io/MiniSpotify/callback.html";

document.getElementById("login").onclick = () => {
  const scope = "user-read-private user-top-read";
  const auth_url = `https://accounts.spotify.com/authorize?response_type=token&client_id=${client_id}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
  window.location = auth_url;
};
