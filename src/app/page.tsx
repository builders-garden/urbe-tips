"use client";
import Image from "next/image";
import { PrivyProvider } from "@privy-io/react-auth";
import { usePrivy } from "@privy-io/react-auth";
import { DaimoPayButton } from "@daimo/pay";
import { DaimoPayProvider, getDefaultConfig } from "@daimo/pay";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "wagmi";
import { optimismUSDC } from "@daimo/contract";
import { createPublicClient, getAddress, http } from "viem";
import { normalize } from "viem/ens";
import { base, mainnet } from "wagmi/chains";
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
          <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={{
              appearance: {
                theme: "light",
                accentColor: "#676FFF",
                logo: "https://your-logo-url",
              },
              embeddedWallets: {
                createOnLogin: "users-without-wallets",
              },
            }}
          >
            <HomeContent />
          </PrivyProvider>
        </DaimoPayProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function HomeContent() {
  const { login, authenticated } = usePrivy();
  const [showCheers, setShowCheers] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState<string>(
    "0xF416fffcF021d2d95eb777dC3424ee18a06beC26"
  );

  useEffect(() => {
    async function fetchEnsAddress() {
      try {
        const resolver = await getResolver(client, {
          name: normalize("urbe-hub.fkey.eth"),
        });

        const ensAddress = await client.getEnsAddress({
          name: normalize("urbe-hub.fkey.eth"),
          universalResolverAddress:
            resolver === "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41" ||
            resolver === "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"
              ? ("" as `0x${string}`)
              : (resolver as `0x${string}`),
        });

        if (ensAddress) {
          setRecipientAddress(ensAddress);
        } else {
        }
      } catch (error) {
        console.error("Detailed error fetching ENS address:", error);
      }
    }

    fetchEnsAddress();
  }, []); // Empty dependency array means this runs on mount

  return (
    <div className="min-h-screen bg-[#2C2137] p-12 font-[Press_Start_2P] text-white relative">
      <main className="flex flex-col items-center justify-center gap-12 pt-16">
        {/* Pixel Art Wolf and Beer */}
        <pre className="text-[#FFA500] text-base leading-[14px] font-mono whitespace-pre"></pre>

        <h1
          className={`text-6xl text-center text-[#FFA500] mt-8 animate-pulse ${vt323.className}`}
        >
          🐺 Urbe tips 🐺
        </h1>

        <div className="max-w-xl w-full p-6 bg-[#3C2C47] border-4 border-[#FFA500] rounded-lg shadow-lg opacity-80">
          <p className="text-lg leading-relaxed text-center text-[#FFA500]">
            Help keep Urbe caffeinated! Contributions are used to buy stuff for
            urbe hub and the community 🙏
          </p>
        </div>

        {!authenticated ? (
          <button
            onClick={login}
            className="px-16 py-8 bg-[#FFA500] text-black border-8 border-b-12 border-r-12 border-[#8B4513] 
              hover:bg-[#FFB52E] active:border-b-8 active:border-r-8 
              transition-all font-bold text-3xl
              animate-pulse hover:animate-none
              shadow-2xl hover:shadow-[#FFA500]/50"
          >
            [ CONNECT WALLET ]
          </button>
        ) : (
          <>
            <DaimoPayButton.Custom
              appId="pay-demo"
              toChain={optimismUSDC.chainId}
              toUnits="5.00"
              toToken={getAddress(optimismUSDC.token)}
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
                  className={`px-16 py-8 bg-gradient-to-r from-purple-600 to-red-500 text-white border-8 border-b-12 border-r-12 border-purple-900 
                    hover:from-purple-500 hover:to-red-400 
                    active:border-b-8 active:border-r-8 
                    transition-all font-bold text-2xl
                    animate-pulse hover:animate-none
                    shadow-2xl hover:shadow-purple-500/50
                    relative overflow-hidden ${vt323.className}`}
                >
                  <span className="relative z-10">💰 Tip Urbe 💰</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-red-300 opacity-0 hover:opacity-20 transition-opacity"></div>
                </button>
              )}
            </DaimoPayButton.Custom>

            <p className={`text-[#FFA500]/70 mt-4 ${vt323.className} text-xl`}>
              or send to{" "}
              <span className="text-[#FFA500]">urbe-hub.fkey.eth</span>
            </p>

            {showCheers && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-[#FFA500] text-black p-12 border-8 border-[#8B4513] animate-bounce">
                  <h2 className="text-4xl">🍻 Cheers! 🍻</h2>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
