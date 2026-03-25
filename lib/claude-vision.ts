import Anthropic from '@anthropic-ai/sdk';
import type { Identification } from '@/lib/types';

const client = new Anthropic();

const identifyTool: Anthropic.Messages.Tool = {
  name: 'identify_record',
  description: 'Report the identified vinyl record from the image.',
  input_schema: {
    type: 'object' as const,
    properties: {
      artist: { type: 'string', description: 'Artist or band name' },
      album: { type: 'string', description: 'Album title' },
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    },
    required: ['artist', 'album', 'confidence'],
  },
};

export async function identifyRecord(
  imageBase64: string,
  mediaType: string
): Promise<Identification> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    system: 'You are a vinyl record identification expert. Look at the image of a vinyl record, its cover art, or label. Identify the artist and album title. Use the identify_record tool to report your findings.',
    tools: [identifyTool],
    tool_choice: { type: 'tool', name: 'identify_record' },
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
            text: 'Identify this vinyl record.',
          },
        ],
      },
    ],
  });

  const toolBlock = response.content.find((block) => block.type === 'tool_use');
  if (!toolBlock || toolBlock.type !== 'tool_use') {
    throw new Error('No identification returned');
  }

  const input = toolBlock.input as { artist: string; album: string; confidence: string };

  return {
    artist: input.artist,
    album: input.album,
    confidence: input.confidence as Identification['confidence'],
  };
}
