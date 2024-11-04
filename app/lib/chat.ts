import { chainConfig } from "@/config/chain";
import { cryptoBroAbi } from "@/contracts/abi/crypto-bro";
import { rawTx } from "klaster-sdk";
import OpenAI from "openai";
import {
  createPublicClient,
  encodeFunctionData,
  http,
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
    console.error("Failed to get wallet address: ", errorToString(error));
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
    console.error("Failed to get wallet address: ", errorToString(error));
    return "Failed to get wallet address";
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
    console.error("Failed to get wallet address: ", errorToString(error));
    return "Failed to get wallet address";
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
    console.error("Failed to get wallet address: ", errorToString(error));
    return "Failed to get wallet address";
  }
}
