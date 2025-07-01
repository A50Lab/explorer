import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BlocksList from './components/BlocksList';
import BlockDetail from './components/BlockDetail';
import TransactionDetail from './components/TransactionDetail';
import ChainMetrics from './components/ChainMetrics';
import RpcConfig from './components/RpcConfig';
import { cosmosRpc } from './services/cosmosRpc';
import './App.css'

function App() {
  const [showRpcConfig, setShowRpcConfig] = useState(false);

  useEffect(() => {
    const savedRpcUrl = localStorage.getItem('cosmosRpcUrl');
    if (savedRpcUrl) {
      cosmosRpc.setRpcUrl(savedRpcUrl);
    }
  }, []);

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1>VNI Chain Explorer</h1>
            <button 
              onClick={() => setShowRpcConfig(true)}
              className="config-btn"
            >
              ⚙️ Configure RPC
            </button>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={
              <>
                <ChainMetrics />
                <BlocksList />
              </>
            } />
            <Route path="/block/:height" element={<BlockDetail />} />
            <Route path="/transactions/:hash" element={<TransactionDetail />} />
          </Routes>
        </main>
        {showRpcConfig && (
          <RpcConfig onClose={() => setShowRpcConfig(false)} />
        )}
      </div>
    </Router>
  );
}

export default App
