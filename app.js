import { getUserProfile, getTopArtists, getSavedAlbums } from "./api.js";

window.onload = async () => {
  // Verifică dacă există token
  const token = sessionStorage.getItem("access_token");
  if (!token) {
    alert("Nu ești autentificat. Te redirectăm la pagina de login.");
    window.location = "/index.html";
    return;
  }

  try {
    const profile = await getUserProfile();
    document.getElementById("app-container").innerHTML = `
      <h2>Hello, ${profile.display_name}!</h2>
      <img src="${profile.images?.[0]?.url}" width="120" style="border-radius: 50%;">
      <p>Email: ${profile.email}</p>
      <button id="artists">Vezi Top 5 Artiști</button>
      <button id="albums" style="margin-left:10px;">Vezi Top 5 Albume</button>
      <div id="output-artists" style="margin-top:15px;"></div>
      <div id="output-albums" style="margin-top:15px;"></div>
      <br>
      <button id="logout">Logout</button>
    `;

    document.getElementById("artists").onclick = async () => {
      const data = await getTopArtists();
      document.getElementById("output-artists").innerHTML = "<h3>Artiștii tăi preferați:</h3>" + 
        data.items.map(a => `<p>🎵 ${a.name}</p>`).join("");
    };

    document.getElementById("albums").onclick = async () => {
      const data = await getSavedAlbums();
      const items = data.items || [];
      document.getElementById("output-albums").innerHTML = "<h3>Albumele tale salvate:</h3>" +
        items.map(entry => {
          const album = entry.album;
          const cover = album.images?.[0]?.url ? `<img src="${album.images[0].url}" width="80" style="border-radius:8px; vertical-align:middle; margin-right:10px;">` : "";
          const artists = album.artists?.map(a => a.name).join(", ") || "Artist necunoscut";
          return `<p>${cover}<strong>${album.name}</strong> – ${artists}</p>`;
        }).join("");
    };

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
