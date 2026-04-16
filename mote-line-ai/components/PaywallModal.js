import styles from './PaywallModal.module.css'

export default function PaywallModal({ onClose }) {
  function handleStripe() {
    // Stripe Payment Link: Stripeダッシュボードで作成したURLに差し替え
    // https://dashboard.stripe.com → Payment Links → Create
    window.open('https://buy.stripe.com/YOUR_PAYMENT_LINK', '_blank')
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.badge}>今日の無料回数を使い切りました</div>
        <h2 className={styles.title}>もっと使うなら<br />プレミアムへ</h2>
        <p className={styles.desc}>
          無制限で使えるようになります。<br />いつでも解約OK。
        </p>

        <div className={styles.planBox}>
          <div className={styles.planPrice}>
            <span className={styles.price}>¥1,480</span>
            <span className={styles.per}> / 月</span>
          </div>
          <ul className={styles.features}>
            <li>生成回数 無制限</li>
            <li>広告なし</li>
            <li>全項目入力対応</li>
            <li>返信履歴の保存</li>
          </ul>
        </div>

        <button className={styles.ctaBtn} onClick={handleStripe}>
          月1,480円で始める
        </button>
        <button className={styles.closeBtn} onClick={onClose}>
          明日また無料で使う
        </button>
      </div>
    </div>
  )
}
