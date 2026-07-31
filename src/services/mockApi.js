const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

function deriveFileStatus(processedCount, rejectedCount) {
  if (rejectedCount === 0) return 'EXITOSO';
  if (processedCount === 0) return 'CRITICO';
  return 'ERRORES';
}

const fileStore = {
  available: [
    { filename: 'transactions_28072026.csv', date: '2026-07-28', size: '2.4 KB' },
    { filename: 'transactions_29072026.csv', date: '2026-07-29', size: '3.1 KB' },
    { filename: 'transactions_30072026.csv', date: '2026-07-30', size: '1.8 KB' },
  ],
  processed: [
    {
      id: 1,
      filename: 'transactions_25072026.csv',
      processedDate: '2026-07-25 14:32:10',
      totalTransactions: 12,
      processedCount: 9,
      rejectedCount: 3,
      status: 'ERRORES',
    },
    {
      id: 2,
      filename: 'transactions_26072026.csv',
      processedDate: '2026-07-26 09:15:42',
      totalTransactions: 18,
      processedCount: 14,
      rejectedCount: 4,
      status: 'ERRORES',
    },
    {
      id: 3,
      filename: 'transactions_27072026.csv',
      processedDate: '2026-07-27 11:48:33',
      totalTransactions: 8,
      processedCount: 6,
      rejectedCount: 2,
      status: 'ERRORES',
    },
    {
      id: 4,
      filename: 'transactions_24072026.csv',
      processedDate: '2026-07-24 16:05:27',
      totalTransactions: 10,
      processedCount: 10,
      rejectedCount: 0,
      status: 'EXITOSO',
    },
    {
      id: 5,
      filename: 'transactions_23072026.csv',
      processedDate: '2026-07-23 10:12:03',
      totalTransactions: 6,
      processedCount: 0,
      rejectedCount: 6,
      status: 'CRITICO',
    },
  ],
  transactions: {
    1: [
      { id: 101, account: '1234567890', date: '2026-07-25', amount: 1500.00, status: 'PROCESSED' },
      { id: 102, account: '2345678901', date: '2026-07-25', amount: 2750.50, status: 'PROCESSED' },
      { id: 103, account: '3456789012', date: '2026-07-25', amount: 3200.00, status: 'PROCESSED' },
      { id: 104, account: '4567890123', date: '2026-07-25', amount: 890.75, status: 'PROCESSED' },
      { id: 105, account: '5678901234', date: '2026-07-25', amount: 12500.00, status: 'PROCESSED' },
      { id: 106, account: '6789012345', date: '2026-07-25', amount: 430.20, status: 'PROCESSED' },
      { id: 107, account: '7890123456', date: '2026-07-25', amount: 2100.00, status: 'PROCESSED' },
      { id: 108, account: '8901234567', date: '2026-07-25', amount: 5670.00, status: 'PROCESSED' },
      { id: 109, account: '9012345678', date: '2026-07-25', amount: 980.00, status: 'PROCESSED' },
      { id: 110, account: '12', date: '2026-07-25', amount: 3400.00, status: 'REJECTED', rejectionReason: 'El número de cuenta debe tener exactamente 10 dígitos (recibido: 2)' },
      { id: 111, account: '3456789012', date: '2026-07-25', amount: 3200.00, status: 'REJECTED', rejectionReason: 'Transacción duplicada (misma cuenta + fecha + monto)' },
      { id: 112, account: '0987654321', date: '', amount: 1500.00, status: 'REJECTED', rejectionReason: 'La fecha de transacción es requerida' },
    ],
    2: [
      { id: 201, account: '1111111111', date: '2026-07-26', amount: 5000.00, status: 'PROCESSED' },
      { id: 202, account: '2222222222', date: '2026-07-26', amount: 3200.00, status: 'PROCESSED' },
      { id: 203, account: '3333333333', date: '2026-07-26', amount: 7800.00, status: 'PROCESSED' },
      { id: 204, account: '4444444444', date: '2026-07-26', amount: 1200.50, status: 'PROCESSED' },
      { id: 205, account: '5555555555', date: '2026-07-26', amount: 9500.00, status: 'PROCESSED' },
      { id: 206, account: '6666666666', date: '2026-07-26', amount: 4100.00, status: 'PROCESSED' },
      { id: 207, account: '7777777777', date: '2026-07-26', amount: 2300.00, status: 'PROCESSED' },
      { id: 208, account: '8888888888', date: '2026-07-26', amount: 6700.00, status: 'PROCESSED' },
      { id: 209, account: '9999999999', date: '2026-07-26', amount: 3400.00, status: 'PROCESSED' },
      { id: 210, account: '1010101010', date: '2026-07-26', amount: 8800.00, status: 'PROCESSED' },
      { id: 211, account: '1212121212', date: '2026-07-26', amount: 0.00, status: 'REJECTED', rejectionReason: 'El monto debe ser mayor a cero' },
      { id: 212, account: '1313131313', date: '2026-07-26', amount: 5600.00, status: 'PROCESSED' },
      { id: 213, account: '1414141414', date: '2026-07-26', amount: 9200.00, status: 'PROCESSED' },
      { id: 214, account: '1515151515', date: '2026-07-26', amount: 1500.00, status: 'PROCESSED' },
      { id: 215, account: 'xxx', date: '2026-07-26', amount: 3000.00, status: 'REJECTED', rejectionReason: 'El número de cuenta debe tener exactamente 10 dígitos (recibido: 3)' },
      { id: 216, account: '1616161616', date: '2026-07-26', amount: 7800.00, status: 'PROCESSED' },
      { id: 217, account: '1717171717', date: '2026-07-26', amount: 0.00, status: 'REJECTED', rejectionReason: 'El monto debe ser mayor a cero' },
      { id: 218, account: '2222222222', date: '2026-07-26', amount: 3200.00, status: 'REJECTED', rejectionReason: 'Transacción duplicada (misma cuenta + fecha + monto)' },
    ],
    3: [
      { id: 301, account: 'ABC123DEFG', date: '2026-07-27', amount: 4500.00, status: 'REJECTED', rejectionReason: 'El número de cuenta debe contener solo dígitos (se requieren 10 dígitos)' },
      { id: 302, account: '9999999999', date: '2026-07-27', amount: 3100.00, status: 'PROCESSED' },
      { id: 303, account: '8888888888', date: '2026-07-27', amount: 7200.00, status: 'PROCESSED' },
      { id: 304, account: '7777777777', date: '2026-07-27', amount: 6800.00, status: 'PROCESSED' },
      { id: 305, account: '6666666666', date: '2026-07-27', amount: 2500.00, status: 'PROCESSED' },
      { id: 306, account: '5555555555', date: '2026-07-27', amount: 1900.00, status: 'PROCESSED' },
      { id: 307, account: '4444444444', date: '2026-07-27', amount: 8300.00, status: 'PROCESSED' },
      { id: 308, account: '3333333333', date: 'invalid-date', amount: 5600.00, status: 'REJECTED', rejectionReason: 'Formato de fecha de transacción inválido' },
    ],
    4: [
      { id: 401, account: '1234567890', date: '2026-07-24', amount: 1100.00, status: 'PROCESSED' },
      { id: 402, account: '2345678901', date: '2026-07-24', amount: 2650.00, status: 'PROCESSED' },
      { id: 403, account: '3456789012', date: '2026-07-24', amount: 4800.50, status: 'PROCESSED' },
      { id: 404, account: '4567890123', date: '2026-07-24', amount: 990.00, status: 'PROCESSED' },
      { id: 405, account: '5678901234', date: '2026-07-24', amount: 13400.00, status: 'PROCESSED' },
      { id: 406, account: '6789012345', date: '2026-07-24', amount: 720.00, status: 'PROCESSED' },
      { id: 407, account: '7890123456', date: '2026-07-24', amount: 3100.00, status: 'PROCESSED' },
      { id: 408, account: '8901234567', date: '2026-07-24', amount: 5200.00, status: 'PROCESSED' },
      { id: 409, account: '9012345678', date: '2026-07-24', amount: 860.00, status: 'PROCESSED' },
      { id: 410, account: '1010101010', date: '2026-07-24', amount: 2050.00, status: 'PROCESSED' },
    ],
    5: [
      { id: 501, account: '1111111111', date: '', amount: 1000.00, status: 'REJECTED', rejectionReason: 'La fecha de transacción es requerida' },
      { id: 502, account: '12', date: '2026-07-23', amount: 2500.00, status: 'REJECTED', rejectionReason: 'El número de cuenta debe tener exactamente 10 dígitos (recibido: 2)' },
      { id: 503, account: '2222222222', date: '2026-07-23', amount: 0.00, status: 'REJECTED', rejectionReason: 'El monto debe ser mayor a cero' },
      { id: 504, account: 'ABC123DEFG', date: '2026-07-23', amount: 3000.00, status: 'REJECTED', rejectionReason: 'El número de cuenta debe contener solo dígitos (se requieren 10 dígitos)' },
      { id: 505, account: '3333333333', date: 'invalid-date', amount: 4200.00, status: 'REJECTED', rejectionReason: 'Formato de fecha de transacción inválido' },
      { id: 506, account: '4444444444', date: '2026-07-23', amount: 1500.00, status: 'REJECTED', rejectionReason: 'El monto debe ser mayor a cero' },
    ],
  },
  nextTxId: 400,
};

const historyTx = fileStore.transactions;

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

    const newId = fileStore.processed.length + 1;
    const txCount = Math.floor(Math.random() * 8) + 5;
    const processedCount = Math.floor(txCount * 0.7);
    const rejectedCount = txCount - processedCount;

    const transactions = [];
    for (let i = 0; i < txCount; i++) {
      const isRejected = i >= processedCount;
      transactions.push({
        id: fileStore.nextTxId++,
        account: String(Math.floor(1000000000 + Math.random() * 9000000000)),
        date: file.date,
        amount: Math.round(Math.random() * 10000 * 100) / 100,
        status: isRejected ? 'REJECTED' : 'PROCESSED',
        ...(isRejected
          ? {
              rejectionReason: ['El número de cuenta debe tener exactamente 10 dígitos', 'El monto debe ser mayor a cero', 'Transacción duplicada', 'La fecha de transacción es requerida'][
                Math.floor(Math.random() * 4)
              ],
            }
          : {}),
      });
    }

    fileStore.transactions[newId] = transactions;
    fileStore.processed.push({
      id: newId,
      filename,
      processedDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      totalTransactions: txCount,
      processedCount,
      rejectedCount,
      status: deriveFileStatus(processedCount, rejectedCount),
    });

    return { success: true, fileId: newId, processed: processedCount, rejected: rejectedCount };
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
