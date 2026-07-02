# AI Chatbot - Quick Start

## Installation (3 Steps)

### 1. Install Dependencies
```bash
# Inside your container
./brian.sh start
podman exec -it brian npm install openai @anthropic-ai/sdk
```

### 2. Add API Keys
```bash
# Copy template
cp .env.local.example .env.local

# Edit and add your keys
# Get keys from:
# - OpenAI: https://platform.openai.com/api-keys
# - Anthropic: https://console.anthropic.com/settings/keys
```

### 3. Restart Server
```bash
./brian.sh restart
# Visit http://localhost:1234
```

## What You Get

- **Floating chat button** (bottom-right corner)
- **AI assistant** trained on your profile and projects
- **OpenAI primary**, Claude fallback
- **Rate limiting**: 10 messages/hour per IP
- **Persistent chat history**
- **macOS-style design**

## Test Questions

1. "What did Brian do at LANL?"
2. "Tell me about the HPC cluster project"
3. "What are Brian's technical skills?"
4. "Show me distributed systems projects"

## Files Created

```
src/app/api/chat/route.ts           # API endpoint (server-side)
src/components/chatbot/
  ├── ChatButton.tsx                # Floating button
  ├── ChatWindow.tsx                # Chat UI
  └── ChatMessage.tsx               # Message bubbles
.env.local.example                  # API key template
CHATBOT_README.md                   # Full documentation
```

## Need Help?

See `CHATBOT_README.md` for:
- Detailed setup instructions
- Customization options
- Troubleshooting guide
- API cost estimates
- Security features

## Next Steps

1. Install dependencies
2. Add API keys (at least one)
3. Restart server
4. Click chat button to test
5. Customize suggested questions in `ChatWindow.tsx`
6. Update system prompt in `route.ts` as your projects evolve
