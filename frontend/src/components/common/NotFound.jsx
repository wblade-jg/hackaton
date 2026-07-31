import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import EmptyState from './EmptyState';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <EmptyState
      icon={SearchOffIcon}
      title="Página no encontrada"
      description="La dirección que buscas no existe."
      action={
        <Button variant="contained" onClick={() => navigate('/')}>
          Ir al inicio
        </Button>
      }
    />
  );
}
