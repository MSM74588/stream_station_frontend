# Stream Station Frontend

### Notes:
- Why `Favourites` is saved manually?:
-> So it will work even when the server is offline, So things like Spotify Songs that are fetched to the db and saved can be favourited and MPD songs can be favourited even when it is offline.
-> But issue is, when the images are saved to pocketbase, how will the server access it? it will need another URL then.