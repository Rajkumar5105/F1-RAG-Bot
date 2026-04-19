from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI()

model = SentenceTransformer("BAAI/bge-large-en-v1.5")

class TextRequest(BaseModel):
    text: str

@app.post("/embed")
def embed(req: TextRequest):
    embedding = model.encode(req.text, normalize_embeddings=True)
    return {"vector": embedding.tolist()}