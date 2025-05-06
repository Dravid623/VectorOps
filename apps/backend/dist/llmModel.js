import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
const llm = new ChatOllama({ model: "gemma3:1b" });
export default llm;
