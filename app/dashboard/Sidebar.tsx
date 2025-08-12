'use client';

import React from 'react';
import {
  Box,
  Divider,
  Typography,
  Toolbar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Home,
  Train,
  Settings,
  Assignment,
  Notifications,
  AccountCircle,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

const drawerWidth = 280;

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  const palette = {
    background: '#0B1426',      // Deeper, more professional navy
    cardBg: '#1A2332',          // Subtle card background
    accent: '#2563EB',          // Professional blue
    accentHover: '#1D4ED8',     // Darker blue for hover
    textPrimary: '#F8FAFC',     // Clean white
    textSecondary: '#94A3B8',   // Muted gray
    textTertiary: '#64748B',    // Even more muted
    border: '#1E293B',          // Subtle borders
    hoverBg: '#1E2A3A',         // Hover state
    success: '#10B981',         // Status indicators
    warning: '#F59E0B',
    shadow: 'rgba(0, 0, 0, 0.25)',
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Home />, path: '/dashboard', badge: null },
    { text: 'Active Trains', icon: <Train />, path: '/rms/active-trains', badge: '12' },
    { text: 'Platforms & Devices', icon: <Settings />, path: '/rms/platforms-devices', badge: null },
    { text: 'System Logs', icon: <Assignment />, path: '/rms/event-logs', badge: null },
    { text: 'CAP Alerts', icon: <Notifications />, path: '/rms/cap-alerts', badge: '3' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Box
      sx={{
        width: drawerWidth,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: palette.background,
        color: palette.textPrimary,
        boxShadow: `4px 0 20px ${palette.shadow}`,
        borderRight: `1px solid ${palette.border}`,
      }}
    >
      {/* Header / Logo */}
      <Toolbar
        sx={{
          height: 80,
          bgcolor: palette.background,
          borderBottom: `1px solid ${palette.border}`,
          justifyContent: 'center',
          userSelect: 'none',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${palette.accent}, transparent)`,
          },
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: palette.accent,
              fontFamily: '"Inter", "Roboto", sans-serif',
              letterSpacing: '0.02em',
              fontSize: '1.5rem',
              mb: 0.5,
            }}
          >
            RMS CONTROL
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: palette.textTertiary,
              fontFamily: '"Inter", "Roboto", sans-serif',
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Railway Management System
          </Typography>
        </Box>
      </Toolbar>

      {/* User Info Section */}
      {user && (
        <Box
          sx={{
            p: 3,
            borderBottom: `1px solid ${palette.border}`,
            bgcolor: palette.cardBg,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: palette.accent,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              {user.name?.charAt(0)?.toUpperCase() || <AccountCircle />}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: palette.textPrimary,
                  fontSize: '0.95rem',
                  fontFamily: '"Inter", "Roboto", sans-serif',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name || 'User'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: palette.textSecondary,
                  fontSize: '0.8rem',
                  fontFamily: '"Inter", "Roboto", sans-serif',
                }}
              >
                Station Controller
              </Typography>
            </Box>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: palette.success,
                boxShadow: `0 0 0 2px ${palette.background}`,
              }}
            />
          </Box>
        </Box>
      )}

      {/* Scrollable Content Container */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollbarColor: `${palette.accent} transparent`,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: palette.cardBg,
            borderRadius: 3,
            marginTop: 1,
            marginBottom: 1,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: palette.accent,
            borderRadius: 3,
            border: `1px solid ${palette.background}`,
            '&:hover': {
              backgroundColor: palette.accentHover,
            },
          },
          '&::-webkit-scrollbar-corner': {
            background: palette.background,
          },
        }}
      >
        {/* Navigation Menu */}
        <Box
          sx={{
            px: 2,
            py: 3,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: palette.textTertiary,
              fontWeight: 600,
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              px: 2,
              mb: 2,
              display: 'block',
              fontFamily: '"Inter", "Roboto", sans-serif',
            }}
          >
            NAVIGATION
          </Typography>

          <List disablePadding sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <ListItemButton
                  key={item.text}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    px: 2.5,
                    py: 1.5,
                    position: 'relative',
                    bgcolor: isActive ? palette.cardBg : 'transparent',
                    border: isActive ? `1px solid ${palette.accent}20` : '1px solid transparent',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: isActive ? palette.cardBg : palette.hoverBg,
                      borderColor: isActive ? `${palette.accent}40` : `${palette.border}`,
                      transform: 'translateX(2px)',
                    },
                    '&::before': isActive
                      ? {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '3px',
                          height: '60%',
                          bgcolor: palette.accent,
                          borderRadius: '0 2px 2px 0',
                        }
                      : {},
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? palette.accent : palette.textSecondary,
                      minWidth: 40,
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.3rem',
                      },
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontFamily: '"Inter", "Roboto", sans-serif',
                        fontSize: '0.9rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? palette.textPrimary : palette.textSecondary,
                        transition: 'all 0.2s ease',
                      },
                    }}
                  />

                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        bgcolor: isActive ? palette.accent : palette.warning,
                        color: palette.background,
                        minWidth: 24,
                        '& .MuiChip-label': {
                          px: 1,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Box>

      {/* Footer */}
      <Divider sx={{ bgcolor: palette.border }} />
      <Box
        sx={{
          p: 3,
          bgcolor: palette.cardBg,
          borderTop: `1px solid ${palette.border}`,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: '"Inter", "Roboto", sans-serif',
            color: palette.textTertiary,
            fontSize: '0.8rem',
            textAlign: 'center',
            userSelect: 'none',
            fontWeight: 500,
          }}
        >
          © {new Date().getFullYear()} Indian Railways
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"Inter", "Roboto", sans-serif',
            color: palette.textTertiary,
            fontSize: '0.7rem',
            textAlign: 'center',
            display: 'block',
            mt: 0.5,
            opacity: 0.7,
          }}
        >
          Version 2.1.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
