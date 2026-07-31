const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

function deriveFileStatus(processedCount, rejectedCount) {
  if (rejectedCount === 0) return 'EXITOSO';
  if (processedCount === 0) return 'CRITICO';
  return 'ERRORES';
}

const fileStore = {
  available: [],
  processed: [],
  transactions: {},
};

const historyTx = fileStore.transactions;

let nextFileId = 1;
let nextTxId = 1;

// --- Synthetic demo data (frontend showcase only) ---------------------------
// Seed a small, deterministic batch so every screen renders populated. This is
// presentation material for the mock adapter; the real .NET API owns production
// data. Marked demo/*.csv to keep it clearly separate from real correspondent
// files.
const REASONS = [
  'El número de cuenta debe tener exactamente 10 dígitos',
  'El monto debe ser mayor a cero',
  'Transacción duplicada',
  'La fecha de transacción es requerida',
];

function mulberry32(seed) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSeedTransactions({ fileId, date, total, rejectedCount, seed }) {
  const rand = mulberry32(seed);
  const transactions = [];
  const seen = new Set();
  for (let i = 0; i < total; i += 1) {
    let account;
    do {
      account = String(Math.floor(1000000000 + rand() * 9000000000));
    } while (seen.has(account));
    seen.add(account);
    const isRejected = i >= total - rejectedCount;
    const amount = Math.round(rand() * 12000 * 100) / 100;
    transactions.push({
      id: nextTxId++,
      account,
      date,
      amount,
      status: isRejected ? 'REJECTED' : 'PROCESSED',
      ...(isRejected ? { rejectionReason: REASONS[Math.floor(rand() * REASONS.length)] } : {}),
    });
  }
  fileStore.transactions[fileId] = transactions;
  return transactions;
}

function seedProcessedFile({ filename, date, processedDate, total, processedCount, seed }) {
  const fileId = nextFileId++;
  buildSeedTransactions({
    fileId,
    date,
    total,
    rejectedCount: total - processedCount,
    seed,
  });
  fileStore.processed.push({
    id: fileId,
    filename,
    processedDate,
    totalTransactions: total,
    processedCount,
    rejectedCount: total - processedCount,
    status: deriveFileStatus(processedCount, total - processedCount),
  });
}

fileStore.available = [
  { filename: 'transactions_31072026.csv', date: '31/07/2026', size: 48 * 1024, lastModified: '2026-07-31 06:45:00' },
  { filename: 'transactions_29072026.csv', date: '29/07/2026', size: 27 * 1024, lastModified: '2026-07-29 18:30:00' },
  { filename: 'transactions_28072026.csv', date: '28/07/2026', size: 12 * 1024, lastModified: '2026-07-28 17:02:00' },
];

seedProcessedFile({
  filename: 'transactions_27072026.csv',
  date: '27/07/2026',
  processedDate: '2026-07-27 19:10:00',
  total: 40,
  processedCount: 40,
  seed: 11,
});

seedProcessedFile({
  filename: 'transactions_26072026.csv',
  date: '26/07/2026',
  processedDate: '2026-07-26 18:55:00',
  total: 25,
  processedCount: 16,
  seed: 22,
});

seedProcessedFile({
  filename: 'transactions_25072026.csv',
  date: '25/07/2026',
  processedDate: '2026-07-25 20:20:00',
  total: 12,
  processedCount: 0,
  seed: 33,
});
// --- End synthetic demo data -------------------------------------------------

export const mockApi = {
  async getAvailableFiles() {
    await delay();
    return [...fileStore.available];
  },

  async processFile(filename) {
    await delay(1200);
    const file = fileStore.available.find((f) => f.filename === filename);
    if (!file) {
      throw new Error(`Archivo "${filename}" no encontrado en el directorio de entrada`);
    }
    fileStore.available = fileStore.available.filter((f) => f.filename !== filename);

    const fileId = nextFileId++;
    const txCount = Math.floor(Math.random() * 8) + 5;
    const processedCount = Math.floor(txCount * 0.7);
    const rejectedCount = txCount - processedCount;

    const reasons = [
      'El número de cuenta debe tener exactamente 10 dígitos',
      'El monto debe ser mayor a cero',
      'Transacción duplicada',
      'La fecha de transacción es requerida',
    ];

    const transactions = Array.from({ length: txCount }, (_, i) => {
      const isRejected = i >= processedCount;
      return {
        id: nextTxId++,
        account: String(Math.floor(1000000000 + Math.random() * 9000000000)),
        date: file.date,
        amount: Math.round(Math.random() * 10000 * 100) / 100,
        status: isRejected ? 'REJECTED' : 'PROCESSED',
        ...(isRejected ? { rejectionReason: reasons[Math.floor(Math.random() * reasons.length)] } : {}),
      };
    });

    fileStore.transactions[fileId] = transactions;
    fileStore.processed.push({
      id: fileId,
      filename,
      processedDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      totalTransactions: txCount,
      processedCount,
      rejectedCount,
      status: deriveFileStatus(processedCount, rejectedCount),
    });

    return { success: true, fileId, processed: processedCount, rejected: rejectedCount };
  },

  async getProcessedFiles() {
    await delay();
    return [...fileStore.processed];
  },

  async getFileDetail(fileId) {
    await delay();
    const file = fileStore.processed.find((f) => f.id === Number(fileId));
    const transactions = fileStore.transactions[fileId] || [];
    if (!file) {
      throw new Error(`Archivo con ID ${fileId} no encontrado`);
    }
    return { file, transactions };
  },

  async updateTransactionAmount(transactionId, amount) {
    await delay(800);
    for (const key of Object.keys(historyTx)) {
      const tx = historyTx[key].find((t) => t.id === Number(transactionId));
      if (tx) {
        tx.amount = amount;
        const valid =
          String(tx.account).length === 10 &&
          /^\d{10}$/.test(tx.account) &&
          amount > 0 &&
          tx.date &&
          !historyTx[key].some(
            (other) =>
              other.id !== tx.id &&
              other.account === tx.account &&
              other.date === tx.date &&
              other.amount === amount
          );
        tx.status = valid ? 'PROCESSED' : 'REJECTED';
        tx.rejectionReason = valid
          ? undefined
          : !/^\d{10}$/.test(tx.account)
            ? 'El número de cuenta debe tener exactamente 10 dígitos'
            : amount <= 0
              ? 'El monto debe ser mayor a cero'
              : !tx.date
                ? 'La fecha de transacción es requerida'
                : 'Transacción duplicada';
        const fileId = Number(key);
        const file = fileStore.processed.find((f) => f.id === fileId);
        if (file) {
          file.processedCount = historyTx[key].filter((t) => t.status === 'PROCESSED').length;
          file.rejectedCount = historyTx[key].filter((t) => t.status === 'REJECTED').length;
          file.status = deriveFileStatus(file.processedCount, file.rejectedCount);
        }
        return { ...tx };
      }
    }
    throw new Error(`Transacción con ID ${transactionId} no encontrada`);
  },
};
