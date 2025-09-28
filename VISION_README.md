## Vision Ingredient Extraction

This project supports uploading a fridge / pantry image and extracting ingredient names using Google Gemini.

### Endpoint
POST `/api/vision/ingredients`

Form-data field:
 - `image`: binary image file (jpeg/png/webp). Recommended < 5 MB.

### Response
```
{ "model": "gemini-2.5-flash", "ingredients": ["tomato", "spinach", ...], "rawText": "..." }
```
If detection fails: `{ model: "gemini-2.5-flash", ingredients: [], error: "vision-error" }`.

### Environment
Set `GEMINI_API_KEY` in your environment (e.g. `.env` or Netlify dashboard). Without a key the endpoint returns an empty list and `missing api key` error.

### Client Flow
1. User clicks camera icon in header.
2. File uploads via `fetch` with multipart form.
3. On success an event `vision-ingredients-detected` fires with `{ ingredients }`.
4. Ingredients are added to grocery bag; a toast lists them; the bag auto-opens.

### Implementation Notes
- Uses `multer` (lazy-loaded) with memory storage. For large images consider resizing client-side before upload.
- Model prompt requests a pure JSON array; fallback parser tries to extract first JSON array.
- Max 40 ingredients kept after normalization/deduplication.

### Future Enhancements
- Confidence scores (ask model for objects with { name, confidence }).
- Add server-side caching by hashing image buffer (e.g. SHA-256).
- Rate limiting to protect API key usage.
- Drag & drop / paste-from-clipboard support.

---
Last updated: current implementation iteration.