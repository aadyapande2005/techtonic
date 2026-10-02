import embeddingService from "./embeddings/embedding.service.js";
import { initializeCollections } from "./vectors/qdrant.collections.js";
import qdrantService from "./vectors/qdrant.service.js";

await initializeCollections();


const post = {
    title: "Sample Post",
    content: "React is a JavaScript library for building user interfaces. It allows developers to create reusable UI components and manage the state of their applications efficiently. React uses a virtual DOM to optimize rendering performance, making it a popular choice for building modern web applications."
};

const searchQuery = "What is Javascript?";

// const postVector = await embeddingService.generatePostEmbedding(post);

const searchVector = await embeddingService.generateEmbedding(searchQuery);

// console.log(postVector.length);

// await qdrantService.upsert("posts", 1, postVector, { title: post.title, content: post.content });

await qdrantService.search("posts", searchVector, 5).then(result => {
    console.log("Search Results:", result);
});