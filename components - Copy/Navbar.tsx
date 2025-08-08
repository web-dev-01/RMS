'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { styled } from '@mui/material/styles';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Info,
  Phone,
  LogIn,
} from 'lucide-react';
import Image from 'next/image';

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#1a2e2e',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  padding: '0.3rem 1rem',
  zIndex: 1000,
});

const LogoText = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontWeight: 700,
  fontSize: '1.3rem',
  color: '#00ED64',
  cursor: 'pointer',
});

const NavLink = styled(Button)({
  color: '#a0a0a0',
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    color: '#ffffff',
  },
});

const LoginButton = styled(Button)({
  backgroundColor: '#00ED64',
  color: '#1a2e2e',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: '#00ff80',
  },
});

const drawerStyle = {
  width: 250,
  backgroundColor: '#1a2e2e',
  height: '100%',
  color: '#ffffff',
  padding: '1rem',
};

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    backgroundColor: '#1a2e2e',
    padding: '2rem',
    borderRadius: '10px',
    color: '#ffffff',
  },
});

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    backgroundColor: '#2a3e3e',
    color: '#ffffff',
    borderRadius: '8px',
  },
  '& .MuiInputLabel-root': {
    color: '#a0a0a0',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#00ED64',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#00ff80',
  },
  marginBottom: '1.2rem',
});

interface NavbarProps {
  footerRef: React.RefObject<HTMLDivElement>;
}

const Navbar: React.FC<NavbarProps> = ({ footerRef }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = () => {
    setScrolled(window.scrollY > 10);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFooter = () => {
    footerRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (pathname !== '/') return null;

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Left: Logo */}
          <LogoText>
            <Image src="/logo.png" alt="logo" width={32} height={32} />
            RMS Server Tracking
          </LogoText>

          {/* Center: Desktop Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            <NavLink startIcon={<Home size={18} />} href="#">Home</NavLink>
            <NavLink startIcon={<Info size={18} />} href="#about">About</NavLink>
            <NavLink startIcon={<Phone size={18} />} onClick={scrollToFooter}>Contact Us</NavLink>
          </Box>

          {/* Right: Login & Mobile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LoginButton startIcon={<LogIn size={18} />} href="/login">
              Login
            </LoginButton>
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#a0a0a0' }}>
                <MenuIcon />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={drawerStyle}>
          <List>
            <ListItem button component="a" href="#" onClick={() => setMobileOpen(false)}>
              <ListItemIcon><Home color="#00ED64" size={18} /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button component="a" href="#about" onClick={() => setMobileOpen(false)}>
              <ListItemIcon><Info color="#00ED64" size={18} /></ListItemIcon>
              <ListItemText primary="About" />
            </ListItem>
            <ListItem button onClick={() => { scrollToFooter(); setMobileOpen(false); }}>
              <ListItemIcon><Phone color="#00ED64" size={18} /></ListItemIcon>
              <ListItemText primary="Contact Us" />
            </ListItem>
            <ListItem button component="a" href="/login" onClick={() => setMobileOpen(false)}>
              <ListItemIcon><LogIn color="#00ED64" size={18} /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Login Dialog (Optional - Not used yet) */}
      <StyledDialog open={loginOpen} onClose={() => setLoginOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ textAlign: 'center', color: '#00ED64', fontWeight: 600 }}>
          User Login
        </DialogTitle>
        <DialogContent>
          <StyledTextField fullWidth label="Email" variant="outlined" />
          <StyledTextField fullWidth label="Password" variant="outlined" type="password" />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2, backgroundColor: '#00ED64', color: '#1a2e2e', '&:hover': { backgroundColor: '#00ff80' } }}
            onClick={() => console.log('Login Clicked')}
          >
            Login
          </Button>
        </DialogContent>
      </StyledDialog>
    </>
  );
};

export default Navbar;
