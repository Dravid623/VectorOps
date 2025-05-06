// createPineconeIndex.js
import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";
async function createIndex() {
    var _a;
    try {
        console.log("Initializing Pinecone client...");
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });
        const indexName = process.env.PINECONE_INDEX;
        // Check if the index already exists
        // const existingIndexes = await pinecone.listIndexes();
        // if (existingIndexes.filter(idx => idx.name === indexName)) {
        //   console.log(`Index "${indexName}" already exists.`);
        //   return;
        // }
        // Create the index if it doesn't exist
        console.log(`Creating index "${indexName}"...`);
        // The dimensions should match your embedding model
        // For OpenAI's text-embedding-ada-002, it's 1536
        // You may need to adjust this based on your embedding model
        await pinecone.createIndex({
            name: indexName,
            dimension: 768, // Adjust based on your embedding model
            metric: "cosine",
            spec: {
                serverless: {
                    cloud: "aws",
                    region: "us-east-1" // Choose an appropriate region
                }
            }
        });
        console.log(`Index "${indexName}" created successfully.`);
        // Wait for the index to be ready (initialization can take a few minutes)
        console.log("Waiting for index to initialize...");
        let isReady = false;
        while (!isReady) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Check every 10 seconds
            const indexDescription = await pinecone.describeIndex(indexName);
            isReady = ((_a = indexDescription.status) === null || _a === void 0 ? void 0 : _a.ready) === true;
            if (isReady) {
                console.log("Index is ready to use!");
            }
            else {
                console.log("Index is still initializing, waiting...");
            }
        }
    }
    catch (error) {
        console.error("Error creating Pinecone index:", error);
    }
}
createIndex().catch(console.error);
