# Vercel Deployment Guide - FINAL STEPS

## ✅ Everything is Ready!

I've prepared everything for deployment:
- ✅ Code pushed to GitHub with chatbot + terminal
- ✅ Dependencies installed (openai, @anthropic-ai/sdk)
- ✅ Vercel CLI installed on kn-head

---

## 🚀 Deploy to Vercel (You Need To Do This Part)

Vercel requires interactive login. **SSH to kn-head and run these commands:**

### Step 1: SSH to kn-head
```bash
ssh bhead
cd /home/brian/brian/brianhsu-portfolio
```

### Step 2: Login to Vercel
```bash
vercel login
```

You'll see:
```
Vercel CLI 37.x.x
? Log in to Vercel
  ❯ Continue with GitHub
    Continue with GitLab
    Continue with Bitbucket
    Continue with Email
```

**Choose: "Continue with GitHub"**

It will give you a URL like:
```
> Ready! Verification code: XXXX-XXXX
> Open this URL: https://vercel.com/confirm?token=...
```

1. Copy the URL
2. Open in your browser
3. Login with your GitHub account (briah1212)
4. Authorize Vercel

---

### Step 3: Deploy
```bash
vercel --prod
```

**Answer the prompts:**

```
? Set up and deploy "~/brian/brianhsu-portfolio"? [Y/n] y
? Which scope? Your Name
? Link to existing project? [y/N] n
? What's your project's name? brianhsu-portfolio
? In which directory is your code located? ./
```

**Auto-detected settings (just press Enter):**
```
Auto-detected Project Settings (Next.js):
- Build Command: `next build` or `build`
- Development Command: next dev --port $PORT
- Install Command: `yarn install`, `pnpm install`, or `npm install`
- Output Directory: Next.js default
? Want to override the settings? [y/N] n
```

Vercel will now:
1. Upload your code
2. Build the Next.js app
3. Deploy to production
4. Give you a URL

---

### Step 4: Add API Keys

After deployment completes, you'll see:
```
✅ Production: https://brianhsu-portfolio-xxx.vercel.app
```

Now add your API keys:

```bash
# Add OpenAI key
vercel env add OPENAI_API_KEY production
# Paste your key when prompted: sk-proj-...

# Add Anthropic key
vercel env add ANTHROPIC_API_KEY production
# Paste your key when prompted: sk-ant-...
```

---

### Step 5: Redeploy with Keys
```bash
vercel --prod
```

This redeploys with the environment variables.

---

### Step 6: Connect Custom Domain (brianhsu.info)

```bash
vercel domains add brianhsu.info
```

**It will show DNS records you need to add:**

Go to your domain registrar (where you bought brianhsu.info):
1. Add A record: `@` → `76.76.21.21`
2. Add CNAME record: `www` → `cname.vercel-dns.com`

**Wait 5-10 minutes for DNS propagation**, then:

```bash
vercel domains ls
```

Should show:
```
✅ brianhsu.info (configured)
```

---

## 🎯 Final Result

Your portfolio will be live at:
- **Production URL**: `https://brianhsu-portfolio-xxx.vercel.app` (instant)
- **Custom Domain**: `https://brianhsu.info` (after DNS propagates)
- **HTTPS**: Automatic SSL certificate
- **Chatbot**: Working with AI responses
- **Terminal**: Enhanced filesystem navigation

---

## 🔑 Where to Get API Keys

### OpenAI:
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-proj-...`)
4. **IMPORTANT**: Save it somewhere - you can't see it again!

### Anthropic Claude:
1. Go to: https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Copy the key (starts with `sk-ant-...`)
4. Save it somewhere safe

---

## 💰 Cost Estimate

With chatbot rate limiting (10 msg/hour):
- **OpenAI**: ~$0.10/month for normal traffic
- **Anthropic**: Backup only, minimal cost
- **Vercel**: Free (Hobby tier)
- **Domain**: Already own brianhsu.info

**Total: ~$0.10/month**

---

## 🧪 Test After Deployment

1. Visit your Vercel URL
2. Click floating chat button (bottom-right)
3. Ask: "What did Brian do at LANL?"
4. Open Terminal, try: `cd /portfolio/work` then `ls`

---

## 🐛 Troubleshooting

### "Chatbot says 'Failed to generate response'"
```bash
# Check env vars are set
vercel env ls

# Should show:
# OPENAI_API_KEY (Production)
# ANTHROPIC_API_KEY (Production)
```

### "Domain not working"
- Wait 10 minutes for DNS propagation
- Check DNS: `dig brianhsu.info`
- Verify in Vercel dashboard: https://vercel.com/dashboard

### "Build failed"
```bash
# Check logs
vercel logs

# Try local build first
npm run build
```

---

## 📊 Vercel Dashboard

After deployment, manage everything at:
**https://vercel.com/dashboard**

You can:
- See deployment logs
- Add/edit environment variables
- View analytics
- Manage domains
- Roll back deployments

---

## ✅ Quick Checklist

- [ ] SSH to kn-head
- [ ] Run `vercel login` and authenticate
- [ ] Run `vercel --prod` and answer prompts
- [ ] Get OpenAI API key from platform.openai.com
- [ ] Get Anthropic API key from console.anthropic.com
- [ ] Run `vercel env add OPENAI_API_KEY production`
- [ ] Run `vercel env add ANTHROPIC_API_KEY production`
- [ ] Run `vercel --prod` again
- [ ] Run `vercel domains add brianhsu.info`
- [ ] Add DNS records at your registrar
- [ ] Test at brianhsu.info after DNS propagates

---

**That's it!** Your portfolio will be live with chatbot + enhanced terminal. 🚀
