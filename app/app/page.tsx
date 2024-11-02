import { Button } from "@/components/ui/button";
import { MessagesSquareIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="container py-16 md:px-32 lg:px-56 xl:px-80">
      <div className="flex flex-col items-center max-w-[680px]">
        <Image
          src="/images/bro.png"
          alt="Bro"
          priority={false}
          width="100"
          height="100"
          sizes="100vw"
          className="w-full"
        />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter max-w-[680px] mt-4">
        Dive into the blockchain world with Crypto Bro
      </h1>
      <h2 className="text-2xl font-normal tracking-tight text-muted-foreground max-w-[680px] mt-4">
        AI assistant to which you can delegate any of your blockchain requests,
        from token creation to participating in DAO
      </h2>
      <Link href="/chat">
        <Button variant="default" size="lg" className="mt-6">
          <MessagesSquareIcon className="size-4 mr-2" /> Talk to Crypto Bro
        </Button>
      </Link>
    </main>
  );
}
