"use client";

import { addressToShortAddress } from "@/lib/converters";
import {
  useAccount,
  useDisconnect,
  useModal,
} from "@particle-network/connectkit";
import { LogOutIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function SiteHeaderConnectButton() {
  const { address, chain, isConnected, isDisconnected } = useAccount();
  const { setOpen } = useModal();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className="text-sm font-medium text-muted-foreground"
          asChild
        >
          <Button variant="outline">
            ({addressToShortAddress(address)},{" "}
            {chain?.name || "Unsupported chain"})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* TODO: Display supported chains */}
          <DropdownMenuItem onClick={() => disconnect()}>
            <LogOutIcon className="size-4 mr-2" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isDisconnected) {
    return <Button onClick={() => setOpen(true)}>Login</Button>;
  }

  return <></>;
}
