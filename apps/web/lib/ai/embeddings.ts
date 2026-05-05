import { pipeline } from '@huggingface/transformers';

// Singleton — model loads once per Node.js server process and stays in memory
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _embedder: any = null;

async function getEmbedder() {
  if (!_embedder) {
    _embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      device: 'cpu',
    });
  }
  return _embedder;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const embedder = await getEmbedder();
  const output = await embedder(text.slice(0, 2000), { pooling: 'mean', normalize: true });
  return Array.from(output.data as Float32Array);
}
