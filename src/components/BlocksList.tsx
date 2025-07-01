import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cosmosRpc } from '../services/cosmosRpc';

interface BlockInfo {
  height: string;
  hash: string;
  time: string;
  txCount: number;
  proposer: string;
}

const BlocksList = () => {
  const [blocks, setBlocks] = useState<BlockInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest100Blocks = async () => {
    try {
      setLoading(true);
      
      // First get the latest block to know the current height
      const latestBlock = await cosmosRpc.getLatestBlock();
      const latestHeight = parseInt(latestBlock.block.header.height);
      console.log('Latest height:', latestHeight);
      
      // Calculate the range for the latest 100 blocks
      const minHeight = Math.max(1, latestHeight - 99);
      const maxHeight = latestHeight;
      console.log('Fetching range:', minHeight, '->', maxHeight);
      
      // Fetch blockchain info for the range
      const blockchainInfo = await cosmosRpc.getBlockchainInfo(minHeight.toString(), maxHeight.toString());
      console.log('Blockchain info:', blockchainInfo);
      
      // Process the block metas
      const blockInfos: BlockInfo[] = blockchainInfo.block_metas.map((meta: any) => ({
        height: meta.header.height,
        hash: meta.block_id.hash,
        time: meta.header.time,
        txCount: parseInt(meta.num_txs || '0'),
        proposer: meta.header.proposer_address
      })).sort((a: BlockInfo, b: BlockInfo) => parseInt(b.height) - parseInt(a.height)); // Sort by height descending
      
      console.log('Fetched blocks:', blockInfos.length);
      
      setBlocks(blockInfos);
      setError(null);
    } catch (err) {
      setError('Failed to fetch blocks');
      console.error('Error fetching blocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest100Blocks();
    const interval = setInterval(fetchLatest100Blocks, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && blocks.length === 0) {
    return <div className="loading">Loading latest blocks...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="blocks-list">
      <h2>Latest 100 Blocks</h2>
      <div className="blocks-table">
        <div className="table-header">
          <div className="header-cell">Height</div>
          <div className="header-cell">Hash</div>
          <div className="header-cell">Time</div>
          <div className="header-cell">Transactions</div>
          <div className="header-cell">Proposer</div>
        </div>
        <div className="table-body">
          {blocks.map((block) => (
            <div key={block.height} className="table-row">
              <div className="table-cell">
                <Link to={`/block/${block.height}`} className="block-link">
                  #{block.height}
                </Link>
              </div>
              <div className="table-cell hash-cell">
                <span className="hash-text">{block.hash.slice(0, 16)}...</span>
              </div>
              <div className="table-cell">
                {new Date(block.time).toLocaleString()}
              </div>
              <div className="table-cell">
                {block.txCount}
              </div>
              <div className="table-cell proposer-cell">
                <span className="proposer-text">{block.proposer.slice(0, 16)}...</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlocksList;