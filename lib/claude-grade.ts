import Anthropic from '@anthropic-ai/sdk';
import type { ConditionGrade, GoldmineGrade } from '@/lib/types';

const client = new Anthropic();

const grades = ['M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P'];

const gradeTool: Anthropic.Messages.Tool = {
  name: 'grade_condition',
  description: 'Report the graded condition of the vinyl record and sleeve.',
  input_schema: {
    type: 'object' as const,
    properties: {
      mediaGrade: { type: 'string', enum: grades, description: 'Goldmine grade for the vinyl/media' },
      sleeveGrade: { type: 'string', enum: grades, description: 'Goldmine grade for the sleeve/cover' },
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      notes: { type: 'array', items: { type: 'string' }, description: 'Observations about condition' },
    },
    required: ['mediaGrade', 'sleeveGrade', 'confidence', 'notes'],
  },
};

export async function gradeCondition(
  imageBase64: string,
  mediaType: string
): Promise<ConditionGrade> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: `You are a vinyl record grading expert using the Goldmine standard. Analyze the image and grade the record's condition.

Goldmine Grades: M (Mint), NM (Near Mint), VG+ (Very Good Plus), VG (Very Good), G+ (Good Plus), G (Good), F (Fair), P (Poor).

Assess both the vinyl/media and the sleeve/cover separately. Look for scratches, groove wear, scuffs, warping, ring wear, seam splits, corner damage, writing, and stickers. Use the grade_condition tool to report your findings.`,
    tools: [gradeTool],
    tool_choice: { type: 'tool', name: 'grade_condition' },
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
            text: 'Grade this vinyl record.',
          },
        ],
      },
    ],
  });

  const toolBlock = response.content.find((block) => block.type === 'tool_use');
  if (!toolBlock || toolBlock.type !== 'tool_use') {
    throw new Error('No grading returned');
  }

  const input = toolBlock.input as {
    mediaGrade: string;
    sleeveGrade: string;
    confidence: string;
    notes: string[];
  };

  return {
    mediaGrade: (input.mediaGrade || 'VG') as GoldmineGrade,
    sleeveGrade: (input.sleeveGrade || 'VG') as GoldmineGrade,
    confidence: (input.confidence || 'medium') as ConditionGrade['confidence'],
    notes: input.notes || [],
  };
}
