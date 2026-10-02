import { QdrantClient } from "@qdrant/js-client-rest";

export const qdclient = new QdrantClient({ host: "qdrant", port: 6333 });
