# F1 RAG Bot

An AI chatbot for Formula 1 questions. It uses retrieval augmented generation to search F1-related source material, retrieve relevant context from Astra DB vector search, and generate grounded answers through Groq.

## What It Does

- Answers Formula 1 questions through a chat interface.
- Retrieves relevant chunks from an Astra DB vector collection.
- Uses a FastAPI embedding service with `sentence-transformers`.
- Generates final responses with Groq.
- Includes a React/Vite frontend and a Next.js API backend.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Motion
- Backend: Next.js API routes, TypeScript
- Vector database: DataStax Astra DB
- Embeddings: FastAPI, Sentence Transformers, `BAAI/bge-large-en-v1.5`
- LLM: Groq

## Project Structure

```txt
F1-backend/
  app/api/chat/route.ts        # RAG chat API
  scripts/loadDb.ts            # Source scraping and vector ingestion
  python_backend/              # FastAPI embedding service

F1-frontend/
  src/app/App.tsx              # Chat UI
  vite.config.ts               # Vite config and API proxy
```

## Local Setup

1. Install backend dependencies:

```bash
cd F1-backend
npm install
```

2. Install frontend dependencies:

```bash
cd ../F1-frontend
npm install
```

3. Create environment variables:

```bash
cp .env.example F1-backend/.env
```

Fill in the Astra DB and Groq values.

4. Start the embedding service:

```bash
cd F1-backend/python_backend
uvicorn embedding_server:app --reload --port 8000
```

5. Start the backend:

```bash
cd ../
npm run dev
```

6. Start the frontend:

```bash
cd ../F1-frontend
npm run dev
```

