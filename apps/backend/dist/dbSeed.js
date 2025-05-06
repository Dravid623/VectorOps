import { readFile } from "fs/promises";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import vectorStorePromise from "./pineconeVDB.js";
async function loadAndInsertIncidents() {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const filePath = join(__dirname, "..", "data", "data.json");
        console.log(`Reading incidents from ${filePath}...`);
        const raw = await readFile(filePath, "utf-8");
        // Parse JSON with error handling
        let incidents;
        try {
            incidents = JSON.parse(raw);
        }
        catch (error) {
            console.error("Error parsing JSON:", error);
            return;
        }
        // Get the initialized vector store
        const vectorStore = await vectorStorePromise;
        // Create documents without TypeScript type annotations
        const documents = incidents.map((incident, i) => ({
            pageContent: `${incident.shortDescription}\n\n${incident.resolutionNotes}`,
            metadata: {
                number: incident.number,
                state: incident.state,
                priority: incident.priority,
                assignmentGroup: incident.assignmentGroup,
                assignedTo: incident.assignedTo,
                openedBy: incident.openedBy,
                resolvedBy: incident.resolvedBy,
                updatedBy: incident.updatedBy,
                majorIncident: incident.majorIncident,
                problem: incident.problem,
                affectedUser: incident.affectedUser,
                workNotes: incident.workNotes,
                category: incident.category,
                service: incident.service,
                serviceOffering: incident.serviceOffering,
                subCategory: incident.subCategory,
                vendor: incident.vendor
            }
        }));
        const ids = documents.map((_, i) => `incident-${i + 1}`);
        console.log(`Inserting ${documents.length} incidents into Pinecone...`);
        await vectorStore.addDocuments(documents, { ids });
        console.log(`Successfully inserted ${documents.length} incidents.`);
    }
    catch (error) {
        console.error("Error in loadAndInsertIncidents:", error);
    }
}
loadAndInsertIncidents();
