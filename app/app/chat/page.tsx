"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import useError from "@/hooks/use-error";
import { toast } from "@/hooks/use-toast";
import { processMessages } from "@/lib/actions";
import { OPEN_AI_PROMPT } from "@/lib/openai";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallets } from "@particle-network/connectkit";
import { ClassValue } from "clsx";
import {
  Loader2Icon,
  MessagesSquareIcon,
  SendHorizonalIcon,
} from "lucide-react";
import OpenAI from "openai";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function ChatPage() {
  const { handleError } = useError();
  const [primaryWallet] = useWallets();
  const [isProsessing, setIsProsessing] = useState(false);
  const [messages, setMessages] = useState<
    OpenAI.Chat.ChatCompletionMessageParam[]
  >([
    { role: "system", content: OPEN_AI_PROMPT },
    { role: "assistant", content: "GM, crypto bro! What can I help with?" },
  ]);

  async function handleSendMessage(message: string) {
    try {
      setIsProsessing(true);
      // Check wallet client account
      const account = primaryWallet.getWalletClient().account;
      if (!account) {
        toast({ title: "Please login to send messages" });
        return;
      }
      // Add user's message to messages state
      const newMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        ...messages,
        { role: "user", content: message },
      ];
      setMessages(newMessages);
      // Process messages and update messages state
      const processMessagesResponse = await processMessages(newMessages);
      if (!processMessagesResponse?.data) {
        throw new Error(processMessagesResponse?.error);
      }
      setMessages(JSON.parse(processMessagesResponse.data));
    } catch (error) {
      handleError(error, "Failed to send the message, try again later");
    } finally {
      setIsProsessing(false);
    }
  }

  return (
    <main className="container py-16 md:px-32 lg:px-80 xl:px-96">
      <div className="flex items-center justify-center size-20 rounded-full bg-primary">
        <MessagesSquareIcon className="size-10 text-primary-foreground" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mt-4">
        Talking to Crypto Bro
      </h2>
      <p className="text-muted-foreground mt-1">
        Delegate any blockchain requests to your AI assistant
      </p>
      <Separator className="my-8" />
      <ChatSendMessageForm
        isProcessing={isProsessing}
        onSend={(message) => handleSendMessage(message)}
      />
      <ChatMessages messages={messages} className="mt-4" />
    </main>
  );
}

function ChatSendMessageForm(props: {
  isProcessing: boolean;
  onSend: (message: string) => void;
  className?: ClassValue;
}) {
  const { handleError } = useError();
  const [isProsessing, setIsProsessing] = useState(false);

  const formSchema = z.object({
    message: z.string().min(1, { message: "Message cannot be empty" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsProsessing(true);
      props.onSend(values.message);
      form.reset();
    } catch (error) {
      handleError(error, "Failed to submit the form, try again later");
    } finally {
      setIsProsessing(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex flex-row space-x-2", props.className)}
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="Your message..."
                  disabled={isProsessing || props.isProcessing}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="icon"
          variant="default"
          disabled={isProsessing || props.isProcessing}
        >
          {isProsessing || props.isProcessing ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SendHorizonalIcon className="size-4" />
          )}
        </Button>
      </form>
    </Form>
  );
}

function ChatMessages(props: {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  className?: ClassValue;
}) {
  return (
    <div className={cn("flex flex-col gap-2", props.className)}>
      {props.messages.toReversed().map((message, index) => (
        <div key={index} className="bg-secondary rounded p-4">
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
            {JSON.stringify(message, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}
