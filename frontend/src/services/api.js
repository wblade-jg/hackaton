import { apiClient } from "../api/client";
import { mockApi } from "./mockApi";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * Maps a backend ArchivoEstado enum value to the frontend display status.
 * Backend:  PROCESADO | CON_ERRORES | FALLIDO
 * Frontend: EXITOSO   | ERRORES/CRITICO | CRITICO
 */
function mapFileStatus(estado, processedCount, rejectedCount) {
  if (estado === "PROCESADO") return "EXITOSO";
  if (estado === "FALLIDO") return "CRITICO";
  if (estado === "CON_ERRORES") {
    return processedCount === 0 ? "CRITICO" : "ERRORES";
  }
  if (rejectedCount === 0) return "EXITOSO";
  if (processedCount === 0) return "CRITICO";
  return "ERRORES";
}

export const filesApi = USE_MOCK
  ? {
      getAvailable: mockApi.getAvailableFiles,
      processFile: mockApi.processFile,
      getProcessed: mockApi.getProcessedFiles,
      getFileDetail: mockApi.getFileDetail,
    }
  : {
      getAvailable: async () => {
        const data = await apiClient("/files/available");
        return (data || []).map((item) => ({
          filename: item.nombreArchivo || item.filename,
          date: item.fecha || item.date || "-",
          size: item.tamanioBytes ?? item.size ?? 0,
          totalRows: item.totalFilas ?? item.totalRows ?? null,
        }));
      },
      processFile: async (filename) => {
        const res = await apiClient("/files/process", {
          method: "POST",
          body: JSON.stringify({ nombreArchivo: filename }),
        });
        return {
          success: true,
          fileId: res.id,
          filename: res.nombreArchivo,
          processedDate: res.fechaProceso,
          totalTransactions: res.totalRegistros,
          processedCount: res.procesados,
          rejectedCount: res.rechazados,
          status: res.estado,
          processed: res.procesados,
          rejected: res.rechazados,
        };
      },
      getProcessed: async () => {
        const data = await apiClient("/files");
        return (data || []).map((item) => {
          const processedCount = item.procesados ?? item.processedCount ?? 0;
          const rejectedCount = item.rechazados ?? item.rejectedCount ?? 0;
          return {
            id: item.id,
            filename: item.nombreArchivo || item.filename,
            processedDate: item.fechaProceso || item.processedDate,
            totalTransactions: item.totalRegistros ?? item.totalTransactions ?? 0,
            processedCount,
            rejectedCount,
            status: mapFileStatus(item.estado || item.status, processedCount, rejectedCount),
          };
        });
      },
      getFileDetail: async (id, page = 1, pageSize = 10, status = null, cursor = null) => {
        const query = new URLSearchParams();
        if (cursor) {
          query.set("cursor", cursor);
        } else if (page) {
          query.set("page", String(page));
        }
        if (pageSize) query.set("pageSize", String(pageSize));

        if (status && status !== "all") {
          const backendStatus =
            status === "PROCESSED" ? "PROCESADO" : "RECHAZADA";
          query.set("status", backendStatus);
        }

        const data = await apiClient(
          `/files/${id}${query.toString() ? `?${query.toString()}` : ""}`,
        );
        const processedCount = data.procesados ?? data.processedCount ?? 0;
        const rejectedCount = data.rechazados ?? data.rejectedCount ?? 0;
        const file = {
          id: data.id,
          filename: data.nombreArchivo || data.filename,
          processedDate: data.fechaProceso || data.processedDate,
          totalTransactions: data.totalRegistros ?? data.totalTransactions ?? 0,
          processedCount,
          rejectedCount,
          status: mapFileStatus(data.estado || data.status, processedCount, rejectedCount),
        };

        const transactions = (
          data.transacciones ||
          data.transactions ||
          []
        ).map((t) => ({
          id: t.id,
          account: t.cuenta || t.account,
          amount: t.monto ?? t.amount,
          date: t.fecha || t.date,
          status:
            t.estado === "PROCESADO" || t.status === "PROCESSED"
              ? "PROCESSED"
              : "REJECTED",
          rejectionReason: t.motivoRechazo || t.rejectionReason,
          isEditable: t.esEditable ?? t.isEditable ?? false,
        }));

        return {
          file,
          transactions,
          currentPage: data.currentPage ?? page,
          totalPages: data.totalPages ?? 1,
          hasNextPage: Boolean(data.hasNextPage),
          nextCursor: data.nextCursor ?? null,
          pageSize: data.pageSize ?? pageSize,
        };
      },
    };

export const transactionsApi = USE_MOCK
  ? {
      updateAmount: mockApi.updateTransactionAmount,
    }
  : {
      updateAmount: async (id, amount) => {
        const res = await apiClient(`/transactions/${id}`, {
          method: "POST",
          body: JSON.stringify({ monto: Number(amount) }),
        });
        return {
          id: res.id,
          account: res.cuenta || res.account,
          amount: res.monto ?? res.amount,
          date: res.fecha || res.date,
          status:
            res.estado === "PROCESADO" || res.status === "PROCESSED"
              ? "PROCESSED"
              : "REJECTED",
          rejectionReason: res.motivoRechazo || res.rejectionReason,
          isEditable: res.esEditable ?? res.isEditable ?? false,
        };
      },
    };
