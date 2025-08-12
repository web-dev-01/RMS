'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Avatar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';

const theme = {
  primaryColor: '#00ED64',
  secondaryColor: '#0A0F19',
  background: '#0A0F19', // updated background
  cardBackground: '#1e1e1e',
};

const StyledPaper = styled(Paper)(() => ({
  background: theme.cardBackground,
  borderRadius: 16,
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.7)',
  padding: 24,
  color: '#fff',
}));

const StyledButton = styled(Button)(() => ({
  background: theme.primaryColor,
  color: theme.secondaryColor,
  borderRadius: 8,
  fontWeight: 600,
  '&:hover': { background: '#00C653' },
  '&:disabled': { background: '#3a3a3a', color: '#999' },
  textTransform: 'none',
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&.Mui-focused fieldset': { borderColor: theme.primaryColor },
    color: '#fff',
    backgroundColor: '#2a2a2a',
  },
  '& .MuiInputLabel-root': { color: '#bbb' },
  '& .MuiInputLabel-root.Mui-focused': { color: theme.primaryColor },
  '& .MuiInputBase-input': { color: '#fff' },
}));

const UploadArea = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDragging',
})<{ isDragging: boolean }>(({ isDragging }) => ({
  border: `2px dashed ${isDragging ? theme.primaryColor : '#555'}`,
  borderRadius: 12,
  padding: 16,
  textAlign: 'center',
  backgroundColor: isDragging ? 'rgba(0, 237, 100, 0.1)' : '#222',
  cursor: 'pointer',
  color: '#ccc',
  userSelect: 'none',
  transition: 'background-color 0.3s, border-color 0.3s',
}));

interface FormState {
  email: string;
  fullName: string;
  phoneNumber: string;
}

export default function ProfileCompletionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formState, setFormState] = useState<FormState>({
    email: '',
    fullName: '',
    phoneNumber: '',
  });
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Cropper state
  const [croppingOpen, setCroppingOpen] = React.useState(false);
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<{
    width: number;
    height: number;
    x: number;
    y: number;
  } | null>(null);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg('');
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formState.email.trim()) {
      setErrorMsg('Email is required');
      toast.error('Email is required');
      return false;
    }
    if (!formState.fullName.trim()) {
      setErrorMsg('Full name is required');
      toast.error('Full name is required');
      return false;
    }
    if (!/^\+?\d{10,15}$/.test(formState.phoneNumber.trim())) {
      setErrorMsg('Please enter a valid phone number (e.g., +919876543210)');
      toast.error('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  // File validation
  const validateImageFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file (JPG, PNG, etc.)';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'File size should be less than 5MB';
    }
    return null;
  };

  // Handle file selection and open cropper dialog
  const handleFileSelection = (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      setErrorMsg(error);
      toast.error(error);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setCroppingOpen(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFileSelection(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  // Crop complete callback
  const onCropComplete = useCallback(
    (croppedArea: any, croppedPixels: any) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  // Show cropped image preview and close crop dialog
  const showCroppedImage = useCallback(async () => {
    if (!rawImage || !croppedAreaPixels) return;

    try {
      const croppedImg = await getCroppedImg(rawImage, croppedAreaPixels);
      setCroppedImage(croppedImg);
      setCroppingOpen(false);
      toast.success('Image cropped successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to crop image');
    }
  }, [croppedAreaPixels, rawImage]);

  // Cancel cropping
  const cancelCropping = () => {
    setCroppingOpen(false);
    setRawImage(null);
  };

  // Submit profile update
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/user-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formState.email.trim(),
          fullName: formState.fullName.trim(),
          phoneNumber: formState.phoneNumber.trim(),
          image: croppedImage || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save profile');

      toast.success('Profile saved successfully!');
      router.push('/dashboard');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Something went wrong';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isSaveDisabled =
    loading ||
    !formState.email.trim() ||
    !formState.fullName.trim() ||
    !formState.phoneNumber.trim();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        px: 2,
        backgroundColor: theme.background,
        color: '#fff',
      }}
    >
      <StyledPaper sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography
          variant="h4"
          sx={{ textAlign: 'center', mb: 2, fontWeight: 600 }}
          component="h1"
        >
          Complete Your Profile
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            {errorMsg}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledTextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleInputChange}
              error={!!errorMsg && !formState.email.trim()}
              inputProps={{ 'aria-label': 'Email Address' }}
              autoComplete="email"
              sx={{ mb: 2 }}
            />

            <StyledTextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formState.fullName}
              onChange={handleInputChange}
              error={!!errorMsg && !formState.fullName.trim()}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: '#999' }} />,
              }}
              inputProps={{ 'aria-label': 'Full Name' }}
              autoComplete="name"
            />
            <StyledTextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formState.phoneNumber}
              onChange={handleInputChange}
              error={!!errorMsg && !formState.phoneNumber.trim()}
              sx={{ mt: 2 }}
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: '#999' }} />,
              }}
              inputProps={{ 'aria-label': 'Phone Number' }}
              autoComplete="tel"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <UploadArea
              isDragging={isDragging}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload Profile Picture"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click();
                }
              }}
            >
              <UploadIcon
                sx={{
                  fontSize: 40,
                  color: isDragging ? theme.primaryColor : '#999',
                }}
              />
              <Typography sx={{ fontWeight: 600, color: '#ccc' }}>
                Upload Profile Picture
              </Typography>
              <Typography sx={{ color: '#888', fontSize: '0.85rem' }}>
                Click or drag and drop (Max 5MB, JPG/PNG)
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={onSelectFile}
                aria-hidden="true"
              />
            </UploadArea>

            {croppedImage && (
              <Avatar
                src={croppedImage}
                alt="Profile Picture Preview"
                sx={{
                  width: 80,
                  height: 80,
                  mt: 2,
                  mx: 'auto',
                  border: `2px solid ${theme.primaryColor}`,
                }}
              />
            )}
          </Grid>
        </Grid>

        <StyledButton
          fullWidth
          onClick={handleSubmit}
          disabled={isSaveDisabled}
          sx={{ mt: 3, py: 1.2 }}
          aria-disabled={isSaveDisabled}
          aria-busy={loading}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: theme.secondaryColor }} />
          ) : (
            <>
              <CheckIcon sx={{ mr: 1 }} />
              Save Profile
            </>
          )}
        </StyledButton>

        {/* Crop Dialog */}
        <Dialog
          open={croppingOpen}
          onClose={cancelCropping}
          maxWidth="sm"
          fullWidth
          aria-labelledby="crop-dialog-title"
        >
          <DialogTitle
            id="crop-dialog-title"
            sx={{ backgroundColor: theme.cardBackground, color: '#fff' }}
          >
            Crop Profile Picture
          </DialogTitle>

          <DialogContent sx={{ position: 'relative', height: 360, backgroundColor: '#000' }}>
            {rawImage && (
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{ containerStyle: { borderRadius: '50%' } }}
              />
            )}

            <Box sx={{ mt: 2, px: 2 }}>
              <Typography variant="body2" sx={{ color: '#ccc', mb: 1 }}>
                Zoom
              </Typography>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-label="Zoom"
                onChange={(_, value) => setZoom(value as number)}
                sx={{ color: theme.primaryColor }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ backgroundColor: theme.cardBackground }}>
            <Button onClick={cancelCropping} sx={{ color: '#bbb' }} aria-label="Cancel cropping">
              Cancel
            </Button>
            <Button
              onClick={showCroppedImage}
              sx={{ color: theme.primaryColor }}
              aria-label="Crop and save image"
            >
              Crop & Save
            </Button>
          </DialogActions>
        </Dialog>
      </StyledPaper>
    </Box>
  );
}
