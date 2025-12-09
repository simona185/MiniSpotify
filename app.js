const fragment = window.location.hash.substring(1);

const params = fragment.split('&').reduce((accumulator, currentValue) => {
    const parts = currentValue.split('=');
    if (parts.length === 2) { 
        accumulator.set(parts[0], decodeURIComponent(parts[1]));
    }
    return accumulator;
}, new Map());

const access_token = params.get('access_token');

if(access_token){
    console.log("Token Spotify preluat CU SUCCES:", access_token);
    document.querySelector('h1').innerText = "Autentificare Reușită!";
} else {
    console.error("EROARE: Nu s-a putut prelua token-ul. Fragment URL primit:", fragment);
    document.querySelector('h1').innerText = "Eroare la Autentificare - Verifică consola.";
}