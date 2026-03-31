import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID!;
const MODULE = "tournament";
const ENTRY_FEE_MIST = 10_000_000_000; // 10 SUI

export function useTournament() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();
  const account = useCurrentAccount();

  async function registerForTournament(tournamentObjectId: string) {
    if (!account) throw new Error("Wallet not connected");

    const tx = new Transaction();

    const [coin] = tx.splitCoins(tx.gas, [ENTRY_FEE_MIST]);

    tx.moveCall({
      target: `${CONTRACT_ID}::${MODULE}::register`,
      arguments: [
        tx.object(tournamentObjectId),
        coin,
      ],
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error),
        }
      );
    });
  }

  async function getTournamentInfo(tournamentObjectId: string) {
    try {
      const obj = await client.getObject({
        id: tournamentObjectId,
        options: { showContent: true },
      });
      return obj;
    } catch (e) {
      console.error("Failed to get tournament info:", e);
      return null;
    }
  }

  return { registerForTournament, getTournamentInfo };
}
