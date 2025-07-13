# 🧠 Meet AI – Your Intelligent Meeting Assistant
**Click on the thumbnail to see the video of project demonstration**

[![Project Demonstration Video](https://ik.imagekit.io/lt17u3pfu/college-projects/Screenshot%20From%202025-07-13%2016-47-08.png?updatedAt=1752405462939)](https://ik.imagekit.io/lt17u3pfu/college-projects/VN20250709_154945.mp4?updatedAt=1752405161462)

🚨 **Note:** This project currently won't function unless valid API keys are provided for services like OpenAI, Stream, Google, etc. (your personal keys may be expired or usage-limited).

---


## 🚀 Overview

**Meet AI** is your AI-powered video call assistant that can join meetings, answer questions in real-time, and provide post-meeting summaries, transcripts, and recordings.

Whether you're running client calls, team standups, or casual catch-ups — let AI handle the heavy lifting so you can focus on the conversation.

---

## ✨ Features

- 🎙️ **Create AI Agents:** Customize your agent’s personality and expertise.
- 📅 **Schedule Meetings:** Assign AI agents to meetings and track upcoming ones.
- 🎥 **Live AI Assistant:** Join calls and interact with AI in real-time.
- ⚙️ **Post-Meeting Workflow:** Auto-summary, transcript, and insights generation using background jobs (Inngest).
- 📊 **Insight Tabs:** View summaries, transcripts, recordings, and even chat with your AI afterward.

---

## 🧪 Tech Stack

- ⚛️ **React + Next.js**
- 💬 **tRPC** (API layer)
- 🧑‍💻 **TypeScript**
- 🎨 **Tailwind CSS + Shadcn/ui**
- 🧱 **Drizzle ORM** + 🐘 **Neon PostgreSQL**
- 🤖 **OpenAI & Gemini (LLMs)**
- ⏱️ **Inngest** (background jobs)
- 💳 **Polar** (payments)
- 📹 **Stream Video & Chat API**

---

## 🛠️ Self-Host Setup

### 1. **Clone the Repo**

```bash
git clone https://github.com/tauhid-476/meet-ai.git
cd meet-ai
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Setup env**
Create a .env file in the root and add your environment variables (based on the ones you shared):
```bash
DATABASE_URL=your_postgres_url
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:3000

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret

NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_STREAM_VIDEO_API_KEY=your_stream_video_key
STREAM_VIDEO_SECRET_KEY=your_stream_video_secret

NEXT_PUBLIC_STREAM_CHAT_API_KEY=your_stream_chat_key
STREAM_CHAT_SECRET_KEY=your_stream_chat_secret

OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

POLAR_ACCESS_TOKEN=your_polar_token
```

### 4. **Setup Database**
Make sure you have a Neon PostgreSQL database. Push your schema
```bash
npm run db:push
```

### 5. **Run the app locally**
```bash
npm run dev
```

### 6. **Setup Webhooks**
```bash
npm run dev:webhook
```

### **🙏 Acknowledgments**
Thanks to all the OSS libraries and APIs that made this project possible.

If you find it helpful, feel free to ⭐ the repo or share your feedback!
Let’s reimagine meetings together 🚀

