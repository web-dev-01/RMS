'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Slider,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Phone as PhoneIcon,
  CloudUpload as UploadIcon,
  Crop as CropIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  RotateRight as RotateIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as ResetIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const theme = { primaryColor: '#00ED64', secondaryColor: '#0A0F19' };

const StyledPaper = styled(Paper)(() => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  borderRadius: '24px',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  overflow: 'hidden',
}));

const StyledHeader = styled(Box)(() => ({
  background: `radial-gradient(circle at top left, ${theme.primaryColor}cc, #00C653 100%)`,
  padding: '24px',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '150px',
    height: '150px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
  },
}));

const StyledButton = styled(Button)(() => ({
  background: `linear-gradient(90deg, ${theme.primaryColor}cc, ${theme.primaryColor}ee)`,
  color: theme.secondaryColor,
  fontWeight: 700,
  borderRadius: '12px',
  textTransform: 'none',
  '&:hover': {
    background: `linear-gradient(90deg, ${theme.primaryColor}ee, ${theme.primaryColor}cc)`,
    boxShadow: `0 0 12px 4px ${theme.primaryColor}44`,
  },
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '&.Mui-focused fieldset': { borderColor: theme.primaryColor, borderWidth: '2px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: theme.primaryColor },
  '& .MuiInputBase-input': { fontFamily: "'Inter', sans-serif" },
}));

const UploadArea = styled(Box)<{ isDragging: boolean }>(({ isDragging }) => ({
  border: `2px dashed ${isDragging ? theme.primaryColor : '#e0e0e0'}`,
  borderRadius: '16px',
  padding: '24px',
  textAlign: 'center',
  backgroundColor: isDragging ? 'rgba(0, 237, 100, 0.05)' : '#fafafa',
  cursor: 'pointer',
  '&:hover': { borderColor: theme.primaryColor },
}));

const CropContainer = styled(Box)(() => ({
  position: 'relative',
  width: '400px',
  height: '400px',
  background: 'linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)',
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  borderRadius: '16px',
  overflow: 'hidden',
  margin: '0 auto',
}));

const CropOverlay = styled(Box)(() => ({
  position: 'absolute',
  width: '250px',
  height: '250px',
  border: `4px solid ${theme.primaryColor}`,
  borderRadius: '50%',
  zIndex: 10,
  pointerEvents: 'none',
  boxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.4)',
}));

interface FormState {
  fullName: string;
  phoneNumber: string;
}

interface CropState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export default function ProfileDetailsPage() {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();

  const [formState, setFormState] = useState<FormState>({ fullName: '', phoneNumber: '' });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showCropModal, setShowCropModal] = useState<boolean>(false);
  const [cropState, setCropState] = useState<CropState>({ x: 0, y: 0, scale: 1, rotation: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const email = Cookies.get('email');
      if (email) {
        try {
          const res = await fetch(`/api/user-profile?email=${email}`);
          if (res.ok) {
            const data = await res.json();
            setFormState({ fullName: data.fullName || '', phoneNumber: data.phoneNumber || '' });
            setCroppedImage(data.image || null);
          } else {
            setErrorMsg('Failed to load profile data.');
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
          setErrorMsg('Failed to load profile data.');
        } finally {
          setLoading(false);
        }
      } else {
        setErrorMsg('User not authenticated.');
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size should be less than 5MB');
        return;
      }
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
        img.onload = () => {
          if (img.width < 250 || img.height < 250) {
            setErrorMsg('Image must be at least 250x250 pixels');
            return;
          }
          setSelectedImage(reader.result as string);
          setCroppedImage(null);
          setCropState({ x: 0, y: 0, scale: 1, rotation: 0 });
          setShowCropModal(true);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]?.type.startsWith('image/')) {
      const file = e.dataTransfer.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size should be less than 5MB');
        return;
      }
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
        img.onload = () => {
          if (img.width < 250 || img.height < 250) {
            setErrorMsg('Image must be at least 250x250 pixels');
            return;
          }
          setSelectedImage(reader.result as string);
          setCroppedImage(null);
          setCropState({ x: 0, y: 0, scale: 1, rotation: 0 });
          setShowCropModal(true);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
    setDragStart({ x: e.clientX - cropState.x, y: e.clientY - cropState.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDraggingImage) {
        setCropState(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
      }
    },
    [isDraggingImage, dragStart]
  );

  const handleMouseUp = useCallback(() => setIsDraggingImage(false), []);

  useEffect(() => {
    if (isDraggingImage) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingImage, handleMouseMove, handleMouseUp]);

  const getCroppedImg = () => {
    const image = imgRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas || !canvas.getContext('2d')) return;

    const ctx = canvas.getContext('2d')!;
    const cropSize = 250;
    canvas.width = canvas.height = cropSize;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, 2 * Math.PI);
    ctx.clip();
    ctx.clearRect(0, 0, cropSize, cropSize);
    ctx.translate(cropSize / 2, cropSize / 2);
    ctx.rotate((cropState.rotation * Math.PI) / 180);
    ctx.scale(cropState.scale, cropState.scale);
    ctx.drawImage(image, -image.naturalWidth / 2 + cropState.x / cropState.scale, -image.naturalHeight / 2 + cropState.y / cropState.scale);
    ctx.restore();

    canvas.toBlob(blob => {
      if (blob) {
        setCroppedImage(URL.createObjectURL(blob));
        setShowCropModal(false);
      }
    }, 'image/jpeg', 0.95);
  };

  const resetCrop = () => setCropState({ x: 0, y: 0, scale: 1, rotation: 0 });

  const validateForm = () => {
    if (!formState.fullName.trim()) {
      setErrorMsg('Full name is required');
      return false;
    }
    if (!formState.phoneNumber.trim() || !/^\+?\d{10,15}$/.test(formState.phoneNumber.trim())) {
      setErrorMsg('Please enter a valid phone number (e.g., +919876543210)');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const email = Cookies.get('email');
      if (!email) throw new Error('Email not found');
      const res = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName: formState.fullName, phoneNumber: formState.phoneNumber, image: croppedImage }),
      });
      if (res.ok) {
        setIsEditing(false);
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: `radial-gradient(circle at top left, ${theme.primaryColor}22, transparent 70%)`, py: 8, px: { xs: 3, md: 6 } }}>
      <StyledPaper sx={{ maxWidth: 1000, mx: 'auto' }}>
        <StyledHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, background: 'white', borderRadius: '12px', p: 1 }}>
                <img src="/logo.png" alt="IPIPS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '1.25rem' }}>IPIPS - Railway Management System</Typography>
                <Typography sx={{ fontFamily: "'Inter', sans-serif", opacity: 0.8, fontSize: '0.75rem' }}>Integrated Passenger Information System</Typography>
              </Box>
            </Box>
          </Box>
          <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, mb: 1 }}>Your Profile</Typography>
          <Typography sx={{ fontFamily: "'Inter', sans-serif", opacity: 0.9, fontSize: '1rem' }}>Manage your personal information</Typography>
        </StyledHeader>
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <CircularProgress sx={{ color: theme.primaryColor }} />
            </Box>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon sx={{ color: theme.primaryColor, fontSize: 32 }} />
                <Typography sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: theme.secondaryColor, fontSize: '1.5rem' }}>Operator Information</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {isEditing ? (
                  <>
                    <Box>
                      <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: theme.secondaryColor, mb: 1, fontSize: '0.9rem' }}>Full Name *</Typography>
                      <StyledTextField fullWidth name="fullName" value={formState.fullName} onChange={handleInputChange} placeholder="Enter your full name" InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, color: '#999' }} /> }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: theme.secondaryColor, mb: 1, fontSize: '0.9rem' }}>Phone Number *</Typography>
                      <StyledTextField fullWidth name="phoneNumber" value={formState.phoneNumber} onChange={handleInputChange} placeholder="+919876543210" InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, color: '#999' }} /> }} />
                    </Box>
                    {errorMsg && <Alert severity="error" sx={{ borderRadius: '12px', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }}>{errorMsg}</Alert>}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <StyledButton fullWidth onClick={handleSubmit} disabled={loading} sx={{ mt: 2, py: 1.2, fontFamily: "'Inter', sans-serif", fontSize: '1rem' }}>
                        {loading ? <CircularProgress size={24} sx={{ color: theme.secondaryColor }} /> : <><CheckIcon sx={{ mr: 1 }} />Save Changes</>}
                      </StyledButton>
                      <Button fullWidth variant="outlined" onClick={() => setIsEditing(false)} sx={{ mt: 2, py: 1.2, borderColor: theme.primaryColor, color: theme.primaryColor, fontFamily: "'Inter', sans-serif", fontSize: '1rem', '&:hover': { backgroundColor: `${theme.primaryColor}11` } }}>
                        Cancel
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: theme.secondaryColor, fontSize: '1rem' }}>Full Name: {formState.fullName}</Typography>
                    <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: theme.secondaryColor, fontSize: '1rem', mt: 1 }}>Phone Number: {formState.phoneNumber}</Typography>
                    <StyledButton fullWidth onClick={() => setIsEditing(true)} sx={{ mt: 2, py: 1.2, fontFamily: "'Inter', sans-serif", fontSize: '1rem' }}>
                      Edit Profile
                    </StyledButton>
                  </>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <UploadIcon sx={{ color: theme.primaryColor, fontSize: 32 }} />
                <Typography sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: theme.secondaryColor, fontSize: '1.5rem' }}>Profile Picture</Typography>
              </Box>
              <Card sx={{ borderRadius: '16px', mt: 2, boxShadow: `0 0 12px 4px ${theme.primaryColor}22` }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontFamily: "'Inter', sans-serif", color: theme.secondaryColor, mb: 1, fontWeight: 600, fontSize: '1rem' }}>Profile Preview</Typography>
                  <Avatar src={croppedImage || ''} sx={{ width: 80, height: 80, mx: 'auto', border: `3px solid ${theme.primaryColor}`, mb: 1 }} />
                  {isEditing && (
                    <UploadArea isDragging={isDragging} onDrop={handleDrop} onDragOver={(e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onClick={() => fileInputRef.current?.click()}>
                      <UploadIcon sx={{ fontSize: 32, color: '#999', mb: 1 }} />
                      <Typography sx={{ fontFamily: "'Inter', sans-serif", color: theme.secondaryColor, fontWeight: 600, fontSize: '1rem' }}>Change your image</Typography>
                      <Typography sx={{ fontFamily: "'Inter', sans-serif", color: '#666', fontSize: '0.9rem' }}>Click or drag and drop (Max 5MB, JPG/PNG, min 250x250px)</Typography>
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onSelectFile} />
                    </UploadArea>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>
      <Dialog open={showCropModal} onClose={() => setShowCropModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px', background: '#f8f9fa' } }}>
        <DialogTitle sx={{ textAlign: 'center', fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: theme.secondaryColor, fontSize: '1.5rem' }}>Crop Profile Picture</DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          {selectedImage && (
            <Box>
              <CropContainer>
                <CropOverlay />
                <img ref={imgRef} src={selectedImage} alt="Crop preview" style={{ position: 'absolute', cursor: 'move', maxWidth: 'none', transform: `translate(${cropState.x}px, ${cropState.y}px) scale(${cropState.scale}) rotate(${cropState.rotation}deg)` }} onMouseDown={handleMouseDown} draggable={false} />
              </CropContainer>
              <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <IconButton onClick={() => setCropState(prev => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.1) }))} sx={{ color: theme.primaryColor }}><ZoomOutIcon /></IconButton>
                <IconButton onClick={() => setCropState(prev => ({ ...prev, scale: Math.min(3, prev.scale + 0.1) }))} sx={{ color: theme.primaryColor }}><ZoomInIcon /></IconButton>
                <IconButton onClick={() => setCropState(prev => ({ ...prev, rotation: prev.rotation - 15 }))} sx={{ color: theme.primaryColor }}><RotateIcon sx={{ transform: 'scaleX(-1)' }} /></IconButton>
                <IconButton onClick={() => setCropState(prev => ({ ...prev, rotation: prev.rotation + 15 }))} sx={{ color: theme.primaryColor }}><RotateIcon /></IconButton>
                <IconButton onClick={resetCrop} sx={{ color: theme.primaryColor }}><ResetIcon /></IconButton>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: theme.secondaryColor, mb: 1, fontSize: '0.9rem' }}>Zoom: {Math.round(cropState.scale * 100)}%</Typography>
                <Slider value={cropState.scale} onChange={(_, v) => setCropState(prev => ({ ...prev, scale: v as number }))} min={0.5} max={3} step={0.1} sx={{ color: theme.primaryColor }} />
                <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: theme.secondaryColor, mb: 1, mt: 1, fontSize: '0.9rem' }}>Rotation: {cropState.rotation}°</Typography>
                <Slider value={cropState.rotation} onChange={(_, v) => setCropState(prev => ({ ...prev, rotation: v as number }))} min={-180} max={180} step={15} sx={{ color: theme.primaryColor }} />
              </Box>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Avatar src={selectedImage} sx={{ width: 60, height: 60, mx: 'auto', border: `2px solid ${theme.primaryColor}` }} style={{ transform: `scale(${cropState.scale}) rotate(${cropState.rotation}deg)` }} />
                <Typography sx={{ fontFamily: "'Inter', sans-serif", color: '#666', fontSize: '0.8rem', mt: 1 }}>Live Preview</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowCropModal(false)} sx={{ borderRadius: '8px', fontFamily: "'Inter', sans-serif", color: theme.primaryColor, borderColor: theme.primaryColor, fontSize: '0.9rem', '&:hover': { backgroundColor: `${theme.primaryColor}11` } }} variant="outlined">Cancel</Button>
          <StyledButton onClick={getCroppedImg} startIcon={<CheckIcon />} sx={{ fontSize: '0.9rem' }}>Apply Crop</StyledButton>
        </DialogActions>
      </Dialog>
      <Box sx={{ textAlign: 'center', mt: 4, borderTop: `1px solid ${theme.primaryColor}44`, pt: 2 }}>
        <Typography sx={{ fontFamily: "'Inter', sans-serif", color: 'text.secondary', fontSize: '0.95rem' }}>© 2025 TIC Kolkata | All Rights Reserved</Typography>
      </Box>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  );
}