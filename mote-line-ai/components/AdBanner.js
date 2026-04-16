import { useEffect } from 'react'

// AdSense審査通過後: ADSENSE_CLIENT と ADSENSE_SLOT を実際の値に変更し、isDummy=falseに
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''
const isDummy = !ADSENSE_CLIENT

export default function AdBanner({ slot = '1234567890', style = {} }) {
  useEffect(() => {
    if (!isDummy && typeof window !== 'undefined') {
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch {}
    }
  }, [])

  // 審査前・開発時はダミー広告枠を表示
  if (isDummy) {
    return (
      <div style={{
        width: '100%',
        height: '90px',
        background: '#f0f0f0',
        border: '1px dashed #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        color: '#999',
        fontSize: '12px',
        ...style
      }}>
        広告枠（AdSense審査後に有効化）
      </div>
    )
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
