import { QdrantClient } from "@qdrant/js-client-rest";

export const qdclient = new QdrantClient({ host: "localhost", port: 6333 });

