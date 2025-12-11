import { getUserProfile, getTopArtists } from "./api.js";

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
      <div id="output"></div>
      <br>
      <button id="logout">Logout</button>
    `;

    document.getElementById("artists").onclick = async () => {
      const data = await getTopArtists();
      document.getElementById("output").innerHTML = "<h3>Artiștii tăi preferați:</h3>" + 
        data.items.map(a => `<p>🎵 ${a.name}</p>`).join("");
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
