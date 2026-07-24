import {qdclient as client} from "../../config/qdrant.js";

export const COLLECTIONS = {
    POSTS: "posts",
    USERS: "users"
};

const POST_VECTOR_SIZE = 384;
const USER_VECTOR_SIZE = 384;

export async function initializeCollections() {

    const collections = await client.getCollections();

    const names = collections.collections.map(c => c.name);

    if (!names.includes(COLLECTIONS.POSTS)) {

        console.log("Creating Posts collection...");

        await client.createCollection(COLLECTIONS.POSTS, {

            vectors: {

                size: POST_VECTOR_SIZE,

                distance: "Cosine"

            }

        });

    }

    if (!names.includes(COLLECTIONS.USERS)) {

        console.log("Creating Users collection...");

        await client.createCollection(COLLECTIONS.USERS, {

            vectors: {

                size: USER_VECTOR_SIZE,

                distance: "Cosine"

            }

        });

    }

}