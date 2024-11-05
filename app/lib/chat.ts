import { chainConfig } from "@/config/chain";
import { cryptoBroAbi } from "@/contracts/abi/crypto-bro";
import { rawTx } from "klaster-sdk";
import OpenAI from "openai";
import {
  Address,
  createPublicClient,
  encodeFunctionData,
  erc20Abi,
  http,
  maxUint256,
  parseEther,
  WalletClient,
} from "viem";
import { getOpenAiResponse } from "./actions";
import { errorToString } from "./converters";
import { executeKlasterRawTx, getKlasterAccountAddress } from "./klaster";

export async function processOpenAiMessages(
  inputMessages: OpenAI.Chat.ChatCompletionMessageParam[],
  walletClient: WalletClient
) {
  // Get OpenAI response
  const getOpenAiResponseResponse = await getOpenAiResponse(inputMessages);
  if (!getOpenAiResponseResponse?.data) {
    throw new Error(getOpenAiResponseResponse?.error);
  }
  const openAiResponse: OpenAI.Chat.ChatCompletion = JSON.parse(
    getOpenAiResponseResponse?.data
  );
  // Add OpenAI response to messages
  let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    ...inputMessages,
    openAiResponse.choices[0].message,
  ];
  // Process tool calls or return messages without tool calls
  if (openAiResponse.choices[0].message.tool_calls) {
    const processedToolCalls = await processOpenAiToolCalls(
      openAiResponse.choices[0].message.tool_calls,
      walletClient
    );
    messages = [...messages, ...processedToolCalls];
    return await processOpenAiMessages(messages, walletClient);
  } else {
    return messages;
  }
}

async function processOpenAiToolCalls(
  toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[],
  walletClient: WalletClient
): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  for (const toolCall of toolCalls) {
    let toolResponse = "";
    if (toolCall.function.name === "get_wallet_address") {
      toolResponse = await getWalletAddress(walletClient);
    }
    if (toolCall.function.name === "get_wallet_eth_balance") {
      toolResponse = await getWalletEthBalance(walletClient);
    }
    if (toolCall.function.name === "get_wallet_erc20_balance") {
      const { erc20_address } = JSON.parse(toolCall.function.arguments);
      toolResponse = await getWalletErc20Balance(erc20_address, walletClient);
    }
    if (toolCall.function.name === "get_erc20_symbol") {
      const { erc20_address } = JSON.parse(toolCall.function.arguments);
      toolResponse = await getErc20Symbol(erc20_address);
    }
    if (toolCall.function.name === "deploy_erc20_token") {
      const { token_name, token_symbol, token_initial_supply } = JSON.parse(
        toolCall.function.arguments
      );
      toolResponse = await deployErc20Token(
        token_name,
        token_symbol,
        token_initial_supply,
        walletClient
      );
    }
    if (toolCall.function.name === "get_deployed_erc20_tokens") {
      toolResponse = await getDeployedErc20Tokens(walletClient);
    }
    if (toolCall.function.name === "transfer_erc20_tokens") {
      const { erc20_address, to, value } = JSON.parse(
        toolCall.function.arguments
      );
      toolResponse = await transferErc20Tokens(
        erc20_address,
        to,
        value,
        walletClient
      );
    }
    if (toolCall.function.name === "exchange_erc20_tokens_for_usd_tokens") {
      const { erc20_address, erc20_value } = JSON.parse(
        toolCall.function.arguments
      );
      toolResponse = await exchangeErc20TokensForUsdTokens(
        erc20_address,
        erc20_value,
        walletClient
      );
    }
    if (
      toolCall.function.name ===
      "approve_erc20_tokens_transfer_for_crypto_bro_contract"
    ) {
      const { erc20_address } = JSON.parse(toolCall.function.arguments);
      toolResponse = await approveErc20TokensTransferForCryptoBroContract(
        erc20_address,
        walletClient
      );
    }
    messages.push({
      role: "tool",
      content: toolResponse || "Not found tool for this function",
      tool_call_id: toolCall.id,
    });
  }
  return messages;
}

async function getWalletAddress(walletClient: WalletClient): Promise<string> {
  try {
    const address = await getKlasterAccountAddress(
      walletClient,
      chainConfig.chain
    );
    return `${address} (${chainConfig.chain.name})`;
  } catch (error) {
    console.error("Failed to get wallet address:", errorToString(error));
    return "Failed to get wallet address";
  }
}

async function getWalletEthBalance(
  walletClient: WalletClient
): Promise<string> {
  try {
    const client = createPublicClient({
      chain: chainConfig.chain,
      transport: http(chainConfig.chain.rpcUrls.default.http[0]),
    });
    const address = await getKlasterAccountAddress(
      walletClient,
      chainConfig.chain
    );
    const balance = await client.getBalance({
      address: address,
    });
    return `${balance.toString()} ETH (${chainConfig.chain.name})`;
  } catch (error) {
    console.error("Failed to get wallet ETH balance:", errorToString(error));
    return "Failed to get wallet ETH balance";
  }
}

async function getWalletErc20Balance(
  erc20Address: string,
  walletClient: WalletClient
): Promise<string> {
  try {
    const client = createPublicClient({
      chain: chainConfig.chain,
      transport: http(chainConfig.chain.rpcUrls.default.http[0]),
    });
    const address = await getKlasterAccountAddress(
      walletClient,
      chainConfig.chain
    );
    const balance = await client.readContract({
      address: erc20Address as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });
    return `${balance.toString()} ERC20 (${chainConfig.chain.name})`;
  } catch (error) {
    console.error("Failed to get wallet ERC20 balance:", errorToString(error));
    return "Failed to get wallet ERC20 balance";
  }
}

async function getErc20Symbol(erc20Address: string): Promise<string> {
  try {
    const client = createPublicClient({
      chain: chainConfig.chain,
      transport: http(chainConfig.chain.rpcUrls.default.http[0]),
    });
    const symbol = await client.readContract({
      address: erc20Address as Address,
      abi: erc20Abi,
      functionName: "symbol",
    });
    return symbol;
  } catch (error) {
    console.error("Failed to get ERC20 symbol:", errorToString(error));
    return "Failed to get ERC20 symbol";
  }
}

async function deployErc20Token(
  tokenName: string,
  tokenSymbol: string,
  tokenPremint: string,
  walletClient: WalletClient
): Promise<string> {
  try {
    const deployFunctionData = encodeFunctionData({
      abi: cryptoBroAbi,
      functionName: "deployErc20",
      args: [tokenName, tokenSymbol, parseEther(tokenPremint)],
    });
    const deployRawTx = rawTx({
      gasLimit: 1_000_000n,
      to: chainConfig.contracts.cryptoBro,
      data: deployFunctionData,
    });
    await executeKlasterRawTx(deployRawTx, walletClient, chainConfig.chain);
    return `ERC20 token deployed (${chainConfig.chain.name}), get the list of deployed token to see deployed smart contract address`;
  } catch (error) {
    console.error("Failed to deploy ERC20 token:", errorToString(error));
    return "Failed to deploy ERC20 token";
  }
}

async function getDeployedErc20Tokens(
  walletClient: WalletClient
): Promise<string> {
  try {
    const client = createPublicClient({
      chain: chainConfig.chain,
      transport: http(chainConfig.chain.rpcUrls.default.http[0]),
    });
    const address = await getKlasterAccountAddress(
      walletClient,
      chainConfig.chain
    );
    const deployedErc20Tokens = await client.readContract({
      address: chainConfig.contracts.cryptoBro,
      abi: cryptoBroAbi,
      functionName: "getDeployedErc20s",
      args: [address],
    });
    return `Deployed ERC20 contracts: \n${deployedErc20Tokens.map(
      (token) => `- ${token} (${chainConfig.chain.name})`
    )}`;
  } catch (error) {
    console.error("Failed to get deployed ERC20 tokens:", errorToString(error));
    return "Failed to get deployed ERC20 tokens";
  }
}

async function transferErc20Tokens(
  erc20Address: string,
  to: string,
  value: string,
  walletClient: WalletClient
): Promise<string> {
  try {
    const transferFunctionData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [to as Address, parseEther(value)],
    });
    const transferRawTx = rawTx({
      gasLimit: 100_000n,
      to: erc20Address as Address,
      data: transferFunctionData,
    });
    await executeKlasterRawTx(transferRawTx, walletClient, chainConfig.chain);
    return `ERC20 tokens transfered`;
  } catch (error) {
    console.error("Failed to transfer ERC20 tokens:", errorToString(error));
    return "Failed to transfer ERC20 tokens";
  }
}

async function approveErc20TokensTransferForCryptoBroContract(
  erc20Address: string,
  walletClient: WalletClient
): Promise<string> {
  try {
    const approveFunctionData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [chainConfig.contracts.cryptoBro, maxUint256],
    });
    const approveRawTx = rawTx({
      gasLimit: 100_000n,
      to: erc20Address as Address,
      data: approveFunctionData,
    });
    await executeKlasterRawTx(approveRawTx, walletClient, chainConfig.chain);
    return "ERC20 tokens transfer for CryptoBro contract approved";
  } catch (error) {
    console.error(
      "Failed to approve ERC20 tokens transfer for CryptBro contract:",
      errorToString(error)
    );
    return "Failed to approve ERC20 tokens transfer for CryptBro contract";
  }
}

async function exchangeErc20TokensForUsdTokens(
  erc20Address: string,
  erc20Value: string,
  walletClient: WalletClient
): Promise<string> {
  try {
    // Check allowance
    const client = createPublicClient({
      chain: chainConfig.chain,
      transport: http(chainConfig.chain.rpcUrls.default.http[0]),
    });
    const address = await getKlasterAccountAddress(
      walletClient,
      chainConfig.chain
    );
    const allowance = await client.readContract({
      address: erc20Address as Address,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address, chainConfig.contracts.cryptoBro],
    });
    if (allowance < parseEther(erc20Value)) {
      return "Failed to exchange ERC20 tokens for USD tokens, user must approve transfer their ERC20 tokens for CryptoBro contract using ERC20 tokens contracts before exchanging.";
    }
    // Send exchange transaction
    const exchangeFunctionData = encodeFunctionData({
      abi: cryptoBroAbi,
      functionName: "exchangeErc20ForUsdTokens",
      args: [erc20Address as Address, parseEther(erc20Value)],
    });
    const exchangeRawTx = rawTx({
      gasLimit: 100_000n,
      to: chainConfig.contracts.cryptoBro,
      data: exchangeFunctionData,
    });
    await executeKlasterRawTx(exchangeRawTx, walletClient, chainConfig.chain);
    return "ERC20 tokens exchanged for USD tokens (USDT)";
  } catch (error) {
    console.error(
      "Failed to exchange ERC20 tokens for USD tokens:",
      errorToString(error)
    );
    return "Failed to exchange ERC20 tokens for USD tokens";
  }
}
