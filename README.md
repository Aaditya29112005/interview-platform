# Mentorque AI - Real-Time Voice Interview Platform

A full-stack, AI-powered mock interview platform where candidates engage in dynamic, real-time voice conversations with an AI interviewer. Rather than relying on static question lists or text chats, the AI listens, parses verbal cues, asks follow-up questions, challenges assumptions, adjusts difficulty dynamically, and builds a comprehensive evaluation map.

## Core Features

- **Google Gemini Multimodal Live voice stream**: Establishes low-latency, real-time voice conversations using Gemini's Native Audio model over WebSockets, with built-in voice characteristics (Puck).
- **Dynamic Steering (Decision Engine)**: Background analysis evaluates the candidate's last answer in real-time, updating dynamic topics, running memory context, and steering prompt directives.
- **High-Fidelity Downsampler & Web Audio scheduler**: Programmatically downsamples mic input from hardware native rates to 16kHz PCM Int16, and schedules outputs with a 50ms look-ahead window to prevent clicks, cracks, or static noise.
- **Interactive UI Studio**: A dark-themed dashboard featuring an animated visualizer orb (Listening, Thinking, Speaking states), audio waveforms, and progression timelines.
- **Deep Performance Grading**: Assesses candidate responses across six key categories: Technical Depth, Problem Solving, Communication, Confidence, Clarity, and Leadership.
- **Actionable Performance Reports**: Interactive graphs showing improvement trends, highlighted target readiness ranks (e.g. Google L4 Ready), structured study plans, and custom resource pointers.
- **Secure Authentication**: Traditional credential auth supported by JWT sessions stored securely in HttpOnly cookies.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide Icons
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL, bcryptjs, jsonwebtoken
- **AI Engine**: Google Gemini Multimodal Live API over WebSockets (`models/gemini-2.5-flash-native-audio-latest` for real-time streaming voice), Google Gemini REST API (`gemini-2.5-flash` for interview planners, turn grading, and reports).

---

## Local Setup (Under 5 Commands)

To run the application locally, follow these 4 simple steps:

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a `.env` file by copying the template:
```bash
cp .env.example .env
```
Open the `.env` file and set the following keys:
- `DATABASE_URL`: Your PostgreSQL connection string (e.g., Neon database URL)
- `JWT_SECRET`: A secure random secret string
- `GEMINI_API_KEY`: Your Google Gemini API Key from Google AI Studio

### 3. Deploy database schema
```bash
npx prisma db push
```

### 4. Launch the development server
```bash
npm run dev
```

The application will be running locally at **[http://localhost:3000](http://localhost:3000)**.
