

import "dotenv/config";
import { traceable } from "langsmith/traceable";
import { RunTree } from "langsmith";
import llm from "./llmModel.js"

// Trace a LangChain call with custom project label
const tracedCall = traceable(
  async () => {
    // const llm = new ChatOllama({ model: "gemma3:1b" });
    return await llm.invoke([
      ["system", "You are a helpful assistant that translates English to Hindi."],
      ["human", "I love programming."],
    ]);
  },
  {
    run_type: "llm",
    name: "Ollama Hindi Translator",
    project_name: "pr-advanced-print-72",
  }
);

const result1 = await tracedCall();
console.log(result1);

const run = new RunTree({
    name: "Custom Ollama Run",
    run_type: "llm",
    inputs: { text: "Translate this to Hindi" },
    project_name: "pr-advanced-print-72",
  });
  
//   const llm = new ChatOllama({ model: "gemma3:1b" });
  const result = await llm.invoke([
    ["system", "Translate to Hindi."],
    ["human", "I love programming."],
  ]);
  
  run.end({ outputs: result });
  await run.postRun();

