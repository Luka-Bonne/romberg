import { BrowserRouter as Router, Routes, Route, useRoutes } from "react-router-dom"


import './App.css';


import { Header } from './components/Header/Header';
import { HomePage } from './components/pages/HomePage';
import { InstructionPage } from './components/pages/InstructionPage';
import { ScaningPage } from './components/pages/ScaningPage';
import { HistoryPage } from './components/pages/HistoryPage';
import { Footer } from "./components/Footer/Footer";


const App = () => {
  return (
    <div className="App">
      <Router>
        <Header />
        
        <Routes>
          <Route path={'/'} element={<HomePage/>} />
          <Route path={'/inctruction'} element={<InstructionPage/>} />
          <Route path={'/scaning'} element={<ScaningPage/>} />
          <Route path={'/history'} element={<HistoryPage/>} />
        </Routes>

        <Footer />
      </Router>
    </div>
  );
}

export default App;
