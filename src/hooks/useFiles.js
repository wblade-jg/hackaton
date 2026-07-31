import { useState, useCallback } from 'react';
import { filesApi } from '../services/api';

export function useFiles() {
  const [availableFiles, setAvailableFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAvailable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await filesApi.getAvailable();
      setAvailableFiles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProcessed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await filesApi.getProcessed();
      setProcessedFiles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const processFile = useCallback(async (filename) => {
    setLoading(true);
    setError(null);
    try {
      const result = await filesApi.processFile(filename);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    availableFiles,
    processedFiles,
    loading,
    error,
    fetchAvailable,
    fetchProcessed,
    processFile,
  };
}
