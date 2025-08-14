//listen first i want to fill info on profile-completion page full name phone number and profile pic ok and if already existing we can go to dashbaord in  dshbord app tolbaar in view profile page mainly when i see my profile my profile is hsown to mee and i can update my porifle name and numberr to  got it
//2no plzz yr it is redirecting to me to login again after login  //listen first i want to fill info on profile-completion page full name phone number and profile pic ok and if already existing we can go to dashbaord in  dshbord app tolbaar in view profile page mainly when i see my profile my profile is hsown to mee and i can update my porifle name and numberr to  got it  import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// POST - create or update profile
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { fullName, phoneNumber, image, email } = await req.json();

    if (!fullName || !email) {
      return NextResponse.json(
        { message: 'Full name and email are required' },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { email },
      {
        fullName,
        phoneNumber: phoneNumber || '',
        image: image || null,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: 'Profile saved successfully',
      user: {
        fullName: user.fullName,
        phoneNumber: user.phoneNumber || '',
        image: user.image || null,
        email: user.email,
        completed: !!(user.fullName && user.phoneNumber && user.image),
      },
    });
  } catch (error: any) {
    console.error('Profile save error:', error.message, error.stack);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// GET - fetch profile by email
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { email } = Object.fromEntries(new URL(req.url).searchParams);

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'No user found' }, { status: 404 });
    }

    return NextResponse.json({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber || '',
      image: user.image || null,
      email: user.email,
      completed: !!(user.fullName && user.phoneNumber && user.image),
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error.message, error.stack);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } 'use client';
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
} from '@mui/material';
import Cropper from 'react-easy-crop';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';

const Logo = styled('div')({
  textAlign: 'center',
  marginBottom: 20,
});

const CropContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: 300,
  background: '#333',
  marginBottom: 20,
});

const primaryColor = "#00ED64";
const secondaryColor = "#0A0F19";

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

  // Check if profile already completed
  useEffect(() => {
    async function checkProfile() {
      try {
        const res = await fetch('/api/user-profile');
        const data = await res.json();
        if (data.fullName && data.phoneNumber) {
          setFullName(data.fullName);
          setPhoneNumber(data.phoneNumber);
          setImageBase64(data.image || '');
        }
        setChecking(false);
      } catch (err) {
        console.error(err);
        setChecking(false);
      }
    }
    checkProfile();
  }, []);

  // Handle image selection
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
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels]);

  const handleSaveProfile = async () => {
    if (!fullName || !phoneNumber) {
      alert('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phoneNumber, image: imageBase64 }),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      alert('Profile saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const handleGoDashboard = () => {
    router.push('/dashboard');
  };

  if (checking) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: secondaryColor,
        }}
      >
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: secondaryColor,
        p: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: '100%',
          maxWidth: 450,
          p: 4,
          borderRadius: 3,
          position: 'relative',
        }}
      >
        <Logo>
          <Image src="/logo.png" alt="Logo" width={120} height={60} />
        </Logo>
        <Typography variant="h5" mb={3} textAlign="center" sx={{ color: primaryColor }}>
          Complete Your Profile
        </Typography>

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
            sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
          />
          <Button variant="contained" component="label" sx={{ backgroundColor: primaryColor }}>
            Upload Profile Picture
            <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
          </Button>
        </Box>

        {cropOpen && (
          <Box mt={3}>
            <CropContainer>
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
            </CropContainer>
            <Stack direction="row" spacing={2} alignItems="center" mt={2}>
              <Typography sx={{ color: 'white' }}>Zoom:</Typography>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(_, value) => setZoom(value as number)}
              />
              <Button variant="contained" onClick={showCroppedImage} sx={{ backgroundColor: primaryColor }}>
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
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Save Profile'}
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
    </Box>
  );
}
  
}   'use client';
import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, TextField, Avatar, Button, CircularProgress, Slider, Stack, IconButton, Paper } from '@mui/material';
import Cropper from 'react-easy-crop';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';

const primaryColor = "#00ED64";
const secondaryColor = "#0A0F19";

const CropContainer = { position: 'relative', width: '100%', height: 300, background: '#333', marginBottom: 20 };

export default function EditableProfilePage() {
  const [profile, setProfile] = useState<{ fullName: string; phoneNumber: string; image: string | null }>({ fullName: '', phoneNumber: '', image: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Crop states
  const [imageSrc, setImageSrc] = useState<string>('');
  const [cropOpen, setCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [imageBase64, setImageBase64] = useState<string>('');

  // Fetch profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user-profile');
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile({ fullName: data.fullName || '', phoneNumber: data.phoneNumber || '', image: data.image || null });
      } catch (err) {
        console.error(err);
        alert('Error fetching profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Crop helper
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

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

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

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setImageBase64(croppedImage);
      setProfile(prev => ({ ...prev, image: croppedImage }));
      setCropOpen(false);
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels]);

  const handleSave = async () => {
    if (!profile.fullName || !profile.phoneNumber) {
      alert('Please fill all fields');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile }),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ textAlign: 'center', mt: 12 }}><CircularProgress size={50} /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', background: secondaryColor, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
      <Paper sx={{ maxWidth: 450, width: '100%', p: 4, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Image src="/logo.png" alt="Logo" width={120} height={60} />
        </Box>

        <Avatar
          src={profile.image || ''}
          sx={{ width: 140, height: 140, margin: 'auto', mb: 3, border: '3px solid white' }}
        />
        <Button variant="contained" sx={{ mb: 3, backgroundColor: primaryColor }} component="label">
          Change Profile Picture
          <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
        </Button>

        {cropOpen && (
          <Box sx={{ mb: 3 }}>
            <Box sx={CropContainer}>
              <IconButton sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }} onClick={() => setCropOpen(false)}>
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
              <Typography color="white">Zoom:</Typography>
              <Slider value={zoom} min={1} max={3} step={0.1} onChange={(_, value) => setZoom(value as number)} />
              <Button variant="contained" onClick={showCroppedImage} sx={{ backgroundColor: primaryColor }}>Crop</Button>
            </Stack>
          </Box>
        )}

        <TextField
          label="Full Name"
          fullWidth
          margin="normal"
          value={profile.fullName}
          onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
        />
        <TextField
          label="Phone Number"
          fullWidth
          margin="normal"
          value={profile.phoneNumber}
          onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, backgroundColor: primaryColor }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Profile'}
        </Button>
      </Paper>
    </Box>
  );
}  updaet if needeed  ialso want thta profile can be edited and saved succesflyy in nview profile page 