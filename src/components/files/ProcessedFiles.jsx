import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Tooltip,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import { useFiles } from '../../hooks/useFiles';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';
import CardList from '../common/CardList';
import { formatDate } from '../../utils/format';

function ResultCell({ total, processed, rejected }) {
  const processedPct = total ? (processed / total) * 100 : 0;
  const rejectedPct = total ? (rejected / total) * 100 : 0;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 160 }}>
      <Box
        role="img"
        aria-label={`${processed} de ${total} transacciones procesadas, ${rejected} rechazadas`}
        sx={{
          display: 'flex',
          height: 6,
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: 'divider',
          width: '100%',
        }}
      >
        <Box sx={{ width: `${processedPct}%`, backgroundColor: 'success.main' }} />
        <Box sx={{ width: `${rejectedPct}%`, backgroundColor: 'error.main' }} />
      </Box>
      <Typography variant="body2" color="text.secondary">
        {total} total &middot;{' '}
        <Typography component="span" variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
          {processed} OK
        </Typography>{' '}
        &middot;{' '}
        <Typography component="span" variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
          {rejected} rechazadas
        </Typography>
      </Typography>
    </Box>
  );
}

ResultCell.propTypes = {
  total: PropTypes.number,
  processed: PropTypes.number,
  rejected: PropTypes.number,
};

export default function ProcessedFiles() {
  const { processedFiles, processedLoading: loading, processedError: error, fetchProcessed } = useFiles();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('processedDate');

  useEffect(() => {
    fetchProcessed();
  }, [fetchProcessed]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const statusCounts = useMemo(() => {
    const counts = { EXITOSO: 0, ERRORES: 0, CRITICO: 0 };
    processedFiles.forEach((f) => {
      if (counts[f.status] !== undefined) counts[f.status] += 1;
    });
    return counts;
  }, [processedFiles]);

  const visibleFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let filtered = processedFiles;
    if (statusFilter) {
      filtered = filtered.filter((f) => f.status === statusFilter);
    }
    if (query) {
      filtered = filtered.filter((f) => f.filename.toLowerCase().includes(query));
    }

    const multiplier = order === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const aVal = orderBy === 'filename' ? a.filename : a.processedDate || '';
      const bVal = orderBy === 'filename' ? b.filename : b.processedDate || '';
      return String(aVal).localeCompare(String(bVal)) * multiplier;
    });
  }, [processedFiles, searchQuery, order, orderBy, statusFilter]);

  const sortLabelProps = (property) => ({
    active: orderBy === property,
    direction: orderBy === property ? order : 'asc',
    onClick: () => handleRequestSort(property),
  });

  const renderCards = (
    <CardList
      items={visibleFiles}
      renderItem={(file) => (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>
              <DescriptionIcon
                sx={{ color: 'primary.light', fontSize: 20, verticalAlign: 'middle', mr: 0.5 }}
              />
              {file.filename}
            </Typography>
            <StatusBadge status={file.status} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Procesado el {formatDate(file.processedDate)}
          </Typography>
          <ResultCell
            total={file.totalTransactions}
            processed={file.processedCount}
            rejected={file.rejectedCount}
          />
          <Button
            variant="outlined"
            size="small"
            fullWidth
            startIcon={<VisibilityIcon />}
            onClick={() => navigate(`/transactions/${file.id}`)}
            sx={{ minHeight: 44 }}
          >
            Ver transacciones
          </Button>
        </>
      )}
    />
  );

  return (
    <Box>
      <Box display="flex" alignItems="flex-start" mb={3} sx={{ pl: { xs: 2, sm: 3 } }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Archivos Procesados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Historial de todos los archivos de transacciones procesados
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchProcessed}
          disabled={loading}
          loading={loading}
          loadingPosition="start"
          sx={{ ml: 'auto', mr: 0 }}
          aria-label="Actualizar lista de archivos procesados"
        >
          Actualizar
        </Button>
      </Box>

      <Paper sx={{ mx: { xs: 2, sm: 3 } }}>
        {loading && processedFiles.length === 0 ? (
          <LoadingState message="Cargando archivos procesados..." />
        ) : error && processedFiles.length === 0 ? (
          <ErrorState message={error} onRetry={fetchProcessed} />
        ) : processedFiles.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No hay archivos procesados"
            description="Los archivos procesados aparecerán aquí una vez que proceses un archivo de transacciones desde la sección Archivos Disponibles."
            action={
              <Button variant="contained" onClick={() => navigate('/')}>
                Ir a Archivos Disponibles
              </Button>
            }
          />
        ) : (
          <>
            {error && processedFiles.length > 0 && (
              <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
                <Alert
                  severity="error"
                  variant="outlined"
                  action={
                    <Button color="error" size="small" onClick={fetchProcessed}>
                      Reintentar
                    </Button>
                  }
                >
                  No se pudo actualizar la lista: {error}
                </Alert>
              </Box>
            )}
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                pt: 2,
                pb: 1,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Todos (${processedFiles.length})`}
                  color="primary"
                  variant={statusFilter === null ? 'filled' : 'outlined'}
                  onClick={() => setStatusFilter(null)}
                />
                <Chip
                  label={`Exitosos (${statusCounts.EXITOSO})`}
                  color="success"
                  variant={statusFilter === 'EXITOSO' ? 'filled' : 'outlined'}
                  onClick={() => setStatusFilter('EXITOSO')}
                />
                <Chip
                  label={`Con errores (${statusCounts.ERRORES})`}
                  color="warning"
                  variant={statusFilter === 'ERRORES' ? 'filled' : 'outlined'}
                  onClick={() => setStatusFilter('ERRORES')}
                  sx={statusFilter !== 'ERRORES' ? { color: 'warning.dark', borderColor: 'warning.dark' } : undefined}
                />
                <Chip
                  label={`Críticos (${statusCounts.CRITICO})`}
                  color="error"
                  variant={statusFilter === 'CRITICO' ? 'filled' : 'outlined'}
                  onClick={() => setStatusFilter('CRITICO')}
                />
              </Box>
              <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre de archivo..."
                size="small"
                fullWidth
                sx={{ maxWidth: 320 }}
                aria-label="Buscar archivos procesados"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            {isMobile ? (
              visibleFiles.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron archivos con el término &quot;{searchQuery}&quot;
                  </Typography>
                </Box>
              ) : (
                renderCards
              )
            ) : (
              <TableContainer>
              <Table aria-label="Tabla de archivos procesados">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 240 }}>
                      <TableSortLabel {...sortLabelProps('filename')}>Archivo</TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel {...sortLabelProps('processedDate')}>Fecha</TableSortLabel>
                    </TableCell>
                    <TableCell>Resultado</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleFiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
        <Typography variant="body2" color="text.secondary">
          No se encontraron archivos con el término &quot;{searchQuery}&quot;
        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleFiles.map((file) => (
                      <TableRow
                        key={file.id}
                        hover
                        sx={{ '&:last-child td': { borderBottom: 0 } }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            <DescriptionIcon
                              sx={{ color: 'primary.light', fontSize: 20, verticalAlign: 'middle', mr: 0.5 }}
                            />
                            {file.filename}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(file.processedDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <ResultCell
                            total={file.totalTransactions}
                            processed={file.processedCount}
                            rejected={file.rejectedCount}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={file.status} />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver transacciones" arrow>
                            <IconButton
                              color="primary"
                              onClick={() => navigate(`/transactions/${file.id}`)}
                              aria-label={`Ver transacciones de ${file.filename}`}
                              size="small"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
