# Notes

## Crucial Edits to be made when adding a new Podcast Source:
- Change `getUrlOrTitle()` to check for new added source URL in `/app/podcasts/page.tsx`

## Schema:
- Follows a custom schema for easy API calls

- For Episode data request, the url is appended with episode:
        - ex: episode:https://example.com
        - used: n8n -> Frontend (/podcasts)