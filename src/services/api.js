import { mockApi } from './mockApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const filesApi = USE_MOCK
  ? {
      getAvailable: mockApi.getAvailableFiles,
      processFile: mockApi.processFile,
      getProcessed: mockApi.getProcessedFiles,
      getFileDetail: mockApi.getFileDetail,
    }
  : {
      getAvailable: () => request('/files/available'),
      processFile: (filename) =>
        request('/files/process', {
          method: 'POST',
          body: JSON.stringify({ filename }),
        }),
      getProcessed: () => request('/files'),
      getFileDetail: (id) => request(`/files/${id}`),
    };

export const transactionsApi = USE_MOCK
  ? {
      updateAmount: mockApi.updateTransactionAmount,
    }
  : {
      updateAmount: (id, amount) =>
        request(`/transactions/${id}`, {
          method: 'POST',
          body: JSON.stringify({ amount }),
        }),
    };
