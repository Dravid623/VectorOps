import { OllamaEmbeddings } from "@langchain/ollama";
// ollamaEmbedding
const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text", // Default value
    baseUrl: "http://localhost:11434", // Default value
});
export default embeddings;
