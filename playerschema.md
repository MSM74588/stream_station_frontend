# Player Schema
- These Schema have to be prefixed to the url for parsing by n8n middleware instance and perform the specifc tasks:
```md
- playnow:
- playnext:
- playclearqueue:
```

playnow: — Immediately plays the specified media, interrupting any currently playing content.

- `playnow:https://example.com/`

playnext: — Adds the specified media to play immediately after the current track.

- `playnext:https://example.com/media`

playclearqueue: — Clears the current queue, then plays the specified media.

- `playclearqueue:https://example.com/media`