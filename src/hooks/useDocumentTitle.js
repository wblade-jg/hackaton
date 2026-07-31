import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} - Compás` : 'Compás · Procesador de Transacciones';
  }, [title]);
}
