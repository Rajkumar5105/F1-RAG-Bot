// import { DataAPIClient } from "@datastax/astra-db-ts";
// import OpenAI from "openai";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
// import "dotenv/config";

// type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

// const {
//     ASTRA_DB_NAMESPACE,
//     ASTRA_DB_COLLECTION,
//   ASTRA_DB_API_ENDPOINT,
//   ASTRA_DB_APPLICATION_TOKEN,
//   OPENAI_API_KEY,
// } = process.env;

// const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// const f1Data = [
//   "https://en.wikipedia.org/wiki/Formula_One",
//   "https://www.fancode.com/formula1/schedule",
//   "https://www.formula1.com/en/latest/article/drivers-teams-cars-circuits-and-more-everything-you-need-to-know-about.7iQfL3Rivf1comzdqV5jwc",
//   "https://www.goodwood.com/grr/f1/the-nine-greatest-f1-controversies/",
//   "https://www.gq.com.au/gq-sports/f1-most-controversial-moments/image-gallery/855b150473fa2b5ca8fc098b11317da5?page=2",
//   "https://www.redbull.com/in-en/formula-one-teams-and-drivers-guide",
//   "https://www.motorsport.com/f1/drivers/",
//   "https://www.espn.in/f1/schedule",
//   "https://www.formula1.com/en/latest",
//   "https://en.wikipedia.org/wiki/2023_Formula_One_World_Championship",
//   "https://en.wikipedia.org/wiki/2022_Formula_One_World_Championship",
//   "https://en.wikipedia.org/wiki/List_of_Formula_One_World_Drivers%27_Champions",
//   "https://en.wikipedia.org/wiki/2024_Formula_One_World_Championship",
//   "https://en.wikipedia.org/wiki/2025_Formula_One_World_Championship",
//   "https://www.formula1.com/en/results.html/2024/races.html",
//   "https://www.formula1.com/en/racing/2024.html",
// ];

// const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
// const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

// const splitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 512,
//   chunkOverlap: 100,
// });

// const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
//   const res = await db.createCollection(ASTRA_DB_COLLECTION, {
//     vector: {
//         dimension: 1536,
//         metric: similarityMetric,
//     },
//   });

//   console.log(res);
// };

// const loadSampleData = async () => {
//     const collection = await db.collection(ASTRA_DB_COLLECTION);

//     for await (const url of f1Data) {
//         const content = await scrapeData(url);
//         const chunks = await splitter.splitText(content);

//         for await (const chunk of chunks) {
//             const embedding = await openai.embeddings.create({
//                 model: "text-embedding-3-small",
//                 input: chunk,
//                 encoding_format: "float"
//             });

//             const vector = embedding.data[0].embedding

//             const res = await collection.insertOne({
//                 $vector: vector,
//                 text: chunk,
//                 source: url,
//             });

//             console.log(`Inserted chunk from ${url}: ${res}`);
//         }
//     }
// }

// const scrapeData = async (url: string) => {
//     const loader = new PuppeteerWebBaseLoader(url , {
//         launchOptions: {
//             headless: true,
//         },

//         gotoOptions:{
//             waitUntil: 'domcontentloaded',
//         },

//         evaluate : async (page , browser) => {
//             const result = await page.evaluate(() => document.body.innerHTML)
//             await browser.close();
//             return result;
//         }
//     });
// return ( await loader.scrape())?.replace(/<[^>]*>?/gm, '')
// }

// createCollection().then (() => loadSampleData())

import { DataAPIClient } from "@datastax/astra-db-ts";
import { GoogleGenAI } from "@google/genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import "dotenv/config";

// ---------- ENV ----------
const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  GEMINI_API_KEY,
} = process.env;

if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

// ---------- INIT ----------

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT!, {
  namespace: ASTRA_DB_NAMESPACE,
});

// ---------- DATA ----------
const f1Data = [
"https://en.wikipedia.org/wiki/List_of_forms_of_racing",
  "https://en.wikipedia.org/wiki/Motorsport",
  "https://medium.com/formula-one-forever",
  "https://www.reddit.com/r/F1News/",
];

// ---------- SPLITTER ----------
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

// ---------- CREATE COLLECTION ----------
const createCollection = async () => {
  try {
    await db.createCollection(ASTRA_DB_COLLECTION, {
      vector: {
        dimension: 1024,
        metric: "cosine",
      },
    });

    console.log("Collection created");
  } catch (err: any) {
    if (err.message.includes("already exists")) {
      console.log("Collection already exists, continuing...");
    } else {
      throw err;
    }
  }
};

// ---------- SCRAPER ----------
const scrapeData = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: { headless: true },
    gotoOptions: { waitUntil: "domcontentloaded" },

    evaluate: async (page, browser) => {
      const text = await page.evaluate(() => document.body.innerText);
      await browser.close();
      return text;
    },
  });

  return await loader.scrape();
};

// ---------- EMBEDDING ----------
// const getEmbedding = async (text: string) => {
//   const response = await ai.models.embedContent({
//     model: "gemini-embedding-001",
//     contents: text,
//     config: { taskType: "SEMANTIC_SIMILARITY" },
//   });

//   return response.embeddings[0].values;
// };

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

// ---------- LOAD DATA ----------
const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);

  for (const url of f1Data) {
    console.log(`Scraping: ${url}`);

    const content = await scrapeData(url);
    if (!content) continue;

    const chunks = await splitter.splitText(content);

    for (const chunk of chunks) {
      try {
        const vector = await getEmbedding(chunk);

        await collection.insertOne({
          $vector: vector,
          text: chunk,
          source: url,
        });

        console.log("Inserted chunk");
      } catch (err) {
        console.log("Error:", err);
      }
    }
  }
};


// ---------- RUN ----------
const run = async () => {
  await createCollection();
  await loadSampleData();
};

run();