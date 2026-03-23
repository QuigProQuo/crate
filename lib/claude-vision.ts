import Anthropic from '@anthropic-ai/sdk';
import type { Identification } from '@/lib/types';

const client = new Anthropic();

export async function identifyRecord(
  imageBase64: string,
  mediaType: string
): Promise<Identification> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as
                | 'image/jpeg'
                | 'image/png'
                | 'image/gif'
                | 'image/webp',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: 'You are a vinyl record identification expert. Look at this image of a vinyl record, its cover art, or label. Identify the artist and album title. Also note if you can see a barcode. Respond with JSON only: {"artist": "...", "album": "...", "confidence": "high|medium|low"}',
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  const text = textBlock && 'text' in textBlock ? textBlock.text : '';
  const json = JSON.parse(text);

  return {
    artist: json.artist,
    album: json.album,
    confidence: json.confidence,
  };
}
