import { useState, useCallback, useRef } from "react";
import { filesApi, transactionsApi } from "../services/api";

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const requestIdRef = useRef(0);

  const fetchTransactions = useCallback(
    async (fileId, cursor = null, append = false) => {
      const requestId = ++requestIdRef.current;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
        setTransactions([]);
        setFileInfo(null);
        setNextCursor(null);
        setHasNextPage(false);
      }

      try {
        const data = await filesApi.getFileDetail(fileId, cursor, 10);
        if (requestId !== requestIdRef.current) return;

        setTransactions((prev) =>
          append ? [...prev, ...data.transactions] : data.transactions || [],
        );
        setFileInfo(data.file || null);
        setNextCursor(data.nextCursor ?? null);
        setHasNextPage(Boolean(data.hasNextPage));
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err.message);
      } finally {
        if (requestId === requestIdRef.current) {
          if (append) {
            setLoadingMore(false);
          } else {
            setLoading(false);
          }
        }
      }
    },
    [],
  );

  const updateAmount = useCallback(async (transactionId, amount) => {
    setError(null);
    try {
      const result = await transactionsApi.updateAmount(transactionId, amount);
      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionId ? { ...t, ...result } : t)),
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
    loadingMore,
    error,
    nextCursor,
    hasNextPage,
    fetchTransactions,
    updateAmount,
  };
}
