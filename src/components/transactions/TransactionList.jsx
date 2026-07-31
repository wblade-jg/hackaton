import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useTransactions } from '../../hooks/useTransactions';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';
import RejectReasonModal from '../transactions/RejectReasonModal';
import EditAmountModal from '../transactions/EditAmountModal';

export default function TransactionList() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { transactions, fileInfo, loading, error, fetchTransactions, updateAmount } = useTransactions();
  const [rejectionModal, setRejectionModal] = useState({ open: false, transaction: null });
  const [editModal, setEditModal] = useState({ open: false, transaction: null });

  useEffect(() => {
    if (fileId) fetchTransactions(fileId);
  }, [fileId, fetchTransactions]);

  const handleAmountUpdated = useCallback(
    async (transactionId, newAmount) => {
      await updateAmount(transactionId, newAmount);
      setEditModal({ open: false, transaction: null });
    },
    [updateAmount]
  );

  return (
    <Box sx={{ px: { xs: 2, sm: 3 } }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
        <IconButton
          onClick={() => navigate('/processed')}
          aria-label="Volver a archivos procesados"
          size="small"
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4">
            {fileInfo?.filename || 'Transacciones'}
          </Typography>
          {fileInfo && (
            <Typography variant="body2" color="text.secondary">
              Procesado el {fileInfo.processedDate} &middot; {transactions.length} transacciones
            </Typography>
          )}
        </Box>
      </Box>

      {fileInfo && (
        <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
          <Chip
            label={`${transactions.filter((t) => t.status === 'PROCESSED').length} Procesadas`}
            color="success"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${transactions.filter((t) => t.status === 'REJECTED').length} Rechazadas`}
            color="error"
            variant="outlined"
            size="small"
          />
        </Box>
      )}

      <Paper>
        {loading && transactions.length === 0 ? (
          <LoadingState message="Cargando transacciones..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchTransactions(fileId)} />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={ReceiptLongIcon}
            title="No hay transacciones"
            description="Este archivo no contiene transacciones para mostrar."
          />
        ) : (
          <TableContainer>
            <Table aria-label="Tabla de transacciones">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Cuenta</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx, index) => (
                  <TableRow
                    key={tx.id || index}
                    hover
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      backgroundColor: tx.status === 'REJECTED' ? 'rgba(211, 47, 47, 0.04)' : undefined,
                    }}
                    aria-label={`Transacción ${index + 1}`}
                  >
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {tx.account}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {tx.date}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                        color={tx.status === 'REJECTED' ? 'error.main' : 'text.primary'}
                      >
                        ${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={tx.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" justifyContent="flex-end" gap={0.5}>
                        {tx.status === 'REJECTED' && tx.rejectionReason && (
                          <Tooltip title="Ver motivo de rechazo" arrow>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setRejectionModal({ open: true, transaction: tx })}
                              aria-label={`Ver motivo de rechazo de transacción ${index + 1}`}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {tx.status === 'REJECTED' && (
                          <Tooltip title="Editar monto y reprocesar" arrow>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => setEditModal({ open: true, transaction: tx })}
                              aria-label={`Editar monto de transacción ${index + 1}`}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <RejectReasonModal
        open={rejectionModal.open}
        transaction={rejectionModal.transaction}
        onClose={() => setRejectionModal({ open: false, transaction: null })}
      />

      <EditAmountModal
        open={editModal.open}
        transaction={editModal.transaction}
        onClose={() => setEditModal({ open: false, transaction: null })}
        onSave={handleAmountUpdated}
      />
    </Box>
  );
}
