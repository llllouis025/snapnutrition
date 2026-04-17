import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
})

const SYSTEM_PROMPT = `You are a precise food nutrition analyzer. Analyze the food in the image and return ONLY valid JSON with no other text. Use this exact schema:
{
  "food_name": "string",
  "serving_grams": number,
  "calories": number,
  "protein": number,
  "fat": number,
  "carbohydrates": number,
  "fiber": number,
  "sugar": number,
  "sodium": number
}
All values should reflect the estimated portion shown. Nutrient units: grams (except calories=kcal, sodium=mg).`

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json()

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: '缺少圖片資料' }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: 'claude-sonnet-4-6',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            { type: 'text', text: 'Analyze this food and return the nutrition JSON.' },
          ],
        },
      ],
      max_tokens: 500,
    })

    const raw = response.choices[0].message.content ?? '{}'
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const nutrition = JSON.parse(jsonMatch[0])

    return NextResponse.json({ nutrition, raw })
  } catch (err) {
    console.error('analyze-food error:', err)
    return NextResponse.json({ error: 'AI 分析失敗，請稍後再試' }, { status: 500 })
  }
}
