import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cosmosRpc } from '../services/cosmosRpc';
import type { Block } from '../services/cosmosRpc';

const LatestBlock = () => {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestBlock = async () => {
    try {
      setLoading(true);
      const latestBlock = await cosmosRpc.getLatestBlock();
      setBlock(latestBlock);
      setError(null);
    } catch (err) {
      setError('Failed to fetch latest block');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestBlock();
    const interval = setInterval(fetchLatestBlock, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !block) {
    return <div className="loading">Loading latest block...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!block) {
    return <div>No block data available</div>;
  }

  return (
    <div className="latest-block">
      <h2>Latest Block (Updates every 3s)</h2>
      <div className="block-info">
        <div className="block-field">
          <strong>Height:</strong> 
          <Link to={`/block/${block.block.header.height}`}>
            {block.block.header.height}
          </Link>
        </div>
        <div className="block-field">
          <strong>Hash:</strong> {block.block_id.hash}
        </div>
        <div className="block-field">
          <strong>Time:</strong> {new Date(block.block.header.time).toLocaleString()}
        </div>
        <div className="block-field">
          <strong>Transactions:</strong> {block.block.data.txs.length}
        </div>
        <div className="block-field">
          <strong>Proposer:</strong> {block.block.header.proposer_address}
        </div>
      </div>
    </div>
  );
};

export default LatestBlock;