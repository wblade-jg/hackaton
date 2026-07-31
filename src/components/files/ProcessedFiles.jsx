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
import TableSkeleton from '../common/TableSkeleton';
import ErrorState from '../common/ErrorState';
import PageHeader from '../common/PageHeader';
import CardList from '../common/CardList';
import { formatDate } from '../../utils/format';

const STATUS_FILTERS = [
  { key: null, label: 'Todos', rule: 'primary.main' },
  { key: 'EXITOSO', label: 'Exitosos', rule: 'success.main' },
  { key: 'ERRORES', label: 'Con errores', rule: 'warning.dark' },
  { key: 'CRITICO', label: 'Críticos', rule: 'error.main' },
];

function ResultLine({ total, processed, rejected }) {
  const processedPct = total ? (processed / total) * 100 : 0;
  const rejectedPct = total ? (rejected / total) * 100 : 0;
  const showRing = processedPct > 0 && rejectedPct > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 190 }}>
      <Box
        role="img"
        aria-label={`${processed} de ${total} transacciones procesadas, ${rejected} rechazadas`}
        sx={{ position: 'relative', display: 'flex', height: 8, borderRadius: 2, overflow: 'hidden', backgroundColor: 'divider' }}
      >
        <Box sx={{ width: `${processedPct}%`, backgroundColor: 'success.main', transition: 'width 0.25s ease-out' }} />
        <Box sx={{ width: `${rejectedPct}%`, backgroundColor: 'error.main', transition: 'width 0.25s ease-out' }} />
        {showRing && (
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              left: `calc(${processedPct}% - 5px)`,
              top: '50%',
              width: 10,
              height: 10,
              transform: 'translateY(-50%)',
              borderRadius: '50%',
              border: '2px solid',
              borderColor: 'background.paper',
              backgroundColor: 'divider',
            }}
          />
        )}
      </Box>
      <Typography variant="body2" color="text.secondary">
        {total} total &middot;{' '}
        <Typography component="span" variant="body2" color="success.dark" sx={{ fontWeight: 600 }}>
          {processed} OK
        </Typography>{' '}
        &middot;{' '}
        <Typography component="span" variant="body2" color="error.dark" sx={{ fontWeight: 600 }}>
          {rejected} rechazadas
        </Typography>
      </Typography>
    </Box>
  );
}

ResultLine.propTypes = {
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
          <ResultLine
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
      <PageHeader
        title="Archivos Procesados"
        subtitle="Historial de todos los archivos de transacciones procesados"
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchProcessed}
            disabled={loading}
            loading={loading}
            loadingPosition="start"
            aria-label="Actualizar lista de archivos procesados"
          >
            Actualizar
          </Button>
        }
      />

      {loading && processedFiles.length === 0 ? (
        <TableSkeleton rows={5} columns={4} />
      ) : error && processedFiles.length === 0 ? (
        <Paper sx={{ mx: { xs: 2, sm: 3 } }}>
          <ErrorState message={error} onRetry={fetchProcessed} />
        </Paper>
      ) : processedFiles.length === 0 ? (
        <Paper sx={{ mx: { xs: 2, sm: 3 } }}>
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
        </Paper>
      ) : (
        <Paper sx={{ mx: { xs: 2, sm: 3 } }}>
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
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 1.5,
            }}
            role="group"
            aria-label="Filtrar por estado"
          >
            {STATUS_FILTERS.map((filter) => {
              const count =
                filter.key === null
                  ? processedFiles.length
                  : statusCounts[filter.key] ?? 0;
              const selected = statusFilter === filter.key;
              return (
                <Button
                  key={filter.key ?? 'todos'}
                  onClick={() => setStatusFilter(filter.key)}
                  aria-pressed={selected}
                  disableRipple
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    gap: 0.5,
                    p: 1.5,
                    minHeight: 72,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: selected ? 'primary.main' : 'divider',
                    borderTop: '3px solid',
                    borderTopColor: selected ? filter.rule : 'divider',
                    backgroundColor: selected ? '#F4F8FD' : 'background.paper',
                    color: 'text.primary',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: selected ? '#EAF2FB' : 'rgba(22, 75, 125, 0.05)',
                    },
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
                    {count}
                  </Typography>
                  <Typography variant="label" sx={{ color: 'text.secondary' }}>
                    {filter.label}
                  </Typography>
                </Button>
              );
            })}
          </Box>

          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              pt: 2,
              pb: 1,
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <TextField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre de archivo..."
              size="small"
              fullWidth
              sx={{ maxWidth: 340 }}
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
                  No se encontraron archivos con los filtros seleccionados
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
                          No se encontraron archivos con los filtros seleccionados
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
                              sx={{ color: 'primary.light', fontSize: 20, verticalAlign: 'middle', mr: 1 }}
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
                          <ResultLine
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
        </Paper>
      )}
    </Box>
  );
}
