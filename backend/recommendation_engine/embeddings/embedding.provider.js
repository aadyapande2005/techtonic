import { generateEmbedding } from "./models/allMiniLm.js";

class EmbeddingProvider {

    async embed(text) {

        if (!text || text.trim().length === 0) {
            throw new Error("Text cannot be empty.");
        }

        return generateEmbedding(text);
    }

}

export default new EmbeddingProvider();