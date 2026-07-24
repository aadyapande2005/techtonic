import { v4 as uuid } from "uuid";

import { qdclient as client } from "../../config/qdrant.js";


class QdrantService {

    //-------------------------------------------------------
    // UPSERT
    //-------------------------------------------------------

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

    //-------------------------------------------------------
    // SEARCH
    //-------------------------------------------------------

    async search(collection, vector, limit = 10, filter = undefined) {

        const result = await client.search(collection, {

            vector,

            limit,

            filter

        });

        return result;

    }

    //-------------------------------------------------------
    // DELETE
    //-------------------------------------------------------

    async delete(collection, id) {

        await client.delete(collection, {

            wait: true,

            points: [id]

        });

    }

    //-------------------------------------------------------
    // GET ONE
    //-------------------------------------------------------

    async retrieve(collection, id) {

        const result = await client.retrieve(collection, {

            ids: [id]

        });

        return result.length ? result[0] : null;

    }

    //-------------------------------------------------------
    // UPDATE PAYLOAD ONLY
    //-------------------------------------------------------

    async updatePayload(collection, id, payload) {

        await client.setPayload(collection, {

            payload,

            points: [id]

        });

    }

    //-------------------------------------------------------
    // SCROLL
    //-------------------------------------------------------

    async scroll(collection, limit = 100) {

        const result = await client.scroll(collection, {

            limit

        });

        return result.points;

    }

    //-------------------------------------------------------
    // EXISTS
    //-------------------------------------------------------

    async exists(collection, id) {

        const point = await this.retrieve(collection, id);

        return point !== null;

    }

    //-------------------------------------------------------
    // RANDOM ID
    //-------------------------------------------------------

    createId() {

        return uuid();

    }

}

export default new QdrantService();