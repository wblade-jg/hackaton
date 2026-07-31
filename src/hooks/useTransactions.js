import { useState, useCallback } from 'react';
import { filesApi, transactionsApi } from '../services/api';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async (fileId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await filesApi.getFileDetail(fileId);
      setTransactions(data.transactions || []);
      setFileInfo(data.file || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAmount = useCallback(async (transactionId, amount) => {
    setError(null);
    try {
      const result = await transactionsApi.updateAmount(transactionId, amount);
      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionId ? { ...t, ...result } : t))
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    transactions,
    fileInfo,
    loading,
    error,
    fetchTransactions,
    updateAmount,
  };
}
