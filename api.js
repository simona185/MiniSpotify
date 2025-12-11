export function getToken() {
  return sessionStorage.getItem("access_token");
}

export async function getUserProfile() {
  const token = getToken();
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getTopArtists(limit = 5) {
  const token = getToken();
  const res = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function searchSpotify(query) {
  const token = getToken();
  const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist,album&limit=10`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}
