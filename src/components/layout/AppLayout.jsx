import { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import HistoryIcon from '@mui/icons-material/History';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const DRAWER_WIDTH = 264;

const navItems = [
  { label: 'Archivos Disponibles', path: '/', icon: FolderOpenIcon },
  { label: 'Archivos Procesados', path: '/processed', icon: HistoryIcon },
];

function BrandHeader() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2.5,
        py: 2.5,
      }}
    >
      <Box
        component="img"
        src="/favicon.svg"
        alt=""
        aria-hidden="true"
        sx={{ width: 36, height: 36, display: 'block' }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{ fontSize: '1.0625rem', lineHeight: 1.2, color: '#FFFFFF' }}>
          Compás
        </Typography>
        <Typography variant="caption" sx={{ color: '#8FA5C4', fontSize: '0.72rem' }}>
          Procesador de Transacciones
        </Typography>
      </Box>
    </Box>
  );
}

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = useMemo(() => {
    if (location.pathname === '/') return 'Archivos Disponibles';
    if (location.pathname === '/processed') return 'Archivos Procesados';
    if (location.pathname.startsWith('/transactions/')) return 'Transacciones';
    return 'Página no encontrada';
  }, [location.pathname]);

  useDocumentTitle(pageTitle);

  const breadcrumbs = useMemo(() => {
    if (location.pathname === '/') {
      return [{ label: 'Archivos Disponibles', path: '/' }];
    }
    if (location.pathname === '/processed') {
      return [{ label: 'Archivos Procesados', path: '/processed' }];
    }
    if (location.pathname.startsWith('/transactions/')) {
      return [
        { label: 'Archivos Procesados', path: '/processed' },
        { label: 'Transacciones', path: undefined },
      ];
    }
    return [{ label: 'Página no encontrada', path: undefined }];
  }, [location.pathname]);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <BrandHeader />

      <List sx={{ px: 1.5, pt: 1.5 }} role="navigation" aria-label="Navegación principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              selected={isActive}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: isActive ? '#FFFFFF' : '#C7D2E3',
                position: 'relative',
                pl: 2.5,
                '&:hover': {
                  backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.12)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '14%',
                    bottom: '14%',
                    width: 3,
                    borderRadius: 2,
                    backgroundColor: '#E8930C',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#FFFFFF',
                  },
                },
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                  minWidth: 40,
                },
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 400,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, backgroundColor: 'custom.sidebar' },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              borderRight: 'none',
              backgroundColor: 'custom.sidebar',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {(isMobile || breadcrumbs.length > 1) && (
          <AppBar
            position="sticky"
            color="default"
            elevation={0}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <Toolbar sx={{ gap: 1 }}>
              {isMobile && (
                <IconButton
                  edge="start"
                  onClick={() => setMobileOpen(true)}
                  sx={{ mr: 1 }}
                  aria-label="Abrir menú de navegación"
                >
                  <MenuIcon />
                </IconButton>
              )}
              {breadcrumbs.length > 1 && (
                <Breadcrumbs
                  separator={
                    <NavigateNextIcon sx={{ fontSize: 16, color: 'text.disabled' }} fontSize="small" />
                  }
                  aria-label="Ruta de navegación"
                >
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    if (isLast || !crumb.path) {
                      return (
                        <Typography
                          key={crumb.label}
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          {crumb.label}
                        </Typography>
                      );
                    }
                    return (
                      <MuiLink
                        key={crumb.label}
                        component={Link}
                        to={crumb.path}
                        underline="hover"
                        color="text.primary"
                        variant="body2"
                        sx={{ fontWeight: 500 }}
                      >
                        {crumb.label}
                      </MuiLink>
                    );
                  })}
                </Breadcrumbs>
              )}
            </Toolbar>
          </AppBar>
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            py: { xs: 2, sm: 3 },
            backgroundColor: 'background.default',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
