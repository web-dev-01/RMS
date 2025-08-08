'use client';

import React, { createContext, useEffect, useState, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';

const ThemeContext = createContext<any>(null);

export const usePortalTheme = () => useContext(ThemeContext);

export const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const [themeData, setThemeData] = useState({
    primaryColor: '#00ED64',
    secondaryColor: '#0A0F19'
  });

  const [muiTheme, setMuiTheme] = useState(createTheme());

  useEffect(() => {
    const fetchTheme = async () => {
      const res = await fetch('/api/theme');
      const data = await res.json();
      setThemeData(data);

      const dynamicTheme = createTheme({
        palette: {
          mode: 'dark',
          primary: {
            main: data.primaryColor,
          },
          secondary: {
            main: data.secondaryColor,
          },
          background: {
            default: data.secondaryColor,
            paper: '#1E293B',
          },
          text: {
            primary: '#FFFFFF',
          }
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
        }
      });

      setMuiTheme(dynamicTheme);
    };

    fetchTheme();
  }, []);

  return (
    <ThemeContext.Provider value={themeData}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
