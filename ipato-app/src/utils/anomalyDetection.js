/**
 * Anomaly Detection Engine
 * Compares a new transaction against the user's history
 * and returns a risk score (0–100) + list of flags.
 *
 * Score guide:
 *   0–39   → NORMAL          (complete immediately)
 *   40–69  → ELEVATED        (complete but log alert)
 *   70–100 → HIGH RISK       → status = PENDING_VERIFICATION
 */

// How many recent transactions to look at
const WINDOW = 20;
// Minutes within which rapid transactions are flagged
const RAPID_WINDOW_MINUTES = 30;
// How many transactions in RAPID_WINDOW_MINUTES is "rapid"
const RAPID_THRESHOLD = 4;

/**
 * @param {object} newTx   - { recipient, amount }
 * @param {array}  history - existing transactions array (newest first)
 * @returns {{ score: number, flags: string[], level: string }}
 */
export function analyzeTransaction(newTx, history) {
  const flags = [];
  let score = 0;

  const sent = history
    .filter(t => t.type === 'send' && t.status === 'COMPLETED')
    .slice(0, WINDOW);

  if (sent.length === 0) {
    // No history yet — treat first transaction as low risk
    return { score: 10, flags: ['First transaction'], level: 'NORMAL' };
  }

  const amounts = sent.map(t => t.amount);
  const avg     = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const max     = Math.max(...amounts);
  const median  = getMedian(amounts);

  // ── 1. Unusually large amount ─────────────────────────────────
  if (newTx.amount > max * 3) {
    flags.push('Amount is 3× larger than your largest ever transaction');
    score += 45;
  } else if (newTx.amount > avg * 5) {
    flags.push('Amount is 5× your average transaction');
    score += 35;
  } else if (newTx.amount > avg * 3) {
    flags.push('Amount is 3× your average transaction');
    score += 20;
  } else if (newTx.amount > avg * 2) {
    flags.push('Amount is 2× your average transaction');
    score += 10;
  }

  // ── 2. Above median by a large margin ─────────────────────────
  if (newTx.amount > median * 4 && newTx.amount > 10000) {
    score += 15;
    if (!flags.some(f => f.includes('median')))
      flags.push('Significantly above your typical spending');
  }

  // ── 3. Rapid/repeated transactions ───────────────────────────
  const now         = Date.now();
  const cutoff      = now - RAPID_WINDOW_MINUTES * 60 * 1000;
  const recentTxs   = sent.filter(t => new Date(t.date).getTime() > cutoff);

  if (recentTxs.length >= RAPID_THRESHOLD) {
    const recentTotal = recentTxs.reduce((s, t) => s + t.amount, 0) + newTx.amount;
    flags.push(`${recentTxs.length + 1} transactions in the last ${RAPID_WINDOW_MINUTES} minutes`);
    score += 25;

    if (recentTotal > avg * 10) {
      flags.push(`Total sent in last ${RAPID_WINDOW_MINUTES}min (KSh ${recentTotal.toLocaleString()}) is unusually high`);
      score += 20;
    }
  }

  // ── 4. New recipient ──────────────────────────────────────────
  const knownRecipients = [...new Set(sent.map(t => t.recipient.toLowerCase()))];
  const isNewRecipient  = !knownRecipients.includes(newTx.recipient.toLowerCase());

  if (isNewRecipient && newTx.amount > avg * 2) {
    flags.push('New recipient with a large amount');
    score += 20;
  } else if (isNewRecipient) {
    flags.push('New recipient');
    score += 5;
  }

  // ── 5. Unusual time (midnight–5am) ────────────────────────────
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) {
    flags.push('Unusual transaction time (late night)');
    score += 10;
  }

  // ── 6. Round-number large amounts (often fraudulent) ─────────
  if (newTx.amount >= 10000 && newTx.amount % 5000 === 0) {
    flags.push('Large round-number amount');
    score += 8;
  }

  // Cap at 100
  score = Math.min(100, score);

  const level =
    score >= 70 ? 'HIGH_RISK' :
    score >= 40 ? 'ELEVATED'  :
    'NORMAL';

  return { score, flags, level };
}

// ── Helper ────────────────────────────────────────────────────────
function getMedian(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid    = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}
