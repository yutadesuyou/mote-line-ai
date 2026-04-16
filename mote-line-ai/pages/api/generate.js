// pages/api/generate.js
// サーバーサイドでAnthropic APIを呼ぶ（APIキーをクライアントに露出しない）

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    goal, relation, freq, targetAge, myAge,
    fashion, makeup, body, personality, lifestyle,
    vibes, freePersonality, lineText, context
  } = req.body

  if (!lineText) {
    return res.status(400).json({ error: 'lineText is required' })
  }

  const prompt = `あなたは男性向けの恋愛戦略アドバイザーです。以下の詳細情報を最大限に活かし、目的を達成するLINE返信を3パターン作成してください。

【目的】${goal}
【関係性】${relation}
【連絡頻度】${freq}
【相手の年齢】${targetAge}
【自分の年齢】${myAge}
【服のスタイル】${fashion || 'なし'}
【メイク・髪型】${makeup || 'なし'}
【体型・雰囲気】${body || 'なし'}
【性格タイプ】${personality || 'なし'}
【SNS・生活スタイル】${lifestyle || 'なし'}
【脈あり度】${vibes}
${freePersonality ? `【性格・エピソード詳細】${freePersonality}` : ''}
【相手のLINE】「${lineText}」
${context ? `【直前の流れ】${context}` : ''}

指示：
- 外見・ファッション・生活スタイルからこの子の価値観を推測し、その価値観に響く言葉遣いとトーンを選ぶこと
- 性格・エピソード詳細がある場合は最優先で活かすこと
- 3パターンはそれぞれ異なる戦術を使うこと
- 目的に対して実効性のある返信にすること（建前不要）
- なぜ効くかの心理的根拠を1〜2文で添えること

以下のJSON形式のみで回答（前置き・説明・バッククォート一切不要）：
{"replies":[{"tone":"戦術名（8文字以内）","text":"返信文","reason":"効く理由"},{"tone":"戦術名","text":"返信文","reason":"効く理由"},{"tone":"戦術名","text":"返信文","reason":"効く理由"}]}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic API error:', data)
      return res.status(500).json({ error: 'AI生成に失敗しました' })
    }

    const raw = data.content.map(i => i.text || '').join('')
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Generate error:', err)
    return res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
}
