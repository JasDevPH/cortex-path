import { pipeline } from "@huggingface/transformers";

export async function generateLocalEmbedding(text: string) {
  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
    {
      device: "webgpu", // Uses GPU for zero-lag
    },
  );
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}
