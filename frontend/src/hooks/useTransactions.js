import { useState, useCallback, useRef } from "react";
import { filesApi, transactionsApi } from "../services/api";

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const requestIdRef = useRef(0);

  /**
   * @param {string|number} fileId
   * @param {number} page - 1-based page number
   * @param {string|null} status - "PROCESSED", "REJECTED", or null for all
   * @param {string|null} cursor - Optional cursor for cursor-based pagination
   */
  const fetchTransactions = useCallback(
    async (fileId, page = 1, status = null, cursor = null) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      setTransactions([]);

      try {
        const data = await filesApi.getFileDetail(fileId, page, 10, status, cursor);
        if (requestId !== requestIdRef.current) return;

        setTransactions(data.transactions || []);
        setFileInfo(data.file || null);
        setCurrentPage(data.currentPage ?? page);
        setTotalPages(data.totalPages ?? 1);
        setNextCursor(data.nextCursor ?? null);
        setHasNextPage(data.hasNextPage ?? false);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err.message);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
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
    error,
    currentPage,
    totalPages,
    nextCursor,
    hasNextPage,
    fetchTransactions,
    updateAmount,
  };
}
