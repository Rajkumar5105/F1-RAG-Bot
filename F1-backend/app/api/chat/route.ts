import { NextResponse } from "next/server";
import { DataAPIClient } from "@datastax/astra-db-ts";
import Groq from "groq-sdk";

// ---------- ENV ----------
const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  GROQ_API_KEY,
} = process.env;

// ---------- INIT ----------
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);
const db = client.db(ASTRA_DB_API_ENDPOINT!, {
  namespace: ASTRA_DB_NAMESPACE,
});

const groq = new Groq({
  apiKey: GROQ_API_KEY!,
});

// ---------- EMBEDDING CALL (Python API) ----------
const getEmbedding = async (text: string) => {
  const res = await fetch("http://127.0.0.1:8000/embed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();
  return data.vector;
};

// ---------- POST API ----------
export async function POST(req: Request) {
  const { message } = await req.json();
  const question = message;

  try {
    const collection = await db.collection(ASTRA_DB_COLLECTION!);

    // 1. Embed query
    const queryVector = await getEmbedding(question);

    // 2. Search DB
    const cursor = collection.find(
      {},
      {
        sort: { $vector: queryVector },
        limit: 5,
      },
    );

    const docs = await cursor.toArray();

    // 3. Build context
    const context = docs.map((doc: any) => doc.text).join("\n\n");
    const context1 = docs
      .map((doc: any, i: number) => `Chunk ${i + 1}:\n${doc.text}`)
      .join("\n\n");

      
    // 4. Ask Groq
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an F1 expert. Answer ONLY using the provided context.If not found, say 'I don't know'. If user says Hello say 'Hello! How can I help you with F1 today?'.",
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${question}`,
        },
      ],
    });

    const answer = response.choices[0].message.content;

    return NextResponse.json({ reply: answer });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" });
  }
}
