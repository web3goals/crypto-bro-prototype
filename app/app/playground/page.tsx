"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { chainConfig } from "@/config/chain";
import useError from "@/hooks/use-error";
import { toast } from "@/hooks/use-toast";
import { useWallets } from "@particle-network/connectkit";
import {
  buildItx,
  initKlaster,
  klasterNodeHost,
  loadBicoV2Account,
  rawTx,
  singleTx,
} from "klaster-sdk";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { parseEther } from "viem";

export default function PlaygroundPage() {
  return (
    <main className="container py-16 md:px-32 lg:px-80 xl:px-96">
      <h2 className="text-3xl font-bold tracking-tight mt-4">Playground</h2>
      <Separator className="my-8" />
      <div className="flex flex-row gap-2">
        <PlaygroundSendKlasterTransactionFeature />
      </div>
    </main>
  );
}

function PlaygroundSendKlasterTransactionFeature() {
  const { handleError } = useError();
  const [primaryWallet] = useWallets();
  const [isProsessing, setIsProsessing] = useState(false);

  async function handleSendKlasterTransaction() {
    try {
      setIsProsessing(true);
      // Check wallet client
      const walletClient = primaryWallet?.getWalletClient();
      if (!walletClient || !walletClient.account) {
        toast({ title: "Please login" });
        return;
      }
      // Send transaction
      const klaster = await initKlaster({
        accountInitData: loadBicoV2Account({
          owner: walletClient.account?.address,
        }),
        nodeUrl: klasterNodeHost.default,
      });
      const sendETH = rawTx({
        gasLimit: 75000n,
        to: walletClient.account.address,
        value: parseEther("0.00001"),
      });
      const iTx = buildItx({
        steps: [singleTx(chainConfig.chain.id, sendETH)],
        feeTx: klaster.encodePaymentFee(chainConfig.chain.id, "ETH"),
      });
      const quote = await klaster.getQuote(iTx);
      console.log({ quote });
      const signed = await walletClient.signMessage({
        account: walletClient.account,
        message: { raw: quote.itxHash },
      });
      const result = await klaster.execute(quote, signed);
      console.log({ result });
      toast({ title: "Success" });
    } catch (error) {
      handleError(error, "Failed, try again later");
    } finally {
      setIsProsessing(false);
    }
  }

  return (
    <Button
      disabled={isProsessing}
      onClick={() => handleSendKlasterTransaction()}
    >
      {isProsessing ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <ArrowRightIcon className="size-4" />
      )}{" "}
      Send Klaster Transaction
    </Button>
  );
}
