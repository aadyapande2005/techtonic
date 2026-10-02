import { v4 as uuid } from "uuid";

import { qdclient as client } from "../../config/qdrant.js";

type QdrantPoint = {
    id: string | number;
    vector: number[];
    payload?: Record<string, unknown>;
};

class QdrantService {

    async upsert(collection: string, id: string | number, vector: number[], payload: Record<string, unknown> = {}) {

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

    async search(collection: string, vector: number[], limit = 10, filter = undefined) {

        const result = await client.search(collection, {
            vector,
            limit,
            filter
        });

        return result;

    }


    async delete(collection: string, id: string | number) {

        await client.delete(collection, {

            wait: true,
            points: [id]

        });

    }

    async retrieve(collection: string, id: string | number): Promise<QdrantPoint | null> {

        const result = await client.retrieve(collection, {

            ids: [id],
            with_vector: true,
            with_payload: true

        });

        return result.length ? result[0] as unknown as QdrantPoint : null;

    }


    async updatePayload(collection: string, id: string | number, payload: Record<string, unknown>) {

        await client.setPayload(collection, {

            payload,
            points: [id]

        });

    }


    async scroll(collection: string, limit = 100) {

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