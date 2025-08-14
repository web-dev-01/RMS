'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Slider,
  Stack,
  CircularProgress,
  Grid,
  alpha,
} from '@mui/material';
import Cropper from 'react-easy-crop';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import { usePortalTheme } from '@/components/ThemeProvider';

const CropContainer = {
  position: 'relative',
  width: '100%',
  height: 300,
  background: '#333',
  marginBottom: 20,
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

export default function CompleteProfilePage() {
  const router = useRouter();
  const theme = usePortalTheme();
  const primaryColor = theme?.primaryColor || '#00ED64';
  const secondaryColor = '#0A0F19';

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [imageSrc, setImageSrc] = useState<string>('');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState('');

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

  // Check if profile is complete
  useEffect(() => {
    if (!userEmail) return;
    async function checkProfile() {
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
        const { data } = res;
        if (data.completed) {
          router.push('/dashboard');
          return;
        }
        setFullName(data.fullName || '');
        setPhoneNumber(data.phoneNumber || '');
        setImageBase64(data.image || '');
        setChecking(false);
      } catch (err: any) {
        console.error('Profile check error:', err);
        setError(err?.response?.data?.message || 'Error fetching profile');
        setChecking(false);
      }
    }
    checkProfile();
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
      alert('Profile saved successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Save profile error:', err);
      setError(err?.response?.data?.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const handleGoDashboard = () => {
    router.push('/dashboard');
  };

  if (checking) {
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
            0.07
          )}, transparent 60%)`,
          px: 2,
        }}
      >
        <CircularProgress sx={{ color: primaryColor }} />
      </Grid>
    );
  }

  if (error) {
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
            0.07
          )}, transparent 60%)`,
          px: 2,
        }}
      >
        <Typography color="error">{error}</Typography>
      </Grid>
    );
  }

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
          0.07
        )}, transparent 60%)`,
        px: 2,
      }}
    >
      <Grid item xs={12} sm={10} md={5} lg={4}>
        <Paper
          elevation={10}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.7)',
            backgroundColor: 'background.paper',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Image src="/logo.png" alt="Logo" width={120} height={60} />
          </Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            sx={{ color: primaryColor, mb: 3 }}
          >
            Complete Your Profile
          </Typography>

          {error && (
            <Typography color="error" textAlign="center" mb={2}>
              {error}
            </Typography>
          )}

          <TextField
            label="Full Name"
            fullWidth
            margin="normal"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            sx={{ input: { color: 'white' }, label: { color: 'white' }, mb: 2 }}
          />
          <TextField
            label="Phone Number"
            fullWidth
            margin="normal"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            sx={{ input: { color: 'white' }, label: { color: 'white' }, mb: 2 }}
          />

          <Box mt={3} textAlign="center">
            <Avatar
              src={imageBase64}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2, border: `2px solid ${primaryColor}` }}
            />
            <Button variant="contained" component="label" sx={{ backgroundColor: primaryColor }}>
              Upload Profile Picture
              <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
            </Button>
          </Box>

          {cropOpen && (
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
                />
                <Button
                  variant="contained"
                  onClick={showCroppedImage}
                  sx={{ backgroundColor: primaryColor }}
                >
                  Crop
                </Button>
              </Stack>
            </Box>
          )}

          <Stack direction="row" spacing={2} mt={4}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSaveProfile}
              disabled={loading}
              sx={{ backgroundColor: primaryColor }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Save Profile'
              )}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleGoDashboard}
              sx={{ borderColor: primaryColor, color: primaryColor }}
            >
              Go to Dashboard
            </Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}