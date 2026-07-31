import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

export default function EditAmountModal({ open, transaction, onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount || ''));
      setError('');
    }
  }, [transaction]);

  const validate = () => {
    const normalized = amount.trim().replace(/,/g, '.');
    if (!amount.trim()) {
      setError('El monto es requerido');
      return false;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      setError('Ingrese un monto válido con máximo 2 decimales (ej: 1500.50)');
      return false;
    }
    if (parseFloat(normalized) <= 0) {
      setError('El monto debe ser mayor a cero');
      return false;
    }
    setError('');
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(transaction.id, parseFloat(amount.trim().replace(/,/g, '.')));
    } catch {
      setError('Error al actualizar el monto. Intente de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !saving) {
      handleSave();
    }
  };

  if (!transaction) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="edit-amount-title"
    >
      <DialogTitle id="edit-amount-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#F4F8FD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EditIcon color="primary" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Editar Monto y Reprocesar
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2.5}>
          <Box
            sx={{
              p: 2,
              backgroundColor: '#FFF9F0',
              borderRadius: 2,
              border: '1px solid',
              borderColor: '#E8930C',
              borderTop: '3px solid',
              borderTopColor: '#B36500',
            }}
          >
            <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 500 }}>
              Esta transacción fue rechazada. Edite el monto a continuación para reprocesarla con las validaciones actualizadas.
            </Typography>
          </Box>

          <Box>
            <Typography variant="label" color="text.secondary" gutterBottom>
              Nro Cuenta
            </Typography>
            <Typography variant="body1">
              {transaction.account}
            </Typography>
          </Box>

          <Box>
            <Typography variant="label" color="text.secondary" gutterBottom>
              Fecha
            </Typography>
            <Typography variant="body1">{transaction.date}</Typography>
          </Box>

          <Box>
            <Typography variant="label" color="text.secondary" gutterBottom>
              Motivo de Rechazo
            </Typography>
            <Typography variant="body2" color="error.main">
              {transaction.rejectionReason}
            </Typography>
          </Box>

          <TextField
            label="Monto"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={handleKeyDown}
            error={!!error}
            helperText={error || 'Ingrese el valor monetario corregido'}
            type="text"
            inputMode="decimal"
            fullWidth
            autoFocus
            slotProps={{
              htmlInput: {
                'aria-label': 'Monto de la transacción',
              },
            }}
            InputProps={{
              startAdornment: (
                <Typography variant="body1" sx={{ mr: 0.5, color: 'text.secondary' }}>
                  $
                </Typography>
              ),
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={saving} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} /> : <EditIcon />}
        >
          {saving ? 'Reprocesando...' : 'Reprocesar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EditAmountModal.propTypes = {
  open: PropTypes.bool.isRequired,
  transaction: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
