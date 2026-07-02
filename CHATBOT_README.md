# AI Chatbot - Setup & Usage Guide

## Overview

Your portfolio now includes an AI-powered chatbot that can answer questions about your experience, projects, and skills. It uses OpenAI's GPT-4 as the primary provider and falls back to Anthropic's Claude if OpenAI fails.

## Features

- **Floating button** in the bottom-right corner on all screen sizes
- **Smart AI responses** using GPT-4o-mini (OpenAI) or Claude 3.5 Sonnet (Anthropic)
- **Suggested questions** for first-time visitors
- **Chat history** persisted in localStorage
- **Rate limiting** (10 messages per hour per IP)
- **macOS-styled UI** matching your existing design system
- **Typing indicators** and error handling
- **Clear chat** functionality

## Installation

### 1. Install Dependencies

From inside your container:

```bash
npm install openai @anthropic-ai/sdk
```

Or using the brian.sh script:

```bash
./brian.sh start
podman exec -it brian npm install openai @anthropic-ai/sdk
```

### 2. Configure API Keys

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Get your API keys:
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Anthropic**: https://console.anthropic.com/settings/keys

3. Edit `.env.local` and add your keys:
   ```bash
   OPENAI_API_KEY=sk-your-actual-openai-key
   ANTHROPIC_API_KEY=sk-ant-your-actual-anthropic-key
   ```

   **Note**: You need at least one API key. OpenAI is tried first, then Claude as fallback.

### 3. Restart Development Server

```bash
# If using container
./brian.sh restart

# Or manually
npm run dev
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API endpoint (server-side)
│   └── page.tsx                   # Added ChatButton
├── components/
│   └── chatbot/
│       ├── ChatButton.tsx         # Floating button
│       ├── ChatWindow.tsx         # Chat interface
│       └── ChatMessage.tsx        # Message component
.env.local.example                 # Template for API keys
```

## Testing

### Test Questions

Try these questions to verify the chatbot works:

1. "What did Brian do at LANL?"
2. "Tell me about the HPC cluster project"
3. "What are Brian's main technical skills?"
4. "Show me projects related to distributed systems"
5. "What is Brian's educational background?"
6. "Explain the cognitive load tracker project"

### Expected Behavior

- **First message**: Should respond within 2-3 seconds
- **OpenAI failure**: Automatically tries Claude
- **Rate limit**: After 10 messages in 1 hour, shows error
- **Persistent history**: Messages saved to localStorage
- **Clear chat**: Removes all messages and history

## Security Features

### Rate Limiting
- **10 messages per hour** per IP address
- Prevents API abuse and excessive costs
- Returns 429 status when exceeded

### API Key Protection
- Keys stored in `.env.local` (server-side only)
- Never exposed to client browser
- API routes run on Next.js server

### Request Validation
- Checks for valid message format
- Limits response tokens (500 max)
- Proper error handling

## Customization

### Change Rate Limits

Edit `src/app/api/chat/route.ts`:

```typescript
const MAX_REQUESTS_PER_WINDOW = 20; // Change to 20
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour
```

### Update System Prompt

The AI's knowledge is defined in `src/app/api/chat/route.ts` in the `SYSTEM_PROMPT` constant. It includes:
- Your profile from `src/data/profile.ts`
- All projects from `src/data/projects/*.json`
- Instructions for tone and behavior

To update the chatbot's knowledge:
1. Edit your profile/project data files
2. Update the `SYSTEM_PROMPT` in the API route
3. Restart the dev server

### Suggested Questions

Edit `src/components/chatbot/ChatWindow.tsx`:

```typescript
const SUGGESTED_QUESTIONS = [
  "Your question 1",
  "Your question 2",
  // Add more...
];
```

### Styling

The chatbot uses CSS variables from `globals.css`:
- `--window-bg` - Window background
- `--window-border` - Border color
- `--foreground` - Text color
- `--title-bar-bg` - Title bar background

Automatically supports light/dark mode.

## Troubleshooting

### Chatbot button doesn't appear
- Check browser console for errors
- Verify `ChatButton` is imported in `page.tsx`
- Restart dev server

### "Failed to generate response" error
- Check API keys in `.env.local`
- Verify keys are valid and have credits
- Check console logs for detailed errors

### Rate limit too strict
- Increase `MAX_REQUESTS_PER_WINDOW`
- Or decrease `RATE_LIMIT_WINDOW_MS`
- Restart server after changes

### Messages not persisting
- Check browser localStorage is enabled
- Try different browser
- Clear localStorage: `localStorage.clear()`

### OpenAI not working
- Chatbot should automatically fall back to Claude
- Check API key is correct
- Verify you have API credits

## API Costs

### OpenAI GPT-4o-mini
- **Input**: ~$0.15 per 1M tokens
- **Output**: ~$0.60 per 1M tokens
- **Estimate**: ~$0.001 per conversation (10 messages)

### Anthropic Claude 3.5 Sonnet
- **Input**: ~$3.00 per 1M tokens
- **Output**: ~$15.00 per 1M tokens
- **Estimate**: ~$0.01 per conversation (10 messages)

With rate limiting at 10 messages/hour per user, costs should be minimal.

## Production Deployment

### Environment Variables

Set in your hosting platform (Vercel, Netlify, etc.):
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

### Rate Limiting

Current implementation uses in-memory storage. For production:
- Use Redis or similar for distributed rate limiting
- Or implement database-backed tracking

### Monitoring

Consider adding:
- API usage tracking
- Error logging (Sentry, LogRocket)
- Analytics (which questions are most common)

## Future Enhancements

Possible improvements:
- Streaming responses for faster perceived speed
- Voice input/output
- Project deep-linking (click to open project)
- Multi-language support
- Analytics dashboard
- Conversation export

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify API keys are set correctly
3. Check server logs (if deployed)
4. Test with both OpenAI and Claude keys

---

Built with Next.js 16, OpenAI API, and Anthropic API.
