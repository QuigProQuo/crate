import Anthropic from '@anthropic-ai/sdk';
import type { ConditionGrade } from '@/lib/types';

const client = new Anthropic();

export async function gradeCondition(
  imageBase64: string,
  mediaType: string
): Promise<ConditionGrade> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `You are a vinyl record grading expert using the Goldmine standard. Analyze this image and grade the record's condition.

Goldmine Grades:
- M (Mint): Perfect, unplayed, no defects
- NM (Near Mint): Nearly perfect, minimal signs of handling
- VG+ (Very Good Plus): Light wear, minor scuffs, plays with minimal noise
- VG (Very Good): Noticeable wear, light scratches, some surface noise
- G+ (Good Plus): Heavy wear, scratches visible, significant surface noise
- G (Good): Very heavy wear, plays through with constant noise
- F (Fair): Damaged but plays, deep scratches or warping
- P (Poor): Barely playable or unplayable

Assess both the vinyl/media and the sleeve/cover separately. Look for:
- Scratches (hairline, light, deep)
- Groove wear (gray/white appearance)
- Scuffs and handling marks
- Warping or dish warping
- Sleeve: ring wear, seam splits, corner damage, writing, stickers

Respond with JSON only:
{"mediaGrade": "VG+", "sleeveGrade": "VG", "confidence": "high|medium|low", "notes": ["note1", "note2"]}`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  const text = textBlock && 'text' in textBlock ? textBlock.text : '';

  // Extract JSON from response (may be wrapped in markdown code block)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { mediaGrade: 'VG', sleeveGrade: 'VG', confidence: 'low', notes: ['Unable to parse grading response'] };
  }

  const json = JSON.parse(jsonMatch[0]);

  return {
    mediaGrade: json.mediaGrade || 'VG',
    sleeveGrade: json.sleeveGrade || 'VG',
    confidence: json.confidence || 'medium',
    notes: json.notes || [],
  };
}
