import embeddingProvider from "./embedding.provider.js";

class EmbeddingService {

    async generateEmbedding(text) {

        return embeddingProvider.embed(text);

    }

    async generatePostEmbedding(post) {

        const combinedText = `
            Title:
            ${post.title}

            Content:
            ${post.description}

            Tags:
            ${post.topics}
        `;

        return embeddingProvider.embed(combinedText);
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