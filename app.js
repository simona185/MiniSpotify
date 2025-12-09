const hash = window.location.hash.substring(1);
const params = new URLSearchParams(hash);
const access_token = params.get('access_token');

if(access_token){
  console.log("Token Spotify:", access_token);
}
