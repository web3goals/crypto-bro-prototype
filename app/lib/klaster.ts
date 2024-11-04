import {
  BiconomyV2AccountInitData,
  buildItx,
  ExecuteResponse,
  initKlaster,
  klasterNodeHost,
  KlasterSDK,
  loadBicoV2Account,
  RawTransaction,
  singleTx,
} from "klaster-sdk";
import { Address, Chain, WalletClient } from "viem";

export async function getKlaster(
  walletClient: WalletClient
): Promise<KlasterSDK<BiconomyV2AccountInitData>> {
  if (!walletClient.account) {
    throw new Error("Wallet client account not defined");
  }
  return await initKlaster({
    accountInitData: loadBicoV2Account({
      owner: walletClient.account.address,
    }),
    nodeUrl: klasterNodeHost.default,
  });
}

export async function getKlasterAccountAddress(
  walletClient: WalletClient,
  chain: Chain
): Promise<Address> {
  const klaster = await getKlaster(walletClient);
  const address = klaster.account.getAddress(chain.id);
  if (!address) {
    throw new Error("Klaster account address not defined");
  }
  return address;
}

export async function executeKlasterRawTx(
  rawTx: RawTransaction,
  walletClient: WalletClient,
  chain: Chain
): Promise<ExecuteResponse> {
  if (!walletClient.account) {
    throw new Error("Wallet client account not defined");
  }
  const klaster = await getKlaster(walletClient);
  const iTx = buildItx({
    steps: [singleTx(chain.id, rawTx)],
    feeTx: klaster.encodePaymentFee(chain.id, "ETH"),
  });
  const quote = await klaster.getQuote(iTx);
  const signed = await walletClient.signMessage({
    account: walletClient.account,
    message: { raw: quote.itxHash },
  });
  return await klaster.execute(quote, signed);
}
