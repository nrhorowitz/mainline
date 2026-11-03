
import './App.css';
import { Router } from './views/Router';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { orange } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: '#BABABA',
    },
    secondary: {
      main: '#f44336',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="phone-viewport-wrapper">
        <div className="phone-device-frame">
          <div className="phone-hardware-notch">
            <div className="phone-hardware-camera" />
          </div>
          <div className="phone-screen-container">
            <Router />
          </div>
          <div className="phone-home-indicator" />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
