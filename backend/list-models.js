import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "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",
  baseURL: "https://integrate.api.nvidia.com/v1",
});

async function listModels() {
  try {
    const models = await client.models.list();

    console.log("Available Models:\n");

    models.data.forEach((model) => {
      console.log(model.id);
    });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

listModels();