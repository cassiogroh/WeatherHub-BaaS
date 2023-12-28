import { BrowserRouter as Router } from "react-router-dom";

import AppProvider from "./hooks";
import Footer from "./components/Footer";
import Header from "./components/Header";

import GlobalStyle from "./styles/global";

import Routes from "./routes";

function App() {
  return (
    <Router>
      <Header />

      <AppProvider>
        <Routes />
        <Footer />
      </AppProvider>

      <GlobalStyle />
    </Router>
  );
}

export default App;
