import { getUserProfile, getTopArtists, getSavedAlbums, searchSpotify, playTrack, pauseTrack } from "./api.js";

let searchTimeout;
let currentDeviceId = null;
let player = null;

// Inițializează playerul ÎNAINTE de window.onload
function initSpotifyPlayer(token) {
  return new Promise((resolve) => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      player = new Spotify.Player({
        name: "MiniSpotify Player",
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      // Ascultă schimbări de stare
      player.addListener('player_state_changed', state => {
        if (state && state.device_id) {
          currentDeviceId = state.device_id;
          console.log('Device ID setat:', currentDeviceId);
        }
      });

      player.addListener('initialization_error', ({ message }) => {
        console.error('Initialization error:', message);
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error('Authentication error:', message);
      });

      player.addListener('account_error', ({ message }) => {
        console.error('Account error:', message);
      });

      // Conectează playerul
      player.connect().then(success => {
        if (success) {
          console.log('✅ Spotify Player conectat cu succes!');
          resolve(true);
        } else {
          console.error('❌ Nu s-a putut conecta playerul');
          resolve(false);
        }
      });
    };

    // Forțează reinitializarea SDK-ului
    if (window.Spotify && window.Spotify.Player) {
      window.onSpotifyWebPlaybackSDKReady();
    }
  });
}

window.onload = async () => {
  const token = sessionStorage.getItem("access_token");
  if (!token) {
    alert("Nu ești autentificat. Te redirectăm la pagina de login.");
    window.location = "/index.html";
    return;
  }

  // Inițializează playerul mai întâi
  await initSpotifyPlayer(token);

  // Asteaptă puțin pentru ca deviceID să se seteze
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    const profile = await getUserProfile();
    const profileImage = profile.images?.[0]?.url || "https://via.placeholder.com/120?text=Profil";
    
    document.getElementById("app-container").innerHTML = `
      <div class="profile-section">
        <h2>Hello, ${profile.display_name}!</h2>
        <img src="${profileImage}" width="120" alt="Profile">
        <p>Email: ${profile.email}</p>
      </div>
      <div class="button-group">
        <button id="search-btn">🔍 Caută</button>
        <button id="artists">🎵 Top 5 Artiști</button>
        <button id="albums">💿 Top 5 Albume</button>
        <button id="logout">Logout</button>
      </div>
      <div id="output-artists"></div>
      <div id="output-albums"></div>
    `;

    // Search functionality
    document.getElementById("search-btn").onclick = () => {
      document.getElementById("search-modal").style.display = "block";
      document.getElementById("search-input").focus();
    };

    document.getElementById("close-search").onclick = () => {
      document.getElementById("search-modal").style.display = "none";
    };

    document.getElementById("search-input").oninput = async (e) => {
      const query = e.target.value.trim();
      clearTimeout(searchTimeout);

      if (query.length < 2) {
        document.getElementById("search-results").innerHTML = "<p style='color:#999;'>Scrie cel puțin 2 caractere...</p>";
        return;
      }

      document.getElementById("search-results").innerHTML = "<p style='color:#999;'>Se caută...</p>";

      searchTimeout = setTimeout(async () => {
        try {
          const results = await searchSpotify(query);
          displaySearchResults(results);
        } catch (error) {
          console.error("Eroare la căutare:", error);
          document.getElementById("search-results").innerHTML = "<p style='color:#ff6b6b;'>Eroare la căutare</p>";
        }
      }, 300);
    };

    // Top Artists
    document.getElementById("artists").onclick = async () => {
      const data = await getTopArtists();
      const artistCards = data.items.map(artist => {
        const image = artist.images?.[0]?.url || "https://via.placeholder.com/160?text=Artist";
        const followers = artist.followers?.total?.toLocaleString('ro-RO') || '0';
        const spotifyUrl = artist.external_urls?.spotify || '#';
        return `
          <div class="artist-card">
            <img src="${image}" alt="${artist.name}">
            <h4>${artist.name}</h4>
            <p class="artist-followers">👥 ${followers} urmăritori</p>
            <button onclick="window.open('${spotifyUrl}', '_blank')">🎵 Ascultă pe Spotify</button>
          </div>
        `;
      }).join("");
      document.getElementById("output-artists").innerHTML = `
        <h3 class="section-title">🎵 Artiștii tăi preferați</h3>
        <div class="artists-grid">${artistCards}</div>
      `;
    };

    // Top Albums
    document.getElementById("albums").onclick = async () => {
      const data = await getSavedAlbums();
      const items = data.items || [];
      const albumsList = items.map(entry => {
        const album = entry.album;
        const cover = album.images?.[0]?.url || "https://via.placeholder.com/80?text=Album";
        const artists = album.artists?.map(a => a.name).join(", ") || "Artist necunoscut";
        return `
          <div class="album-item">
            <img src="${cover}" width="80" alt="${album.name}">
            <div>
              <strong>${album.name}</strong><br>
              <span style="color:#b3b3b3;">${artists}</span>
            </div>
          </div>
        `;
      }).join("");
      document.getElementById("output-albums").innerHTML = `
        <h3 class="section-title">💿 Albumele tale salvate</h3>
        <div class="albums-list">${albumsList}</div>
      `;
    };

    // Logout
    document.getElementById("logout").onclick = () => {
      sessionStorage.removeItem("access_token");
      window.location = "/index.html";
    };

  } catch (error) {
    console.error("Eroare la încărcarea profilului:", error);
    alert("Eroare la încărcarea datelor. Te rog autentifică-te din nou.");
    sessionStorage.removeItem("access_token");
    window.location = "/index.html";
  }
};

function displaySearchResults(results) {
  let html = "";

  // Songs
  if (results.tracks?.items?.length > 0) {
    html += "<h3 style='color:#1DB954; margin-top:15px;'>🎵 Piese:</h3>";
    html += results.tracks.items.map(track => {
      const image = track.album?.images?.[0]?.url ? `<img src="${track.album.images[0].url}" width="50" style="border-radius:5px; margin-right:10px;">` : "";
      const artists = track.artists?.map(a => a.name).join(", ") || "Artist necunoscut";
      const spotifyUrl = track.external_urls?.spotify || "#";
      return `
        <div style='display:flex; align-items:center; padding:10px; border-radius:5px; background:#222; margin:5px 0; justify-content:space-between;'>
          <div style='display:flex; align-items:center; flex:1;'>
            ${image}
            <div>
              <strong>${track.name}</strong><br>
              <small style='color:#999;'>${artists}</small>
            </div>
          </div>
          <a href="${spotifyUrl}" target="_blank" style="background:#1DB954; color:#000; padding:8px 15px; border-radius:50%; width:45px; height:45px; display:flex; align-items:center; justify-content:center; text-decoration:none; font-weight:bold;">▶</a>
        </div>
      `;
    }).join("");
  }

  // Artists
  if (results.artists?.items?.length > 0) {
    html += "<h3 style='color:#1DB954; margin-top:15px;'>👤 Artiști:</h3>";
    html += results.artists.items.map(artist => {
      const image = artist.images?.[0]?.url ? `<img src="${artist.images[0].url}" width="50" style="border-radius:50%; margin-right:10px;">` : "";
      return `<p style='display:flex; align-items:center; padding:8px; border-radius:5px; background:#222; margin:5px 0;'>${image}<span><strong>${artist.name}</strong><br><small style='color:#999;'>${artist.followers?.total?.toLocaleString() || 0} followers</small></span></p>`;
    }).join("");
  }

  // Albums
  if (results.albums?.items?.length > 0) {
    html += "<h3 style='color:#1DB954; margin-top:15px;'>💿 Albume:</h3>";
    html += results.albums.items.map(album => {
      const image = album.images?.[0]?.url ? `<img src="${album.images[0].url}" width="50" style="border-radius:5px; margin-right:10px;">` : "";
      const artists = album.artists?.map(a => a.name).join(", ") || "Artist necunoscut";
      return `<p style='display:flex; align-items:center; padding:8px; border-radius:5px; background:#222; margin:5px 0;'>${image}<span><strong>${album.name}</strong><br><small style='color:#999;'>${artists}</small></span></p>`;
    }).join("");
  }

  document.getElementById("search-results").innerHTML = html || "<p style='color:#999;'>Niciun rezultat găsit</p>";

  // Attach play handlers
  document.querySelectorAll(".play-track-btn").forEach(btn => {
    btn.onclick = async () => {
      const trackUri = btn.getAttribute("data-uri");
      const trackName = btn.getAttribute("data-name");
      const trackArtist = btn.getAttribute("data-artist");
      const trackImage = btn.getAttribute("data-image");

      if (!currentDeviceId) {
        alert("⚠️ Player nu este conectat. Asteaptă un moment...\n\nVERIFICĂ:\n1. Ai Spotify Premium?\n2. Spotify este deschis pe alt dispozitiv?\n3. Reîncarcă pagina");
        return;
      }

      btn.textContent = "⏳";
      btn.disabled = true;

      try {
        const success = await playTrack(currentDeviceId, trackUri);
        if (success) {
          document.getElementById("player-bar").style.display = "block";
          document.getElementById("current-track-name").textContent = trackName;
          document.getElementById("current-track-artist").textContent = trackArtist;
          document.getElementById("current-track-image").src = trackImage;
        } else {
          alert("❌ Eroare la redare. Verifică dacă ai Spotify Premium!");
        }
      } catch (error) {
        console.error("Eroare:", error);
        alert("❌ Eroare: " + error.message);
      } finally {
        btn.textContent = "▶";
        btn.disabled = false;
      }
    };
  });
}

// Player controls
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("play-btn").onclick = async () => {
    if (currentDeviceId && player) {
      player.resume().then(() => {
        console.log('▶ Redat');
      });
    }
  };

  document.getElementById("pause-btn").onclick = async () => {
    if (currentDeviceId && player) {
      player.pause().then(() => {
        console.log('⏸ Pus pe pauză');
      });
    }
  };

  document.getElementById("close-player").onclick = () => {
    document.getElementById("player-bar").style.display = "none";
  };
});