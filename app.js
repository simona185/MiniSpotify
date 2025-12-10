// app.js

// Functie helper pentru a face apeluri API
async function spotifyFetch(endpoint, token) {
    const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.status === 401) {
        // Token expirat/invalid: Curățăm și forțăm re-login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = 'index.html'; 
        throw new Error("Token expirat. Vă rugăm să vă autentificați din nou.");
    }

    if (!response.ok) {
        throw new Error(`Eroare HTTP: ${response.status}`);
    }
    
    return response.json();
}

// --- Functiile tale originale de fetch, modificate pentru a primi tokenul ---

export async function fetchUserProfile(token){
    const data = await spotifyFetch('me', token);
    document.getElementById('username').innerText = data.display_name;
    document.getElementById('email').innerText = data.email;
    if(data.images.length > 0) document.getElementById('profile-pic').src = data.images[0].url;
}

export async function fetchTopAlbums(token){
    // Nota: Spotify nu are Top Albums, ci Top Tracks. Vom folosi Top Tracks aici:
    const data = await spotifyFetch('me/top/tracks?limit=5', token);
    const container = document.getElementById('top-albums');
    container.innerHTML = '';
    
    // Afișăm titlul piesei și numele albumului (ca un compromis pentru "Top Albums")
    data.items.forEach(track => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <img src="${track.album.images[0]?.url}" width="100">
            <p><strong>${track.name}</strong></p>
            <p>${track.album.name}</p>
        `;
        container.appendChild(div);
    });
}

export async function fetchTopArtists(token){
    const data = await spotifyFetch('me/top/artists?limit=5', token);
    const container = document.getElementById('top-artists');
    container.innerHTML = '';
    
    data.items.forEach(artist => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <img src="${artist.images[0]?.url}" width="100">
            <p><strong>${artist.name}</strong></p>
            <p>${artist.genres.join(', ')}</p>
        `;
        container.appendChild(div);
    });
}

// Functia de cautare (modificata pentru a folosi spotifyFetch)
let searchTimeout = null;
export function setupSearch(token){
    const input = document.getElementById('search');
    const container = document.getElementById('search-results');

    input.addEventListener('input', function(){
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        if(!query) {
            container.innerHTML = '';
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                const data = await spotifyFetch(`search?q=${encodeURIComponent(query)}&type=track,album,artist&limit=10`, token);
                container.innerHTML = '';
                
                // Preluare și randare rezultate (piese, albume, artiști) - poți păstra logica ta de randare aici
                data.tracks?.items.forEach(track => { /* ... randare ... */ });
                data.albums?.items.forEach(album => { /* ... randare ... */ });
                data.artists?.items.forEach(artist => { /* ... randare ... */ });

                // Exemplu randare:
                data.tracks?.items.slice(0, 5).forEach(track => {
                    const div = document.createElement('div');
                    div.className = 'card';
                    div.innerText = `🎵 ${track.name} - ${track.artists.map(a=>a.name).join(', ')}`;
                    container.appendChild(div);
                });


            } catch (error) {
                console.error("Eroare la căutare:", error);
            }
        }, 300); 
    });
}

// --- FUNCTIA DE INIȚIALIZARE PRINCIPALĂ ---
export function initApp(token){
    fetchUserProfile(token);
    fetchTopAlbums(token);
    fetchTopArtists(token);
    setupSearch(token);
}