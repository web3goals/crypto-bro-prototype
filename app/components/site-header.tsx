"use client";

import { siteConfig } from "@/config/site";
import {
  useAccount,
  useDisconnect,
  useModal,
} from "@particle-network/connectkit";
import {
  BicepsFlexedIcon,
  GithubIcon,
  LogOutIcon,
  MenuIcon,
  MessagesSquareIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function SiteHeader() {
  const { isDisconnected } = useAccount();
  const { setOpen } = useModal();
  const { disconnect } = useDisconnect();

  return (
    <header className="sticky top-0 z-40 bg-card border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        {/* Left part */}
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center size-8 bg-primary rounded-full">
              <BicepsFlexedIcon className="text-primary-foreground size-4" />
            </div>
            <span className="hidden text-primary font-bold md:inline">
              {siteConfig.name}
            </span>
          </Link>
        </div>
        {/* Right part */}
        <div className="flex flex-1 items-center justify-end gap-4">
          {isDisconnected ? (
            <Button onClick={() => setOpen(true)}>Login</Button>
          ) : (
            <Link href="/chat">
              <Button>Talk to Crypto Bro</Button>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="text-sm font-medium text-muted-foreground"
              asChild
            >
              <Button variant="ghost" size="icon">
                <MenuIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link href="/chat">
                <DropdownMenuItem>
                  <MessagesSquareIcon className="size-4 mr-2" />
                  <span>Chat</span>
                </DropdownMenuItem>
              </Link>
              <Link href={siteConfig.links.github} target="_blank">
                <DropdownMenuItem>
                  <GithubIcon className="size-4 mr-2" />
                  <span>GitHub</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => disconnect()}>
                <LogOutIcon className="size-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
