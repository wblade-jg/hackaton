import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} - FinBatch` : 'FinBatch - Procesador de Transacciones';
  }, [title]);
}
