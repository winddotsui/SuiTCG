import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID!;
const MODULE = "marketplace";

export function useMarketplace() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  async function buyCard(listingId: string, priceInMist: number) {
    const tx = new Transaction();

    const [coin] = tx.splitCoins(tx.gas, [priceInMist]);

    tx.moveCall({
      target: `${CONTRACT_ID}::${MODULE}::buy_card`,
      arguments: [
        tx.object(listingId),
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

  async function createListing(
    cardName: string,
    cardGame: string,
    cardCondition: string,
    imageUrl: string,
    priceInMist: number
  ) {
    const tx = new Transaction();

    const listing = tx.moveCall({
      target: `${CONTRACT_ID}::${MODULE}::create_listing`,
      arguments: [
        tx.pure.vector("u8", Array.from(new TextEncoder().encode(cardName))),
        tx.pure.vector("u8", Array.from(new TextEncoder().encode(cardGame))),
        tx.pure.vector("u8", Array.from(new TextEncoder().encode(cardCondition))),
        tx.pure.vector("u8", Array.from(new TextEncoder().encode(imageUrl))),
        tx.pure.u64(priceInMist),
      ],
    });

    tx.moveCall({
      target: `${CONTRACT_ID}::${MODULE}::share_listing`,
      arguments: [listing],
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

  return { buyCard, createListing };
}
