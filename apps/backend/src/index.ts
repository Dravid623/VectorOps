import vectorStore from "./pineconeVDB.js";

const vectorStore1 = await vectorStore;

const filter = { priority: "2-high" };

// similarity search and receive the corresponding scores 
const similaritySearchWithScoreResults =
  await vectorStore1.similaritySearchWithScore("Access issues in the ABC dashboard analytics arose due to missing role configurations, affecting regional store leaders until proper roles were defined and permissions granted.", 2, filter);

for (const [doc, score] of similaritySearchWithScoreResults) {
  console.log(
    `* [SIM=${score.toFixed(3)}] ${doc.pageContent} [${JSON.stringify(
      doc.metadata
    )}]`
  );
}


// transform the vector store into a retriever for easier usage in chains
const retriever = vectorStore1.asRetriever({
    // Optional filter
    filter: filter,
    k: 2,
  });
  
const result = await retriever.invoke("Access issues in the ABC dashboard analytics arose due to missing role configurations, affecting regional store leaders until proper roles were defined and permissions granted.");
console.log("result..................")
console.log(result)