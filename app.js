// Preluare token din URL
const fragment = window.location.hash.substring(1);
const params = fragment.split('&').reduce((acc, item) => {
    const parts = item.split('=');
    if(parts.length === 2) acc.set(parts[0], decodeURIComponent(parts[1]));
    return acc;
}, new Map());

const access_token = params.get('access_token');

if(!access_token){
    document.querySelector('h1').innerText = "Eroare la autentificare! Verifică consola.";
    console.error("Nu s-a preluat token-ul:", fragment);
} else {
    document.querySelector('h1').innerText = "Autentificare reușită!";
    document.getElementById('profile').classList.remove('hidden');
    initApp();
}

// Funcție principală
function initApp(){
    fetchUserProfile();
    fetchTopAlbums();
    fetchTopArtists();
    setupSearch();
}

// --- User Profile ---
function fetchUserProfile(){
    fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': 'Bearer ' + access_token }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('username').innerText = data.display_name;
        document.getElementById('email').innerText = data.email;
        if(data.images.length > 0) document.getElementById('profile-pic').src = data.images[0].url;
    });
}

// --- Top 5 Albums ---
function fetchTopAlbums(){
    fetch('https://api.spotify.com/v1/me/top/albums?limit=5', {
        headers: { 'Authorization': 'Bearer ' + access_token }
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('top-albums');
        container.innerHTML = '';
        data.items.forEach(album => {
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `
                <img src="${album.images[0]?.url}" width="100">
                <p>${album.name}</p>
                <p>${album.artists.map(a => a.name).join(', ')}</p>
            `;
            container.appendChild(div);
        });
    });
}

// --- Top 5 Artists ---
function fetchTopArtists(){
    fetch('https://api.spotify.com/v1/me/top/artists?limit=5', {
        headers: { 'Authorization': 'Bearer ' + access_token }
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('top-artists');
        container.innerHTML = '';
        data.items.forEach(artist => {
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `
                <img src="${artist.images[0]?.url}" width="100">
                <p>${artist.name}</p>
                <p>${artist.genres.join(', ')}</p>
            `;
            container.appendChild(div);
        });
    });
}

// --- Search ---
function setupSearch(){
    const input = document.getElementById('search');
    let timeout = null;

    input.addEventListener('input', function(){
        clearTimeout(timeout);
        const query = this.value;
        if(!query) return;

        timeout = setTimeout(() => {
            fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,album,artist&limit=5`, {
                headers: { 'Authorization': 'Bearer ' + access_token }
            })
            .then(res => res.json())
            .then(data => {
                const container = document.getElementById('search-results');
                container.innerHTML = '';

                data.tracks?.items.forEach(track => {
                    const div = document.createElement('div');
                    div.className = 'card';
                    div.innerText = `🎵 ${track.name} - ${track.artists.map(a=>a.name).join(', ')}`;
                    container.appendChild(div);
                });

                data.albums?.items.forEach(album => {
                    const div = document.createElement('div');
                    div.className = 'card';
                    div.innerText = `💿 ${album.name} - ${album.artists.map(a=>a.name).join(', ')}`;
                    container.appendChild(div);
                });

                data.artists?.items.forEach(artist => {
                    const div = document.createElement('div');
                    div.className = 'card';
                    div.innerText = `🎤 ${artist.name}`;
                    container.appendChild(div);
                });
            });
        }, 300); // debounce
    });
}
