'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Button,
  Grid,
  alpha,
  TextField,
  IconButton,
  Slider,
  Stack,
  Fade,
  Snackbar,
} from '@mui/material';
import { Email as EmailIcon, Phone as PhoneIcon, Edit as EditIcon, Save as SaveIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
import Cropper from 'react-easy-crop';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import { usePortalTheme } from '@/components/ThemeProvider';

const CropContainer = {
  position: 'relative',
  width: '100%',
  height: 300,
  background: '#333',
  marginBottom: 20,
  borderRadius: 8,
};

// Helper function for cropping image
const getCroppedImg = (imageSrc: string, pixelCrop: any): Promise<string> => {
  const canvas = document.createElement('canvas');
  const img = document.createElement('img');
  img.src = imageSrc;

  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas not supported');

      ctx.drawImage(
        img,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = reject;
  });
};

export default function ViewProfilePage() {
  const router = useRouter();
  const muiTheme = usePortalTheme();
  const primaryColor = muiTheme?.primaryColor || '#00ED64';
  const secondaryColor = '#0A0F19';
  const cardBackground = `linear-gradient(135deg, ${alpha('#1e1e1e', 0.95)}, ${alpha(primaryColor, 0.2)})`;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    email: string;
    fullName: string;
    phoneNumber: string;
    image: string | null;
  } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [imageSrc, setImageSrc] = useState<string>('');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [cropOpen, setCropOpen] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Login first please');
      router.push('/login');
      return;
    }
    try {
      const decoded: { id: string; email: string } = jwtDecode(token);
      setUserEmail(decoded.email);
    } catch {
      setError('Invalid token. Please login again.');
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router]);

  // Fetch profile
  useEffect(() => {
    if (!userEmail) return;
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/user-profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          setError('Login first please');
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        const profileData = {
          email: res.data.email,
          fullName: res.data.fullName || 'N/A',
          phoneNumber: res.data.phoneNumber || 'N/A',
          image: res.data.image || null,
        };
        setProfile(profileData);
        setFullName(profileData.fullName);
        setPhoneNumber(profileData.phoneNumber);
        setImageBase64(profileData.image || '');
      } catch (err: any) {
        console.error('Fetch profile error:', err);
        setError(err?.response?.data?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userEmail, router]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result as string);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setImageBase64(croppedImage);
      setCropOpen(false);
    } catch (e) {
      console.error('Crop error:', e);
      setError('Failed to crop image');
    }
  }, [imageSrc, croppedAreaPixels]);

  const handleSaveProfile = async () => {
    if (!fullName || !phoneNumber) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/user-profile',
        { fullName, phoneNumber, image: imageBase64 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 401) {
        setError('Login first please');
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      setProfile({
        email: res.data.user.email,
        fullName: res.data.user.fullName,
        phoneNumber: res.data.user.phoneNumber,
        image: res.data.user.image,
      });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setError(err?.response?.data?.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };

  const handleDashboardRedirect = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          minHeight: '100vh',
          backgroundColor: secondaryColor,
          backgroundImage: `radial-gradient(circle at top left, ${alpha(
            primaryColor,
            0.1
          )}, transparent 70%)`,
          px: 2,
        }}
      >
        <CircularProgress size={50} sx={{ color: primaryColor }} />
      </Grid>
    );
  }

  if (error && !isEditing) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          minHeight: '100vh',
          backgroundColor: secondaryColor,
          backgroundImage: `radial-gradient(circle at top left, ${alpha(
            primaryColor,
            0.1
          )}, transparent 70%)`,
          px: 2,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Grid>
    );
  }

  return (
    <Fade in timeout={800}>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          minHeight: '100vh',
          py: 4,
          px: 2,
          backgroundColor: secondaryColor,
          backgroundImage: `radial-gradient(circle at top left, ${alpha(
            primaryColor,
            0.1
          )}, transparent 70%)`,
        }}
      >
        <Grid item xs={12} sm={10} md={8} lg={6}>
          <Paper
            sx={{
              background: cardBackground,
              borderRadius: 16,
              boxShadow: `0 4px 20px ${alpha('#000', 0.3)}`,
              p: 4,
              minHeight: '600px',
              color: '#fff',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
              },
            }}
          >
            {/* Dashboard Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DashboardIcon />}
                onClick={handleDashboardRedirect}
                sx={{
                  borderColor: primaryColor,
                  color: primaryColor,
                  borderRadius: 8,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    background: alpha(primaryColor, 0.1),
                    borderColor: primaryColor,
                  },
                }}
              >
                Dashboard
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                src={isEditing ? imageBase64 : profile?.image || ''}
                alt={profile?.fullName || 'Profile Picture'}
                sx={{
                  width: 150,
                  height: 150,
                  margin: 'auto',
                  border: `4px solid ${primaryColor}`,
                }}
              />
              {isEditing && (
                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    mt: 2,
                    backgroundColor: primaryColor,
                    '&:hover': { backgroundColor: alpha(primaryColor, 0.8) },
                  }}
                >
                  Upload New Picture
                  <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
                </Button>
              )}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mt: 2,
                  background: `linear-gradient(45deg, ${primaryColor}, #fff)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {profile?.fullName || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mt: 1 }}>
                Your Profile
              </Typography>
            </Box>

            {cropOpen && isEditing && (
              <Box mt={3}>
                <Box sx={CropContainer}>
                  <IconButton
                    sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
                    onClick={() => setCropOpen(false)}
                  >
                    <CloseIcon sx={{ color: 'white' }} />
                  </IconButton>
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </Box>
                <Stack direction="row" spacing={2} alignItems="center" mt={2}>
                  <Typography sx={{ color: 'white' }}>Zoom:</Typography>
                  <Slider
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(_, value) => setZoom(value as number)}
                    sx={{ color: primaryColor }}
                  />
                  <Button
                    variant="contained"
                    onClick={showCroppedImage}
                    sx={{ backgroundColor: primaryColor, '&:hover': { backgroundColor: alpha(primaryColor, 0.8) } }}
                  >
                    Crop
                  </Button>
                </Stack>
              </Box>
            )}

            <Box sx={{ mb: 4 }}>
              {isEditing ? (
                <>
                  <TextField
                    label="Full Name"
                    fullWidth
                    margin="normal"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    sx={{
                      input: { color: 'white' },
                      label: { color: '#bbb' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: primaryColor },
                        '&:hover fieldset': { borderColor: alpha(primaryColor, 0.8) },
                      },
                    }}
                  />
                  <TextField
                    label="Phone Number"
                    fullWidth
                    margin="normal"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    sx={{
                      input: { color: 'white' },
                      label: { color: '#bbb' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: primaryColor },
                        '&:hover fieldset': { borderColor: alpha(primaryColor, 0.8) },
                      },
                    }}
                  />
                </>
              ) : (
                <Box sx={{ mt: 4 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ color: primaryColor, mb: 2 }}>
                        Contact Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: 3 }}>
                        <EmailIcon sx={{ color: primaryColor }} />
                        <Box>
                          <Typography variant="body2" sx={{ color: '#bbb' }}>
                            Email
                          </Typography>
                          <Typography variant="body1">{profile?.email}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: 3 }}>
                        <PhoneIcon sx={{ color: primaryColor }} />
                        <Box>
                          <Typography variant="body2" sx={{ color: '#bbb' }}>
                            Phone
                          </Typography>
                          <Typography variant="body1">{profile?.phoneNumber}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {/* Additional Profile Information */}
                  <Box sx={{ mt: 4, p: 3, backgroundColor: alpha('#000', 0.3), borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ color: primaryColor, mb: 2 }}>
                      Profile Details
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                      Last Updated: {new Date().toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                      Account Status: Active
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bbb' }}>
                      Profile Completion: {profile?.image && profile?.fullName !== 'N/A' && profile?.phoneNumber !== 'N/A' ? '100%' : '75%'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                sx={{
                  background: primaryColor,
                  color: secondaryColor,
                  borderRadius: 8,
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: alpha(primaryColor, 0.8),
                  },
                }}
                onClick={isEditing ? handleSaveProfile : toggleEditMode}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : isEditing ? (
                  'Save Profile'
                ) : (
                  'Edit Profile'
                )}
              </Button>
              {isEditing && (
                <Button
                  variant="outlined"
                  sx={{
                    ml: 2,
                    borderColor: primaryColor,
                    color: primaryColor,
                    borderRadius: 8,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      background: alpha(primaryColor, 0.1),
                    },
                  }}
                  onClick={toggleEditMode}
                >
                  Cancel
                </Button>
              )}
            </Box>

            <Snackbar
              open={!!error || !!success}
              autoHideDuration={6000}
              onClose={() => {
                setError('');
                setSuccess('');
              }}
            >
              <Alert
                severity={error ? 'error' : 'success'}
                onClose={() => {
                  setError('');
                  setSuccess('');
                }}
                sx={{ width: '100%' }}
              >
                {error || success}
              </Alert>
            </Snackbar>
          </Paper>
        </Grid>
      </Grid>
    </Fade>
  );
}