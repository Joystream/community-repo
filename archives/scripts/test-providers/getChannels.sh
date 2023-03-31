
set -e
curl 'https://ipfs.joystreamstats.live/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: https://ipfs.joystreamstats.live' --data-binary '{"query":"query { channels {  \n  id  language{iso} title description videos { description media {size} id language{iso}  } \n}}"}' --compressed > channels.json
echo Wrote channels.json
