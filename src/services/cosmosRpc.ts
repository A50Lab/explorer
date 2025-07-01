import axios from 'axios';
import CryptoJS from 'crypto-js';

export interface Block {
  block_id: {
    hash: string;
    parts: {
      total: number;
      hash: string;
    };
  };
  block: {
    header: {
      height: string;
      time: string;
      proposer_address: string;
      chain_id: string;
      version: {
        block: string;
      };
      last_block_id: {
        hash: string;
      };
      last_commit_hash: string;
      data_hash: string;
      validators_hash: string;
      next_validators_hash: string;
      consensus_hash: string;
      app_hash: string;
      last_results_hash: string;
      evidence_hash: string;
    };
    data: {
      txs: string[];
    };
    evidence: {
      evidence: any[];
    };
    last_commit: {
      height: string;
      round: number;
      block_id: {
        hash: string;
      };
      signatures: any[];
    };
  };
}

export interface Transaction {
  hash: string;
  height: string;
  index: number;
  tx_result: {
    code: number;
    data: string;
    log: string;
    info: string;
    gas_wanted: string;
    gas_used: string;
    codespace: string;
    events: any[];
  };
  tx: string;
}

export interface BlockResult {
  height: string;
  txs_results: Array<{
    code: number;
    data: string;
    log: string;
    gas_wanted: string;
    gas_used: string;
  }>;
}

class CosmosRpcService {
  private rpcUrl: string;

  constructor(rpcUrl: string = 'https://rpc.vnichain.xyz') {
    this.rpcUrl = rpcUrl;
  }

  async getLatestBlock(): Promise<Block> {
    const response = await axios.post(this.rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'block',
      params: [null]
    });
    return response.data.result;
  }

  async getBlock(height: string): Promise<Block> {
    const response = await axios.post(this.rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'block',
      params: [height]
    });
    return response.data.result;
  }

  async getBlockResults(height: string): Promise<BlockResult> {
    const response = await axios.post(this.rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'block_results',
      params: [height]
    });
    return response.data.result;
  }

  async getTransaction(hash: string): Promise<Transaction> {
    // Convert hex hash to base64 for CometBFT JSON-RPC
    const hashBase64 = btoa(hash.match(/.{1,2}/g)?.map(byte => String.fromCharCode(parseInt(byte, 16))).join('') || '');
    
    const response = await axios.post(this.rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tx',
      params: [hashBase64, true]
    });
    return response.data.result;
  }

  // Helper function to calculate transaction hash from raw tx
  calculateTxHash(rawTx: string): string {
    // For CometBFT, we need to hash the raw transaction bytes
    const txBytes = Uint8Array.from(atob(rawTx), c => c.charCodeAt(0));
    const hash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(txBytes));
    return hash.toString(CryptoJS.enc.Hex).toUpperCase();
  }

  async getBlockchainInfo(minHeight: string, maxHeight: string): Promise<any> {
    const response = await axios.post(this.rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'blockchain',
      params: [minHeight, maxHeight]
    });
    return response.data.result;
  }

  async getStatus(): Promise<any> {
    const response = await axios.post(this.rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'status',
      params: []
    });
    return response.data.result;
  }

  setRpcUrl(url: string) {
    this.rpcUrl = url;
  }
}

export const cosmosRpc = new CosmosRpcService();
export default CosmosRpcService;