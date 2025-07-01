import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cosmosRpc } from '../services/cosmosRpc';
import type { Transaction } from '../services/cosmosRpc';

const TransactionDetail = () => {
  const { hash } = useParams<{ hash: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionDetail = async () => {
      if (!hash) return;
      
      try {
        setLoading(true);
        const txData = await cosmosRpc.getTransaction(hash);
        setTransaction(txData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch transaction details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetail();
  }, [hash]);

  if (loading) {
    return <div className="loading">Loading transaction details...</div>;
  }

  if (error) {
    return (
      <div className="transaction-detail">
        <div className="header">
          <Link to="/">← Back to Explorer</Link>
          <h2>Transaction Not Found</h2>
        </div>
        <div className="error">
          <p>Transaction with hash <code>{hash}</code> was not found.</p>
          <p>This could be because:</p>
          <ul>
            <li>The transaction hash is incorrect</li>
            <li>The transaction doesn't exist on this chain</li>
            <li>The transaction is too old and not available via RPC</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return <div>No transaction data available</div>;
  }

  const decodeTx = (tx: string) => {
    try {
      return atob(tx);
    } catch {
      return 'Unable to decode transaction data';
    }
  };

  return (
    <div className="transaction-detail">
      <div className="header">
        <Link to="/">← Back to Explorer</Link>
        <h2>Transaction Details</h2>
      </div>
      
      <div className="transaction-info">
        <div className="section">
          <h3>Transaction Basic Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Hash:</strong> {transaction.hash}
            </div>
            <div className="info-item">
              <strong>Height:</strong> 
              <Link to={`/block/${transaction.height}`}>{transaction.height}</Link>
            </div>
            <div className="info-item">
              <strong>Index:</strong> {transaction.index}
            </div>
            <div className="info-item">
              <strong>Status:</strong> 
              <span className={`status ${transaction.tx_result.code === 0 ? 'success' : 'error'}`}>
                {transaction.tx_result.code === 0 ? 'Success' : 'Failed'}
              </span>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Transaction Result</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Code:</strong> {transaction.tx_result.code}
            </div>
            <div className="info-item">
              <strong>Data:</strong> {transaction.tx_result.data || 'N/A'}
            </div>
            <div className="info-item">
              <strong>Log:</strong> {transaction.tx_result.log || 'N/A'}
            </div>
            <div className="info-item">
              <strong>Info:</strong> {transaction.tx_result.info || 'N/A'}
            </div>
            <div className="info-item">
              <strong>Gas Wanted:</strong> {transaction.tx_result.gas_wanted}
            </div>
            <div className="info-item">
              <strong>Gas Used:</strong> {transaction.tx_result.gas_used}
            </div>
            <div className="info-item">
              <strong>Gas Efficiency:</strong> 
              {transaction.tx_result.gas_wanted !== '0' 
                ? `${((parseInt(transaction.tx_result.gas_used) / parseInt(transaction.tx_result.gas_wanted)) * 100).toFixed(2)}%`
                : 'N/A'
              }
            </div>
            <div className="info-item">
              <strong>Codespace:</strong> {transaction.tx_result.codespace || 'N/A'}
            </div>
          </div>
        </div>

        {transaction.tx_result.events && transaction.tx_result.events.length > 0 && (
          <div className="section">
            <h3>Events</h3>
            <div className="transactions-list">
              {transaction.tx_result.events.map((event: any, index: number) => (
                <div key={index} className="transaction-item">
                  <div className="tx-info">
                    <strong>Event #{index}</strong>
                    <div className="info-grid">
                      <div className="info-item">
                        <strong>Type:</strong> {event.type}
                      </div>
                    </div>
                    {event.attributes && event.attributes.length > 0 && (
                      <div>
                        <h5>Attributes</h5>
                        <div className="info-grid">
                          {event.attributes.map((attr: any, attrIndex: number) => (
                            <div key={attrIndex} className="info-item">
                              <strong>{attr.key}:</strong> {attr.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {transaction.tx_result.log && (
          <div className="section">
            <h3>Transaction Log</h3>
            <div className="log-content">
              <pre>{transaction.tx_result.log}</pre>
            </div>
          </div>
        )}

        {transaction.tx_result.data && (
          <div className="section">
            <h3>Transaction Data</h3>
            <div className="data-content">
              <pre>{transaction.tx_result.data}</pre>
            </div>
          </div>
        )}

        <div className="section">
          <h3>Raw Transaction (Base64)</h3>
          <div className="raw-tx">
            <pre>{transaction.tx}</pre>
          </div>
        </div>

        <div className="section">
          <h3>Decoded Transaction</h3>
          <div className="raw-tx">
            <pre>{decodeTx(transaction.tx)}</pre>
          </div>
        </div>

        <div className="section">
          <h3>Complete Transaction Object</h3>
          <div className="raw-tx">
            <pre>{JSON.stringify(transaction, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;