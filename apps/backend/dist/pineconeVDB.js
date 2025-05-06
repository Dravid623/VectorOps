import "dotenv/config";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import embeddings from "./embeddingModel.js";
// Create an async initialization function
async function vectorStore() {
    const pinecone = new PineconeClient({
        apiKey: process.env.PINECONE_API_KEY
    });
    // Get the index from Pinecone
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
    // Create a vector store from the existing Pinecone index
    return await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        maxConcurrency: 5,
    });
}
export default vectorStore();
