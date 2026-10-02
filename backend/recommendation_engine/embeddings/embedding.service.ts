import embeddingProvider from "./embedding.provider.js";

class EmbeddingService {

    async generateEmbedding(text) {

        return embeddingProvider.embed(text);

    }

    async generatePostEmbedding(post) {
        return embeddingProvider.embed(post.summary);
    }

    async generateUserEmbedding(user) {

        const combinedText = `
            Name:
            ${user.name}

            Bio:
            ${user.bio}

            Interests:
            ${user.interests}
        `;

        return embeddingProvider.embed(combinedText);

    }

}

export default new EmbeddingService();