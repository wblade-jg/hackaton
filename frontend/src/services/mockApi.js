const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

function deriveFileStatus(processedCount, rejectedCount) {
  if (rejectedCount === 0) return "EXITOSO";
  if (processedCount === 0) return "CRITICO";
  return "ERRORES";
}

const fileStore = {
  available: [],
  processed: [],
  transactions: {},
};

const historyTx = fileStore.transactions;

let nextFileId = 1;
let nextTxId = 1;

// No hardcoded seed data — the mock starts empty.
// The real .NET API owns production data; set VITE_USE_MOCK=false to use it.

export const mockApi = {
  async getAvailableFiles() {
    await delay();
    return [...fileStore.available];
  },

  async processFile(filename) {
    await delay(1200);
    const file = fileStore.available.find((f) => f.filename === filename);
    if (!file) {
      throw new Error(
        `Archivo "${filename}" no encontrado en el directorio de entrada`,
      );
    }
    fileStore.available = fileStore.available.filter(
      (f) => f.filename !== filename,
    );

    const fileId = nextFileId++;
    const txCount = Math.floor(Math.random() * 8) + 5;
    const processedCount = Math.floor(txCount * 0.7);
    const rejectedCount = txCount - processedCount;

    const reasons = [
      "El número de cuenta debe tener exactamente 10 dígitos",
      "El monto debe ser mayor a cero",
      "Transacción duplicada",
      "La fecha de transacción es requerida",
    ];

    const transactions = Array.from({ length: txCount }, (_, i) => {
      const isRejected = i >= processedCount;
      const rejectionReason = isRejected
        ? reasons[Math.floor(Math.random() * reasons.length)]
        : undefined;
      const isEditable = isRejected && Boolean(rejectionReason && (rejectionReason.includes("monto") || rejectionReason.includes("Monto")));
      return {
        id: nextTxId++,
        account: String(Math.floor(1000000000 + Math.random() * 9000000000)),
        date: file.date,
        amount: Math.round(Math.random() * 10000 * 100) / 100,
        status: isRejected ? "REJECTED" : "PROCESSED",
        ...(isRejected ? { rejectionReason, isEditable } : {}),
      };
    });

    fileStore.transactions[fileId] = transactions;
    fileStore.processed.push({
      id: fileId,
      filename,
      processedDate: new Date().toISOString().replace("T", " ").slice(0, 19),
      totalTransactions: txCount,
      processedCount,
      rejectedCount,
      status: deriveFileStatus(processedCount, rejectedCount),
    });

    return {
      success: true,
      fileId,
      processed: processedCount,
      rejected: rejectedCount,
    };
  },

  async getProcessedFiles() {
    await delay();
    return [...fileStore.processed];
  },

  async getFileDetail(fileId, page = 1, pageSize = 10) {
    await delay();
    const file = fileStore.processed.find((f) => f.id === Number(fileId));
    const transactions = [...(fileStore.transactions[fileId] || [])];
    if (!file) {
      throw new Error(`Archivo con ID ${fileId} no encontrado`);
    }

    const sorted = [...transactions].sort((a, b) => b.id - a.id);
    const pageNumber = Math.max(1, Number(page));
    const startIndex = (pageNumber - 1) * pageSize;
    const pageSlice = sorted.slice(startIndex, startIndex + pageSize + 1);
    const hasNextPage = pageSlice.length > pageSize;
    const visible = hasNextPage ? pageSlice.slice(0, pageSize) : pageSlice;
    const nextCursor =
      hasNextPage && visible.length > 0
        ? String(startIndex + visible.length)
        : null;
    const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));

    return {
      file,
      transactions: visible,
      nextCursor,
      hasNextPage,
      currentPage: pageNumber,
      totalPages,
      pageSize,
    };
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
              other.amount === amount,
          );
        tx.status = valid ? "PROCESSED" : "REJECTED";
        tx.rejectionReason = valid
          ? undefined
          : !/^\d{10}$/.test(tx.account)
            ? "El número de cuenta debe tener exactamente 10 dígitos"
            : amount <= 0
              ? "El monto debe ser mayor a cero"
              : !tx.date
                ? "La fecha de transacción es requerida"
                : "Transacción duplicada";
        const fileId = Number(key);
        const file = fileStore.processed.find((f) => f.id === fileId);
        if (file) {
          file.processedCount = historyTx[key].filter(
            (t) => t.status === "PROCESSED",
          ).length;
          file.rejectedCount = historyTx[key].filter(
            (t) => t.status === "REJECTED",
          ).length;
          file.status = deriveFileStatus(
            file.processedCount,
            file.rejectedCount,
          );
        }
        return { ...tx };
      }
    }
    throw new Error(`Transacción con ID ${transactionId} no encontrada`);
  },
};
