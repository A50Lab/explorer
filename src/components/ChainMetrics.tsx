import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cosmosRpc } from '../services/cosmosRpc';

interface ChainMetrics {
  height: number;
  timestamp: string;
  blockTime: number;
  txCount: number;
  gasUsed: number;
  gasWanted: number;
  tps: number;
}

interface NetworkStats {
  latestHeight: number;
  avgBlockTime: number;
  totalTxs: number;
  avgTps: number;
  chainId: string;
  networkHealth: 'Good' | 'Average' | 'Poor';
}

const ChainMetrics = () => {
  const [metrics, setMetrics] = useState<ChainMetrics[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChainMetrics = async () => {
    try {
      const latestBlock = await cosmosRpc.getLatestBlock();
      const latestHeight = parseInt(latestBlock.block.header.height);
      
      // Fetch last 20 blocks for metrics
      const minHeight = Math.max(1, latestHeight - 19);
      const blockchainInfo = await cosmosRpc.getBlockchainInfo(minHeight.toString(), latestHeight.toString());
      
      const metricsData: ChainMetrics[] = [];
      let totalTxs = 0;
      let totalBlockTime = 0;
      
      for (let i = 0; i < blockchainInfo.block_metas.length; i++) {
        const meta = blockchainInfo.block_metas[i];
        const height = parseInt(meta.header.height);
        
        // Get block results for transaction data
        const blockResults = await cosmosRpc.getBlockResults(height.toString());
        
        const txCount = parseInt(meta.num_txs || '0');
        const gasUsed = blockResults.txs_results?.reduce((sum, tx) => sum + parseInt(tx.gas_used || '0'), 0) || 0;
        const gasWanted = blockResults.txs_results?.reduce((sum, tx) => sum + parseInt(tx.gas_wanted || '0'), 0) || 0;
        
        // Calculate block time (if we have previous block)
        let blockTime = 0;
        if (i > 0) {
          const prevTime = new Date(blockchainInfo.block_metas[i - 1].header.time).getTime();
          const currTime = new Date(meta.header.time).getTime();
          blockTime = (currTime - prevTime) / 1000; // in seconds
        }
        
        const tps = blockTime > 0 ? txCount / blockTime : 0;
        
        metricsData.push({
          height,
          timestamp: new Date(meta.header.time).toLocaleTimeString(),
          blockTime: blockTime,
          txCount,
          gasUsed,
          gasWanted,
          tps
        });
        
        totalTxs += txCount;
        if (blockTime > 0) totalBlockTime += blockTime;
      }
      
      // Calculate network statistics
      const avgBlockTime = totalBlockTime / (metricsData.length - 1);
      const avgTps = metricsData.reduce((sum, m) => sum + m.tps, 0) / metricsData.length;
      
      const networkHealth: 'Good' | 'Average' | 'Poor' = 
        avgBlockTime <= 6 ? 'Good' : 
        avgBlockTime <= 10 ? 'Average' : 'Poor';
      
      setNetworkStats({
        latestHeight,
        avgBlockTime,
        totalTxs,
        avgTps,
        chainId: latestBlock.block.header.chain_id,
        networkHealth
      });
      
      setMetrics(metricsData.reverse()); // Show newest first
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chain metrics:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChainMetrics();
    const interval = setInterval(fetchChainMetrics, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading">Loading chain metrics...</div>;
  }

  return (
    <div className="chain-metrics">
      <h2>Chain Performance Metrics</h2>
      
      {/* Network Statistics Cards */}
      {networkStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Latest Height</h3>
            <div className="stat-value">{networkStats.latestHeight.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <h3>Avg Block Time</h3>
            <div className="stat-value">{networkStats.avgBlockTime.toFixed(2)}s</div>
          </div>
          <div className="stat-card">
            <h3>Avg TPS</h3>
            <div className="stat-value">{networkStats.avgTps.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <h3>Network Health</h3>
            <div className={`stat-value health-${networkStats.networkHealth.toLowerCase()}`}>
              {networkStats.networkHealth}
            </div>
          </div>
          <div className="stat-card">
            <h3>Chain ID</h3>
            <div className="stat-value chain-id">{networkStats.chainId}</div>
          </div>
          <div className="stat-card">
            <h3>Total TXs (Last 20)</h3>
            <div className="stat-value">{networkStats.totalTxs}</div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="charts-container">
        {/* TPS and Transaction Count in same row */}
        <div className="charts-row">
          <div className="chart-section half-width">
            <h3>Transactions per Second (TPS)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#FFD700"
                  tick={{ fill: '#FFD700', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#FFD700"
                  tick={{ fill: '#FFD700', fontSize: 12 }}
                  label={{ value: 'TPS', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#FFD700' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#000', 
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    color: '#FFD700'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="tps" 
                  stroke="#FFA500" 
                  strokeWidth={2}
                  dot={{ fill: '#FFA500', strokeWidth: 2, r: 4 }}
                  name="TPS"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-section half-width">
            <h3>Transactions per Block</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#FFD700"
                  tick={{ fill: '#FFD700', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#FFD700"
                  tick={{ fill: '#FFD700', fontSize: 12 }}
                  label={{ value: 'TX Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#FFD700' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#000', 
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    color: '#FFD700'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="txCount" 
                  fill="#FFD700"
                  name="Transaction Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChainMetrics;