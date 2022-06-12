import 'typeface-roboto/files/roboto-latin-400.woff2';
import 'typeface-roboto/files/roboto-latin-500.woff2';

import { createTheme, ThemeProvider } from '@suid/material';
import { render } from 'solid-js/web';

import App from './App';
import CssBaseline from '@suid/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

render(
  () => (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  ),
  document.getElementById('root') as HTMLElement
);
