import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cosmosRpc } from '../services/cosmosRpc';
import type { Block, BlockResult } from '../services/cosmosRpc';

const BlockDetail = () => {
  const { height } = useParams<{ height: string }>();
  const [block, setBlock] = useState<Block | null>(null);
  const [blockResults, setBlockResults] = useState<BlockResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlockDetail = async () => {
      if (!height) return;
      
      try {
        setLoading(true);
        const [blockData, blockResultsData] = await Promise.all([
          cosmosRpc.getBlock(height),
          cosmosRpc.getBlockResults(height)
        ]);
        setBlock(blockData);
        setBlockResults(blockResultsData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch block details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockDetail();
  }, [height]);

  if (loading) {
    return <div className="loading">Loading block details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!block || !blockResults) {
    return <div>No block data available</div>;
  }

  return (
    <div className="block-detail">
      <div className="header">
        <Link to="/">← Back to Explorer</Link>
        <h2>Block #{block.block.header.height}</h2>
      </div>
      
      <div className="block-info">
        <div className="section">
          <h3>Block ID</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Hash:</strong> {block.block_id.hash}
            </div>
            <div className="info-item">
              <strong>Parts Total:</strong> {block.block_id.parts.total}
            </div>
            <div className="info-item">
              <strong>Parts Hash:</strong> {block.block_id.parts.hash}
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Block Header</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Height:</strong> {block.block.header.height}
            </div>
            <div className="info-item">
              <strong>Time:</strong> {new Date(block.block.header.time).toLocaleString()}
            </div>
            <div className="info-item">
              <strong>Chain ID:</strong> {block.block.header.chain_id}
            </div>
            <div className="info-item">
              <strong>Proposer Address:</strong> {block.block.header.proposer_address}
            </div>
            <div className="info-item">
              <strong>Version (Block):</strong> {block.block.header.version.block}
            </div>
            <div className="info-item">
              <strong>Last Block Hash:</strong> {block.block.header.last_block_id.hash}
            </div>
            <div className="info-item">
              <strong>Last Commit Hash:</strong> {block.block.header.last_commit_hash}
            </div>
            <div className="info-item">
              <strong>Data Hash:</strong> {block.block.header.data_hash}
            </div>
            <div className="info-item">
              <strong>Validators Hash:</strong> {block.block.header.validators_hash}
            </div>
            <div className="info-item">
              <strong>Next Validators Hash:</strong> {block.block.header.next_validators_hash}
            </div>
            <div className="info-item">
              <strong>Consensus Hash:</strong> {block.block.header.consensus_hash}
            </div>
            <div className="info-item">
              <strong>App Hash:</strong> {block.block.header.app_hash}
            </div>
            <div className="info-item">
              <strong>Last Results Hash:</strong> {block.block.header.last_results_hash}
            </div>
            <div className="info-item">
              <strong>Evidence Hash:</strong> {block.block.header.evidence_hash}
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Block Data</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Number of Transactions:</strong> {block.block.data.txs.length}
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Evidence</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Evidence Count:</strong> {block.block.evidence.evidence.length}
            </div>
          </div>
          {block.block.evidence.evidence.length > 0 && (
            <div className="raw-tx">
              <pre>{JSON.stringify(block.block.evidence.evidence, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="section">
          <h3>Last Commit</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Height:</strong> {block.block.last_commit.height}
            </div>
            <div className="info-item">
              <strong>Round:</strong> {block.block.last_commit.round}
            </div>
            <div className="info-item">
              <strong>Block ID Hash:</strong> {block.block.last_commit.block_id.hash}
            </div>
            <div className="info-item">
              <strong>Signatures Count:</strong> {block.block.last_commit.signatures.length}
            </div>
          </div>
          
          {block.block.last_commit.signatures.length > 0 && (
            <div>
              <h4>Signatures</h4>
              <div className="transactions-list">
                {block.block.last_commit.signatures.map((sig: any, index: number) => (
                  <div key={index} className="transaction-item">
                    <div className="tx-info">
                      <strong>Signature #{index}</strong>
                      <div className="info-grid">
                        <div className="info-item">
                          <strong>Block ID Flag:</strong> {sig.block_id_flag}
                        </div>
                        <div className="info-item">
                          <strong>Validator Address:</strong> {sig.validator_address}
                        </div>
                        <div className="info-item">
                          <strong>Timestamp:</strong> {new Date(sig.timestamp).toLocaleString()}
                        </div>
                        <div className="info-item">
                          <strong>Signature:</strong> {sig.signature}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {blockResults && (
          <div className="section">
            <h3>Block Results</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>Height:</strong> {blockResults.height}
              </div>
              <div className="info-item">
                <strong>Transaction Results Count:</strong> {blockResults.txs_results?.length || 0}
              </div>
            </div>
            
            {blockResults.txs_results && blockResults.txs_results.length > 0 && (
              <div>
                <h4>Transaction Results</h4>
                <div className="transactions-list">
                  {blockResults.txs_results.map((txResult: any, index: number) => (
                    <div key={index} className="transaction-item">
                      <div className="tx-info">
                        <strong>TX Result #{index}</strong>
                        <div className="info-grid">
                          <div className="info-item">
                            <strong>Code:</strong> {txResult.code}
                          </div>
                          <div className="info-item">
                            <strong>Data:</strong> {txResult.data || 'N/A'}
                          </div>
                          <div className="info-item">
                            <strong>Log:</strong> {txResult.log || 'N/A'}
                          </div>
                          <div className="info-item">
                            <strong>Gas Wanted:</strong> {txResult.gas_wanted}
                          </div>
                          <div className="info-item">
                            <strong>Gas Used:</strong> {txResult.gas_used}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4>Raw Block Results</h4>
              <div className="raw-tx">
                <pre>{JSON.stringify(blockResults, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        <div className="section">
          <h3>Transactions</h3>
          {block.block.data.txs.length > 0 ? (
            <div className="transactions-list">
              {block.block.data.txs.map((tx, index) => {
                const txHash = cosmosRpc.calculateTxHash(tx);
                return (
                  <div key={index} className="transaction-item">
                    <div className="tx-info">
                      <strong>TX #{index}</strong>
                      <div className="tx-hash">
                        <span className="hash-text">{txHash.slice(0, 16)}...</span>
                      </div>
                      {blockResults.txs_results[index] && (
                        <div className="tx-result">
                          <span className={`status ${blockResults.txs_results[index].code === 0 ? 'success' : 'error'}`}>
                            {blockResults.txs_results[index].code === 0 ? 'Success' : 'Failed'}
                          </span>
                          <span>Gas Used: {blockResults.txs_results[index].gas_used}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-transactions">
              <p>No transactions in this block</p>
            </div>
          )}
        </div>

        <div className="section">
          <h3>Raw Block Data</h3>
          <div className="raw-tx">
            <pre>{JSON.stringify(block, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockDetail;