import { useState, useEffect } from 'react'
import Head from 'next/head'
import AdBanner from '../components/AdBanner'
import PaywallModal from '../components/PaywallModal'
import { canUseFree, incrementUsage, getRemainingFree, FREE_DAILY_LIMIT } from '../lib/usage'
import styles from './index.module.css'

const GOALS = [
  { label: '今夜会いたい', value: '今夜会って体の関係を持ちたい', icon: '🔥' },
  { label: '追わせたい',   value: '相手を夢中にさせて追わせたい・焦らしたい', icon: '🎯' },
  { label: '彼女にしたい', value: '真剣交際・彼女にしたい', icon: '💍' },
  { label: 'キープ',       value: 'キープしつつ他も探したい', icon: '🃏' },
  { label: '復縁したい',   value: '元カノと復縁したい', icon: '🔄' },
  { label: 'セカンド',     value: 'セカンドを作りたい（既婚・彼女持ち）', icon: '🤫' },
]

const FASHION_CHIPS = ['フェミニン','カジュアル','ギャル・露出多め','きれいめ・オフィス系','ストリート系','モード・個性的','清楚系','量産型','アウトドア・スポーティ','和・落ち着き系']
const MAKEUP_CHIPS  = ['ナチュラルメイク','盛り系メイク','韓国コスメ系','すっぴん系','ロング・巻き髪','ショート・ボブ','派手髪・カラー','黒髪ストレート']
const BODY_CHIPS    = ['スレンダー','グラマー','小柄・童顔','高身長・モデル系','ふわふわ系','クール・凛とした','明るい・笑顔','色気がある']
const PERSONALITY_CHIPS = ['甘えん坊','サバサバ','ぶりっ子','真面目・堅い','遊び慣れてる','天然・マイペース','メンヘラ','積極的','奥手・受け身','知的・話が合う','ノリが良い','プライド高い','ミステリアス','母性的・世話焼き']
const LIFESTYLE_CHIPS   = ['インスタ映え好き','TikTok・SNS好き','お酒・夜遊び好き','インドア','アウトドア好き','仕事・キャリア重視','恋愛体質','友達グループ中心','一人時間重視','推し活・オタク']
const VIBES_CHIPS = ['かなり脈あり','まあまあ','微妙・読めない','冷めてきた','ほぼ脈なし']

function ChipGroup({ chips, selected, onToggle, single }) {
  return (
    <div className={styles.chipGroup}>
      {chips.map(c => (
        <button
          key={c}
          className={`${styles.chip} ${selected.includes(c) ? styles.chipOn : ''}`}
          onClick={() => onToggle(c)}
        >
          {c}
        </button>
      ))}
    </div>
  )
}

export default function Home() {
  const [goal, setGoal]       = useState(GOALS[0].value)
  const [relation, setRelation] = useState('マッチングアプリで最近つながった')
  const [freq, setFreq]       = useState('毎日やり取りしている')
  const [targetAge, setTargetAge] = useState('23〜26歳（社会人数年目）')
  const [myAge, setMyAge]     = useState('20代後半')

  const [fashion, setFashion]       = useState([])
  const [makeup, setMakeup]         = useState([])
  const [body, setBody]             = useState([])
  const [personality, setPersonality] = useState([])
  const [lifestyle, setLifestyle]   = useState([])
  const [vibes, setVibes]           = useState(['かなり脈あり'])
  const [freeText, setFreeText]     = useState('')

  const [lineText, setLineText]     = useState('')
  const [context, setContext]       = useState('')

  const [loading, setLoading]       = useState(false)
  const [results, setResults]       = useState(null)
  const [error, setError]           = useState('')
  const [showPaywall, setShowPaywall] = useState(false)
  const [remaining, setRemaining]   = useState(FREE_DAILY_LIMIT)

  useEffect(() => {
    setRemaining(getRemainingFree())
  }, [])

  function toggle(setter, val) {
    setter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])
  }

  function setSingle(setter, val) {
    setter([val])
  }

  async function generate() {
    if (!lineText.trim()) { setError('LINEのメッセージを入力してください'); return }
    setError('')

    // 無料回数チェック
    if (!canUseFree()) {
      setShowPaywall(true)
      return
    }

    setLoading(true)
    setResults(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal, relation, freq, targetAge, myAge,
          fashion: fashion.join('、'),
          makeup: makeup.join('、'),
          body: body.join('、'),
          personality: personality.join('、'),
          lifestyle: lifestyle.join('、'),
          vibes: vibes[0] || 'まあまあ',
          freePersonality: freeText,
          lineText,
          context,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // 使用回数を加算
      const newCount = incrementUsage()
      setRemaining(Math.max(0, FREE_DAILY_LIMIT - newCount))
      setResults(data.replies)
    } catch (e) {
      setError('生成に失敗しました。もう一度お試しください。')
    }

    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>モテLINE返信AI - 好きな子への返信を3秒で</title>
        <meta name="description" content="相手の性格・外見・関係性を入力するだけ。AIが「その子専用」のモテ返信を3パターン生成。1日3回無料。" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <div className={styles.container}>

          {/* ヘッダー */}
          <div className={styles.header}>
            <h1 className={styles.title}>モテLINE返信AI</h1>
            <p className={styles.subtitle}>相手を詳しく入力するほど、刺さる返信が出る。</p>
            <div className={styles.remainBadge}>
              今日あと <strong>{remaining}回</strong> 無料 / {FREE_DAILY_LIMIT}回
            </div>
          </div>

          {/* 広告（上部） */}
          <AdBanner style={{ marginBottom: '1.5rem' }} />

          {/* 目的 */}
          <section className={styles.section}>
            <label className={styles.label}>目的</label>
            <div className={styles.goalGrid}>
              {GOALS.map(g => (
                <button
                  key={g.value}
                  className={`${styles.goalBtn} ${goal === g.value ? styles.goalOn : ''}`}
                  onClick={() => setGoal(g.value)}
                >
                  <span className={styles.goalIcon}>{g.icon}</span>
                  {g.label}
                </button>
              ))}
            </div>
          </section>

          <div className={styles.divider} />

          {/* 基本情報 */}
          <section className={styles.section}>
            <p className={styles.secTitle}>基本情報</p>
            <div className={styles.row2}>
              <div>
                <label className={styles.label}>関係性</label>
                <select value={relation} onChange={e => setRelation(e.target.value)} className={styles.select}>
                  <option value="マッチングアプリで最近つながった">マッチング相手</option>
                  <option value="好きな人（未交際）">好きな人</option>
                  <option value="元カノ">元カノ</option>
                  <option value="友達以上恋人未満">友達以上恋人未満</option>
                  <option value="職場・知人">職場・知人</option>
                  <option value="今カノ">今カノ</option>
                  <option value="セフレ">セフレ</option>
                </select>
              </div>
              <div>
                <label className={styles.label}>連絡頻度</label>
                <select value={freq} onChange={e => setFreq(e.target.value)} className={styles.select}>
                  <option value="毎日やり取りしている">毎日</option>
                  <option value="週数回程度">週数回</option>
                  <option value="週1以下">週1以下</option>
                  <option value="久しぶりに連絡が来た">久しぶり</option>
                </select>
              </div>
            </div>
            <div className={styles.row2} style={{ marginTop: '10px' }}>
              <div>
                <label className={styles.label}>相手の年齢</label>
                <select value={targetAge} onChange={e => setTargetAge(e.target.value)} className={styles.select}>
                  <option value="18〜22歳（大学生・社会人なりたて）">18〜22歳</option>
                  <option value="23〜26歳（社会人数年目）">23〜26歳</option>
                  <option value="27〜30歳（キャリア・恋愛両立意識）">27〜30歳</option>
                  <option value="31〜35歳（結婚・将来を強く意識）">31〜35歳</option>
                  <option value="36歳以上（大人の余裕・現実的）">36歳以上</option>
                </select>
              </div>
              <div>
                <label className={styles.label}>自分の年齢</label>
                <select value={myAge} onChange={e => setMyAge(e.target.value)} className={styles.select}>
                  <option value="20代前半">20代前半</option>
                  <option value="20代後半">20代後半</option>
                  <option value="30代前半">30代前半</option>
                  <option value="30代後半">30代後半</option>
                  <option value="40代以上">40代以上</option>
                </select>
              </div>
            </div>
          </section>

          <div className={styles.divider} />

          {/* 外見 */}
          <section className={styles.section}>
            <p className={styles.secTitle}>外見・ファッション</p>
            <label className={styles.label}>服のスタイル <span className={styles.sub}>複数OK</span></label>
            <ChipGroup chips={FASHION_CHIPS} selected={fashion} onToggle={v => toggle(setFashion, v)} />
            <label className={styles.label} style={{ marginTop: '14px' }}>メイク・髪型 <span className={styles.sub}>複数OK</span></label>
            <ChipGroup chips={MAKEUP_CHIPS} selected={makeup} onToggle={v => toggle(setMakeup, v)} />
            <label className={styles.label} style={{ marginTop: '14px' }}>体型・雰囲気 <span className={styles.sub}>複数OK</span></label>
            <ChipGroup chips={BODY_CHIPS} selected={body} onToggle={v => toggle(setBody, v)} />
          </section>

          <div className={styles.divider} />

          {/* パーソナリティ */}
          <section className={styles.section}>
            <p className={styles.secTitle}>パーソナリティ</p>
            <label className={styles.label}>性格 <span className={styles.sub}>複数OK</span></label>
            <ChipGroup chips={PERSONALITY_CHIPS} selected={personality} onToggle={v => toggle(setPersonality, v)} />
            <label className={styles.label} style={{ marginTop: '14px' }}>SNS・生活スタイル <span className={styles.sub}>複数OK</span></label>
            <ChipGroup chips={LIFESTYLE_CHIPS} selected={lifestyle} onToggle={v => toggle(setLifestyle, v)} />
            <label className={styles.label} style={{ marginTop: '14px' }}>脈あり度</label>
            <ChipGroup chips={VIBES_CHIPS} selected={vibes} onToggle={v => setSingle(setVibes, v)} single />
            <label className={styles.label} style={{ marginTop: '14px' }}>
              性格・エピソードの自由記述
              <span className={styles.sub}>ここが一番効く</span>
            </label>
            <textarea
              className={styles.textarea}
              style={{ minHeight: '72px' }}
              maxLength={300}
              value={freeText}
              onChange={e => setFreeText(e.target.value)}
              placeholder="例：前の彼氏に浮気された経験がある。仕事の愚痴をよく言ってくる。褒められると素直に喜ぶタイプ。"
            />
            <div className={styles.charCount}>{freeText.length} / 300</div>
          </section>

          <div className={styles.divider} />

          {/* LINE入力 */}
          <section className={styles.section}>
            <label className={styles.label}>相手のLINE</label>
            <textarea
              className={styles.textarea}
              style={{ minHeight: '88px' }}
              value={lineText}
              onChange={e => setLineText(e.target.value)}
              placeholder="例：今日仕事終わりなんだけど、何してる？"
            />
            <label className={styles.label} style={{ marginTop: '12px' }}>
              直前の流れ・補足 <span className={styles.sub}>任意</span>
            </label>
            <textarea
              className={styles.textarea}
              style={{ minHeight: '56px' }}
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="例：昨日初めて会ってご飯。帰り際に良い雰囲気になった。"
            />
          </section>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={styles.genBtn}
            onClick={generate}
            disabled={loading}
          >
            {loading ? '生成中...' : `返信を生成する（残り${remaining}回無料）`}
          </button>

          {/* 結果 */}
          {results && (
            <div className={styles.results}>
              {/* 広告（結果の上） */}
              <AdBanner style={{ marginBottom: '1rem' }} />

              {results.map((r, i) => (
                <div key={i} className={styles.resultCard}>
                  <div className={styles.resultHeader}>
                    <span className={`${styles.badge} ${styles[`b${i + 1}`]}`}>{r.tone}</span>
                  </div>
                  <div className={styles.resultText}>{r.text}</div>
                  <div className={styles.resultReason}>なぜ効く？ {r.reason}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </>
  )
}
