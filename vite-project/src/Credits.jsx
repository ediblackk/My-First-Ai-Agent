import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import * as solanaWeb3 from '@solana/web3.js';

function CreditTransfer() {
  const { publicKey, wallet, connected } = useWallet();
  const [credits, setCredits] = useState(0);

  const handleTransfer = async () => {
    if (!connected) {
      alert('Conectează-te la portofel!');
      return;
    }

    try {
      // Logică transfer Solana
      const connection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl('devnet'), 
        'confirmed'
      );
      
      const destinationPubkey = new solanaWeb3.PublicKey('WALLET_POOL_ADDRESS');
      
      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: destinationPubkey,
          lamports: 0.1 * solanaWeb3.LAMPORTS_PER_SOL
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      await connection.confirmTransaction(signature);

      // Trimite către backend pentru validare și creditare
      const response = await fetch('http://localhost:5000/api/users/add-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          publicKey: publicKey.toString(), 
          amount: 0.1  // Suma transferată
        })
      });

      const result = await response.json();
      if (result.newBalance) {
        setCredits(result.newBalance);
      }
    } catch (error) {
      console.error('Eroare transfer:', error);
    }
  };

  return (
    <div>
      <button onClick={handleTransfer}>
        Transfer și Obține Credite
      </button>
      <p>Credite curente: {credits}</p>
    </div>
  );
}

export default CreditTransfer;