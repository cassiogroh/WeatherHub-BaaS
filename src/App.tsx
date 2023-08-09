import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import dotenv from 'dotenv';

import AppProvider from './hooks';
import Footer from './components/Footer';

import GlobalStyle from './styles/global';

import Routes from './routes';

// Load .env variables
dotenv.config();

function App() {
  return (
    <Router>
      <AppProvider>
        <Routes />
        <Footer />
      </AppProvider>
      
      <GlobalStyle />
    </Router>
  );
}

export default App;
