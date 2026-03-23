import { useState } from "react";
import Head from "next/head";
import { BrowserProvider, Contract, Interface, isAddress, keccak256, toUtf8Bytes } from "ethers";

// Minimal ABI for the Consent contract (createConsent function)
const CONSENT_ABI = [
  "function createConsent(address _participant, bytes32 _contentHash) external returns (bytes32)",
  "function revokeConsent(bytes32 _agreementId) external",
  "function isConsentValid(bytes32 _agreementId) external view returns (bool)",
  "event ConsentCreated(bytes32 indexed agreementId, address indexed initiator, address indexed participant, uint256 timestamp)",
];

// Replace with your deployed contract address after running `npx hardhat deploy`
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";

type Step = "idle" | "connecting" | "connected" | "submitting" | "done" | "error";

export default function Home() {
  const [account, setAccount] = useState<string>("");
  const [step, setStep] = useState<Step>("idle");
  const [participantAddress, setParticipantAddress] = useState<string>("");
  const [consentContent, setConsentContent] = useState<string>("");
  const [agreementId, setAgreementId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // ── Connect MetaMask wallet ──────────────────────────────────────────────
  async function connectWallet() {
    setStep("connecting");
    setErrorMessage("");
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask (or a compatible wallet) is not installed.");
      }
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount((accounts as string[])[0]);
      setStep("connected");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to connect wallet.");
      setStep("error");
    }
  }

  // ── Submit consent record ─────────────────────────────────────────────────
  async function submitConsent(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!isAddress(participantAddress)) {
      setErrorMessage("Please enter a valid Ethereum address for the participant.");
      return;
    }

    if (!consentContent.trim()) {
      setErrorMessage("Please describe the consent details.");
      return;
    }

    setStep("submitting");

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("Wallet not connected.");
      }

      // Hash the consent content on the client side
      const contentHash = keccak256(toUtf8Bytes(consentContent));

      if (CONTRACT_ADDRESS) {
        // Real on-chain interaction
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(CONTRACT_ADDRESS, CONSENT_ABI, signer);
        const tx = await contract.createConsent(participantAddress, contentHash);
        const receipt = await tx.wait();

        // Parse the ConsentCreated event to get the agreementId
        const iface = new Interface(CONSENT_ABI);
        let id = "";
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
            if (parsed && parsed.name === "ConsentCreated") {
              id = parsed.args.agreementId as string;
              break;
            }
          } catch {
            // ignore logs that don't match
          }
        }
        setAgreementId(id || tx.hash);
      } else {
        // Mocked interaction – no contract deployed yet
        const randomBytes = new Uint8Array(32);
        crypto.getRandomValues(randomBytes);
        const mockId = "0x" + Array.from(randomBytes, (b) => b.toString(16).padStart(2, "0")).join("");
        await new Promise((r) => setTimeout(r, 1200)); // simulate network delay
        setAgreementId(mockId);
      }

      setStep("done");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Transaction failed.");
      setStep("error");
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>判了吗 / Pan Le Ma</title>
        <meta
          name="description"
          content="Blockchain-based consent verification — immutable, timestamped, and tamper-proof."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4 font-mono">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-widest text-red-600 border-b-2 border-red-700 pb-3">
            判了吗
          </h1>
          <p className="mt-3 text-gray-400 text-sm tracking-wide">
            PAN LE MA · On-chain Consent Verification
          </p>
        </header>

        <div className="w-full max-w-md space-y-8">
          {/* ── Step 1: Connect wallet ── */}
          {(step === "idle" || step === "connecting") && (
            <section className="text-center space-y-4">
              <p className="text-gray-400 text-sm">
                Connect your wallet to initiate or verify a consent record.
              </p>
              <button
                onClick={connectWallet}
                disabled={step === "connecting"}
                className="w-full py-4 bg-red-900 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.7)]"
              >
                {step === "connecting" ? "Connecting…" : "Connect Wallet"}
              </button>
            </section>
          )}

          {/* ── Connected – show account + consent form ── */}
          {(step === "connected" || step === "submitting" || step === "error") && (
            <section className="space-y-6">
              {/* Account badge */}
              <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-xs text-gray-300">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                <span className="truncate">{account}</span>
              </div>

              {/* Consent form */}
              <form
                onSubmit={submitConsent}
                className="border border-red-900 bg-gray-900 rounded-lg p-6 space-y-5"
              >
                <h2 className="text-lg font-bold text-red-500 tracking-wider">
                  Initiate Consent
                </h2>

                <div className="space-y-1">
                  <label
                    htmlFor="participant"
                    className="block text-xs text-gray-400 uppercase tracking-widest"
                  >
                    Participant Wallet Address
                  </label>
                  <input
                    id="participant"
                    type="text"
                    placeholder="0x..."
                    value={participantAddress}
                    onChange={(e) => setParticipantAddress(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="content"
                    className="block text-xs text-gray-400 uppercase tracking-widest"
                  >
                    Consent Details
                  </label>
                  <textarea
                    id="content"
                    rows={4}
                    placeholder="Describe the scope and terms of consent…"
                    value={consentContent}
                    onChange={(e) => setConsentContent(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 resize-none"
                    required
                  />
                  <p className="text-xs text-gray-600">
                    This text will be hashed and stored on-chain. Keep a personal copy.
                  </p>
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-400 border border-red-800 rounded px-3 py-2">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={step === "submitting"}
                  className="w-full py-3 bg-red-900 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded transition-all"
                >
                  {step === "submitting" ? "Recording on chain…" : "Submit Consent"}
                </button>
              </form>
            </section>
          )}

          {/* ── Done – show agreement ID ── */}
          {step === "done" && (
            <section className="border border-green-800 bg-gray-900 rounded-lg p-6 space-y-4 text-center">
              <div className="text-3xl">✅</div>
              <h2 className="text-lg font-bold text-green-400">Consent Recorded</h2>
              <p className="text-xs text-gray-400">Your agreement has been stored immutably.</p>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-widest">Agreement ID</p>
                <p className="break-all text-xs text-gray-300 border border-gray-700 rounded px-3 py-2 bg-black">
                  {agreementId}
                </p>
              </div>
              <button
                onClick={() => {
                  setStep("connected");
                  setParticipantAddress("");
                  setConsentContent("");
                  setAgreementId("");
                }}
                className="mt-2 text-xs text-gray-500 hover:text-gray-300 underline"
              >
                Record another
              </button>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-gray-700">
          <p>
            ⚠ This tool provides evidence of consent. It does not guarantee legal validity.
          </p>
          <p className="mt-1">
            All records are public on-chain. Do not enter personally identifying information.
          </p>
        </footer>
      </main>
    </>
  );
}
