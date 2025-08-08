// src/components/AppFooter.js

import React from 'react';
import { Box, Typography, Link } from '@mui/material';

function AppFooter() {
  return (
    <Box sx={{ py: 2, mt: 4, backgroundColor: 'grey.200' }}>
      <Typography variant="body2" color="textSecondary" align="center">
        {'© '}
        <Link color="inherit" href="https://sindia.co.in/">
          STATCON ELECTRONICS INDIA LIMITED
        </Link>{' '}
        {new Date().getFullYear()}
        {'. All rights reserved.'}
      </Typography>
    </Box>
  );
}

export default AppFooter;
