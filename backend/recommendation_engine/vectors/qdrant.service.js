import { v4 as uuid } from "uuid";

import { qdclient as client } from "../../config/qdrant.js";


class QdrantService {

    async upsert(collection, id, vector, payload = {}) {

        await client.upsert(collection, {

            wait: true,
            points: [
                {
                    id,
                    vector,
                    payload
                }
            ]
        });

    }

    async search(collection, vector, limit = 10, filter = undefined) {

        const result = await client.search(collection, {

            vector,
            limit,
            filter
        });

        return result;

    }


    async delete(collection, id) {

        await client.delete(collection, {

            wait: true,
            points: [id]

        });

    }

    async retrieve(collection, id) {

        const result = await client.retrieve(collection, {

            ids: [id],
            with_vector: true,
            with_payload: true

        });

        return result.length ? result[0] : null;

    }


    async updatePayload(collection, id, payload) {

        await client.setPayload(collection, {

            payload,
            points: [id]

        });

    }


    async scroll(collection, limit = 100) {

        const result = await client.scroll(collection, {

            limit

        });

        return result.points;

    }


    async exists(collection, id) {

        const point = await this.retrieve(collection, id);

        return point !== null;

    }


    createId() {

        return uuid();

    }

}

export default new QdrantService();