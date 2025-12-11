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
  if (!query || query.trim().length < 2) {
    return { tracks: { items: [] }, artists: { items: [] }, albums: { items: [] } };
  }
  
  const token = getToken();
  const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist,album&limit=10`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getSavedAlbums(limit = 5) {
  const token = getToken();
  const res = await fetch(`https://api.spotify.com/v1/me/albums?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getAlbumTracks(albumId) {
  const token = getToken();
  const res = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function playTrack(deviceId, trackUri) {
  const token = getToken();
  const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: "PUT",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ uris: [trackUri] })
  });
  return res.status === 204;
}

export async function pauseTrack(deviceId) {
  const token = getToken();
  const res = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.status === 204;
}

export async function transferPlayback(deviceId, shouldPlay = false) {
  const token = getToken();
  const res = await fetch("https://api.spotify.com/v1/me/player", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ device_ids: [deviceId], play: shouldPlay })
  });
  return res.status === 204;
}