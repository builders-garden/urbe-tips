"use client";
import Image from "next/image";
import { DaimoPayButton } from "@daimo/pay";
import { DaimoPayProvider, getDefaultConfig } from "@daimo/pay";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "wagmi";
import { createPublicClient, getAddress, http } from "viem";
import { normalize } from "viem/ens";
import { base, mainnet, worldchain } from "wagmi/chains";
import { useState, useEffect } from "react";
import { VT323, Press_Start_2P } from "next/font/google";
import { addEnsContracts, createEnsPublicClient } from "@ensdomains/ensjs";
import { getResolver } from "@ensdomains/ensjs/public";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

const config = createConfig(
  getDefaultConfig({
    appName: "Wolf's Beer Fund",
    ssr: true,
  })
);
const USDC_BASE_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const FALLBACK_ADDRESS = "0x2DaF5595748e3C63e5538D09391b9d1783d352f8";

const queryClient = new QueryClient();
const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
});

export default function Home() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DaimoPayProvider>
          <HomeContent />
        </DaimoPayProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function HomeContent() {
  const [showCheers, setShowCheers] = useState(false);
  const [recipientAddress, setRecipientAddress] =
    useState<string>(FALLBACK_ADDRESS);

  useEffect(() => {
    async function fetchEnsAddress() {
      try {
        const name = "urbe-hub-tips.fkey.eth";

        const resolver = await getResolver(client, {
          name: normalize(name),
        });
        console.log("resolver", resolver);

        if (!resolver) {
          console.log("No resolver found for ENS name");
          return;
        }

        const ensAddress = await client.getEnsAddress({
          name: normalize(name),
          universalResolverAddress: resolver as `0x${string}`,
        });
        console.log("ensAddress", ensAddress);

        if (ensAddress) {
          setRecipientAddress(ensAddress);
        } else {
          setRecipientAddress(FALLBACK_ADDRESS);
        }
      } catch (error) {
        console.error("Error fetching ENS address:", error);
        setRecipientAddress(FALLBACK_ADDRESS);
      }
    }

    fetchEnsAddress();
  }, []);

  return (
    <div className="min-h-screen bg-[#2C2137] p-4 sm:p-8 md:p-12 font-[Press_Start_2P] text-white relative">
      <main className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-12 pt-8 sm:pt-12 md:pt-16">
        <h1
          className={`text-5xl sm:text-6xl md:text-7xl text-center text-[#FFA500] mt-4 sm:mt-6 md:mt-8 animate-pulse ${vt323.className}`}
        >
          🐺 Urbe tips 🐺
        </h1>

        <div className="max-w-2xl w-full p-6 sm:p-8 bg-[#3C2C47] border-4 border-[#FFA500] rounded-lg shadow-lg opacity-80 mx-4">
          <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-center text-[#FFA500]">
            Help keep Urbe caffeinated! Contributions are used to buy stuff for
            urbe hub and the community 🙏
          </p>
        </div>

        <DaimoPayButton.Custom
          appId="pay-demo"
          toChain={base.id}
          toToken={USDC_BASE_ADDRESS}
          toAddress={recipientAddress as `0x${string}`}
          onPaymentStarted={(e) => console.log("Payment started:", e)}
          onPaymentCompleted={(e) => {
            console.log("Payment completed:", e);
            setShowCheers(true);
            setTimeout(() => setShowCheers(false), 3000);
          }}
        >
          {({ show }) => (
            <button
              onClick={show}
              className={`px-10 sm:px-14 md:px-20 py-8 sm:py-9 md:py-10 bg-gradient-to-r from-purple-600 to-red-500 
                text-white border-4 sm:border-8 border-b-8 sm:border-b-12 border-r-8 sm:border-r-12 border-purple-900 
                hover:from-purple-500 hover:to-red-400 
                active:border-b-6 active:border-r-6 
                transition-all font-bold text-xl sm:text-2xl md:text-3xl
                animate-pulse hover:animate-none
                shadow-2xl hover:shadow-purple-500/50
                relative overflow-hidden ${vt323.className}
                mx-4`}
            >
              <span className="relative z-10">Donate ☕️</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-red-300 opacity-0 hover:opacity-20 transition-opacity"></div>
            </button>
          )}
        </DaimoPayButton.Custom>

        <p
          className={`text-[#FFA500]/70 mt-4 ${vt323.className} text-lg sm:text-xl md:text-2xl px-4 text-center`}
        >
          or send to{" "}
          <a
            href="https://urbe-hub-tips.fkey.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="italic text-[#FFA500] hover:text-[#FFB52E] transition-colors"
          >
            urbe-hub-tips.fkey.eth
          </a>
        </p>

        {showCheers && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-[#FFA500] text-black p-16 border-8 border-[#8B4513] animate-bounce">
              <h2 className="text-5xl">🍻 Cheers! 🍻</h2>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
