import { useState } from 'react';
import { cosmosRpc } from '../services/cosmosRpc';

interface RpcConfigProps {
  onClose: () => void;
}

const RpcConfig = ({ onClose }: RpcConfigProps) => {
  const [rpcUrl, setRpcUrl] = useState('https://rpc.vnichain.xyz');

  const handleSave = () => {
    cosmosRpc.setRpcUrl(rpcUrl);
    localStorage.setItem('cosmosRpcUrl', rpcUrl);
    onClose();
  };

  return (
    <div className="rpc-config-overlay">
      <div className="rpc-config">
        <h3>Configure RPC Endpoint</h3>
        <div className="form-group">
          <label>RPC URL:</label>
          <input
            type="text"
            value={rpcUrl}
            onChange={(e) => setRpcUrl(e.target.value)}
            placeholder="http://localhost:26657"
          />
        </div>
        <div className="buttons">
          <button onClick={handleSave} className="btn-primary">Save</button>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default RpcConfig;