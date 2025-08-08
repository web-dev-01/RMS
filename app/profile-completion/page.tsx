'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField, Typography, Paper, Grid, CircularProgress, Avatar, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Person as PersonIcon, Phone as PhoneIcon, CloudUpload as UploadIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

const theme = { primaryColor: '#00ED64', secondaryColor: '#0A0F19' };

const StyledPaper = styled(Paper)(() => ({
  background: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
  padding: '24px',
}));

const StyledButton = styled(Button)(() => ({
  background: theme.primaryColor,
  color: theme.secondaryColor,
  borderRadius: '8px',
  fontWeight: 600,
  '&:hover': { background: '#00C653' },
  '&:disabled': { background: '#e0e0e0', color: '#999' },
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: theme.primaryColor } },
  '& .MuiInputLabel-root.Mui-focused': { color: theme.primaryColor },
}));

const UploadArea = styled(Box)<{ isDragging: boolean }>(({ isDragging }) => ({
  border: `2px dashed ${isDragging ? theme.primaryColor : '#e0e0e0'}`,
  borderRadius: '12px',
  padding: '16px',
  textAlign: 'center',
  backgroundColor: isDragging ? 'rgba(0, 237, 100, 0.05)' : '#fafafa',
  cursor: 'pointer',
}));

interface FormState { fullName: string; phoneNumber: string; }

export default function ProfileCompletionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formState, setFormState] = useState<FormState>({ fullName: '', phoneNumber: '' });
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    const email = Cookies.get('email');
    if (!email) {
      router.push('/login');
      return;
    }
    fetch(`/api/user-profile?email=${email}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFormState({ fullName: data.fullName || '', phoneNumber: data.phoneNumber || '' });
          setCroppedImage(data.image || null);
        }
      })
      .catch(() => setErrorMsg('Failed to load profile'))
      .finally(() => setInitialLoading(false));
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size should be less than 5MB'); toast.error('File size should be less than 5MB'); return;
      }
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file'); toast.error('Please select a valid image file'); return;
      }
      const reader = new FileReader();
      reader.onload = () => { setCroppedImage(reader.result as string); toast.success('Image uploaded successfully!'); };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]?.type.startsWith('image/')) {
      const file = e.dataTransfer.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size should be less than 5MB'); toast.error('File size should be less than 5MB'); return;
      }
      const reader = new FileReader();
      reader.onload = () => { setCroppedImage(reader.result as string); toast.success('Image uploaded successfully!'); };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formState.fullName.trim()) { setErrorMsg('Full name is required'); toast.error('Full name is required'); return false; }
    if (!/^\+?\d{10,15}$/.test(formState.phoneNumber.trim())) {
      setErrorMsg('Please enter a valid phone number (e.g., +919876543210)'); toast.error('Please enter a valid phone number'); return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true); setErrorMsg('');
    try {
      const email = Cookies.get('email');
      if (!email) throw new Error('No email found');
      const res = await fetch(`/api/user-profile?email=${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: formState.fullName, phoneNumber: formState.phoneNumber, image: croppedImage }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to save profile');
      toast.success('Profile saved successfully!');
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      setErrorMsg(message); toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress sx={{ color: theme.primaryColor }} /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', py: 4, px: 2, background: '#f4f4f4' }}>
      <StyledPaper sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" sx={{ textAlign: 'center', mb: 2, fontWeight: 600 }}>Complete Your Profile</Typography>
        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledTextField fullWidth label="Full Name" name="fullName" value={formState.fullName} onChange={handleInputChange} error={!!errorMsg && !formState.fullName.trim()} InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, color: '#999' }} /> }} />
            <StyledTextField fullWidth label="Phone Number" name="phoneNumber" value={formState.phoneNumber} onChange={handleInputChange} error={!!errorMsg && !formState.phoneNumber.trim()} sx={{ mt: 2 }} InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, color: '#999' }} /> }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <UploadArea isDragging={isDragging} onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onClick={() => fileInputRef.current?.click()}>
              <UploadIcon sx={{ fontSize: 40, color: isDragging ? theme.primaryColor : '#999' }} />
              <Typography sx={{ fontWeight: 600 }}>Upload Profile Picture</Typography>
              <Typography sx={{ color: '#666', fontSize: '0.85rem' }}>Click or drag and drop (Max 5MB, JPG/PNG)</Typography>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onSelectFile} />
            </UploadArea>
            {croppedImage && <Avatar src={croppedImage} sx={{ width: 80, height: 80, mt: 2, mx: 'auto', border: `2px solid ${theme.primaryColor}` }} />}
          </Grid>
        </Grid>
        <StyledButton fullWidth onClick={handleSubmit} disabled={loading || !formState.fullName.trim() || !formState.phoneNumber.trim()} sx={{ mt: 3, py: 1.2 }}>
          {loading ? <CircularProgress size={24} sx={{ color: theme.secondaryColor }} /> : <><CheckIcon sx={{ mr: 1 }} />Save Profile</>}
        </StyledButton>
      </StyledPaper>
    </Box>
  );
}