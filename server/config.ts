export const config = {
  // Read API key from environment variables. Do NOT hardcode secrets in source.
  // For local dev you can set OPENAI_API_KEY in your shell or in .env.development (this file should be gitignored).
  openaiApiKey: process.env.OPENAI_API_KEY ?? process.env.VITE_OPENAI_API_KEY ?? "",
};
