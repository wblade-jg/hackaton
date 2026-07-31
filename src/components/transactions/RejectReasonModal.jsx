import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import StatusBadge from '../common/StatusBadge';

export default function RejectReasonModal({ open, transaction, onClose }) {
  if (!transaction) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="rejection-reason-title"
    >
      <DialogTitle id="rejection-reason-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ErrorOutlineIcon color="error" />
        <Typography variant="h6" fontWeight={600}>
          Detalles del Rechazo
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Estado
            </Typography>
            <StatusBadge status={transaction.status} />
          </Box>

          <Divider />

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
              Número de Cuenta
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {transaction.account || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
              Fecha de Transacción
            </Typography>
            <Typography variant="body1">{transaction.date || '-'}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
              Monto Original
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              ${Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>

          <Divider />

          <Box
            sx={{
              p: 2,
              backgroundColor: 'rgba(211, 47, 47, 0.06)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light',
            }}
          >
            <Typography variant="body2" color="error.main" fontWeight={600} gutterBottom>
              Motivo de Rechazo
            </Typography>
            <Typography variant="body2" color="text.primary">
              {transaction.rejectionReason || 'No se proporcionó un motivo específico.'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" autoFocus>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
