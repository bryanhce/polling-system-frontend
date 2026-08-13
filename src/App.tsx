import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import './App.css';
import { CreatePollPage } from './pages/CreatePollPage';
import { LandingPage } from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/polls/new" element={<CreatePollPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
