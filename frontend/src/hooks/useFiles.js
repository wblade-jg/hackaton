import { useState, useCallback } from 'react';
import { filesApi } from '../services/api';

export function useFiles() {
  const [availableFiles, setAvailableFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [processedLoading, setProcessedLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [availableError, setAvailableError] = useState(null);
  const [processedError, setProcessedError] = useState(null);

  const fetchAvailable = useCallback(async () => {
    setAvailableLoading(true);
    setAvailableError(null);
    try {
      setAvailableFiles(await filesApi.getAvailable());
    } catch (err) {
      setAvailableError(err.message);
    } finally {
      setAvailableLoading(false);
    }
  }, []);

  const fetchProcessed = useCallback(async () => {
    setProcessedLoading(true);
    setProcessedError(null);
    try {
      setProcessedFiles(await filesApi.getProcessed());
    } catch (err) {
      setProcessedError(err.message);
    } finally {
      setProcessedLoading(false);
    }
  }, []);

  const processFile = useCallback(async (filename) => {
    setProcessing(true);
    try {
      return await filesApi.processFile(filename);
    } finally {
      setProcessing(false);
    }
  }, []);

  return {
    availableFiles,
    processedFiles,
    availableLoading,
    processedLoading,
    processing,
    availableError,
    processedError,
    fetchAvailable,
    fetchProcessed,
    processFile,
  };
}
