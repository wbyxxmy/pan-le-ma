'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────────────────────
type DemoStep =
  | 'INTRO'
  | 'PARTY_A_VERIFY'
  | 'PARTY_B_VERIFY'
  | 'VIDEO_CONSENT'
  | 'BLOCKCHAIN_WRITE'
  | 'SUCCESS';

interface FakeTx {
  hash: string;
  block: number;
  timestamp: string;
  gasUsed: string;
}

// Base Ethereum block number used for demo simulation
const DEMO_BASE_BLOCK = 19_800_000;

// ── Helpers ──────────────────────────────────────────────────────────────────
function randomHex(len: number) {
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function fakeTx(): FakeTx {
  return {
    hash: '0x' + randomHex(64),
    block: DEMO_BASE_BLOCK + Math.floor(Math.random() * 50_000),
    timestamp: new Date().toISOString(),
    gasUsed: (21_000 + Math.floor(Math.random() * 10_000)).toLocaleString(),
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-yellow-600 bg-yellow-950 text-yellow-400 text-xs font-bold tracking-widest">
      <span className="animate-pulse">◉</span> DEMO 试用模式
    </span>
  );
}

function StepDots({ step }: { step: DemoStep }) {
  const steps: DemoStep[] = [
    'INTRO',
    'PARTY_A_VERIFY',
    'PARTY_B_VERIFY',
    'VIDEO_CONSENT',
    'BLOCKCHAIN_WRITE',
    'SUCCESS',
  ];
  const idx = steps.indexOf(step);
  return (
    <div className="flex gap-2 justify-center mt-2 mb-6">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < idx
              ? 'w-4 bg-green-500'
              : i === idx
              ? 'w-6 bg-red-500'
              : 'w-4 bg-gray-800'
          }`}
        />
      ))}
    </div>
  );
}

// Pulsing scan animation
function ScanBox({ icon, label }: { icon: string; label: string }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setProgress(0);
    setDone(false);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setDone(true);
          return 100;
        }
        return p + 5;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [icon]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-2 border-dashed border-red-800">
        <span
          className="text-4xl transition-transform duration-300"
          style={{ transform: done ? 'scale(1.15)' : 'scale(1)' }}
        >
          {icon}
        </span>
        {!done && (
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 100 100"
            width={96}
            height={96}
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(220,38,38,0.6)"
              strokeWidth="4"
              strokeDasharray={`${(progress / 100) * 289} 289`}
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <p
        className={`text-xs tracking-widest ${
          done ? 'text-green-400' : 'text-gray-500'
        }`}
      >
        {done ? '✓ 验证通过 / VERIFIED' : label}
      </p>
    </div>
  );
}

// Blockchain writing animation
function BlockchainAnimation({ onDone }: { onDone: (tx: FakeTx) => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  // Compute log lines once on mount so the random block number is stable
  const [logLines] = useState<string[]>(() => [
    '> 计算内容哈希值... computing content hash',
    '> 构建交易对象... building transaction',
    '> 签名数据... signing payload',
    '> 广播至节点... broadcasting to network',
    '> 等待矿工确认... waiting for miner',
    `> 区块 #${(DEMO_BASE_BLOCK + Math.floor(Math.random() * 50_000)).toLocaleString()} 确认... block confirmed`,
    '> 写入成功 ✓ ... record immutably stored',
  ]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < logLines.length) {
        setLines((prev) => [...prev, logLines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setFinished(true);
        setTimeout(() => onDone(fakeTx()), 600);
      }
    }, 400);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full font-mono text-xs bg-black border border-gray-800 rounded p-4 space-y-1 min-h-[180px]">
      {lines.map((l, i) => (
        <p key={i} className="text-green-500 animate-fade-in">
          {l}
        </p>
      ))}
      {!finished && (
        <p className="text-gray-600 animate-pulse">█</p>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [step, setStep] = useState<DemoStep>('INTRO');
  const [tx, setTx] = useState<FakeTx | null>(null);

  function reset() {
    setStep('INTRO');
    setTx(null);
  }

  return (
    <main className="min-h-screen bg-black text-white font-mono px-4 py-10 flex flex-col items-center">
      {/* Header */}
      <header className="text-center mb-2 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-widest text-red-600">
          判了吗
        </h1>
        <p className="text-gray-500 text-xs tracking-widest">
          PAN LE MA · 区块链同意存证
        </p>
        <DemoBadge />
      </header>

      <StepDots step={step} />

      <div className="w-full max-w-lg space-y-4">

        {/* ── INTRO ─────────────────────────────────────────────────────── */}
        {step === 'INTRO' && (
          <section className="space-y-6">
            <div className="border border-yellow-800 bg-yellow-950/30 rounded-lg p-4 text-xs text-yellow-300 space-y-1">
              <p className="font-bold tracking-wider">📋 试用说明</p>
              <p>此页面为完整流程演示，无需钱包、无需链地址、无需任何区块链账号。</p>
              <p>所有数据均为模拟，不会上链，刷新后消失。</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-gray-300 text-sm tracking-widest font-bold">
                完整流程预览 / FULL FLOW
              </h2>
              {[
                { icon: '👤', label: '甲方身份核验', sub: 'Party A biometric check' },
                { icon: '👤', label: '乙方身份核验', sub: 'Party B biometric check' },
                { icon: '🎥', label: '视频同意声明', sub: 'Video consent statement' },
                { icon: '⛓', label: '区块链写入', sub: 'On-chain immutable record' },
                { icon: '📜', label: '存证证书', sub: 'Consent certificate issued' },
              ].map(({ icon, label, sub }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 border border-gray-800 bg-gray-950 rounded px-4 py-2"
                >
                  <span className="text-xl">{icon}</span>
                  <div>
                    <p className="text-sm text-white">{label}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('PARTY_A_VERIFY')}
              className="w-full py-4 bg-red-900 hover:bg-red-700 text-white font-bold rounded tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.35)] transition-all duration-200"
            >
              开始试用 / START DEMO →
            </button>
          </section>
        )}

        {/* ── PARTY A VERIFY ───────────────────────────────────────────── */}
        {step === 'PARTY_A_VERIFY' && (
          <section className="border border-red-900 bg-gray-950 rounded-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-white tracking-widest font-bold">
                身份核验 / ID CHECK
              </h2>
              <span className="text-xs border border-red-800 text-red-400 px-2 py-0.5 rounded">
                甲方 / Party A
              </span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              确认操作者为甲方本人，防止代替操作。系统将进行人脸识别验证。
            </p>
            <div className="flex justify-center py-4">
              <ScanBox icon="🧑" label="扫描中 / SCANNING..." />
            </div>
            <button
              onClick={() => setStep('PARTY_B_VERIFY')}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white border border-red-800 rounded transition-all duration-200 tracking-widest"
            >
              ✓ 甲方验证通过 / A VERIFIED →
            </button>
          </section>
        )}

        {/* ── PARTY B VERIFY ───────────────────────────────────────────── */}
        {step === 'PARTY_B_VERIFY' && (
          <section className="border border-blue-900 bg-gray-950 rounded-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-white tracking-widest font-bold">
                身份核验 / ID CHECK
              </h2>
              <span className="text-xs border border-blue-700 text-blue-400 px-2 py-0.5 rounded">
                乙方 / Party B
              </span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              确认操作者为乙方本人。双方独立核验，确保各自真实意愿。
            </p>
            <div className="flex justify-center py-4">
              <ScanBox icon="🧑" label="扫描中 / SCANNING..." />
            </div>
            <button
              onClick={() => setStep('VIDEO_CONSENT')}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white border border-blue-800 rounded transition-all duration-200 tracking-widest"
            >
              ✓ 乙方验证通过 / B VERIFIED →
            </button>
          </section>
        )}

        {/* ── VIDEO CONSENT ────────────────────────────────────────────── */}
        {step === 'VIDEO_CONSENT' && (
          <section className="border border-red-900 bg-gray-950 rounded-lg p-6 space-y-5">
            <h2 className="text-lg text-white tracking-widest font-bold">
              视频存证 / VIDEO CONSENT
            </h2>
            <p className="text-gray-500 text-xs">
              双方须亲口确认同意。声明将进行哈希计算并写入区块链。
            </p>

            {/* Two-party video panels */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '甲方 / A', color: 'border-red-800', badge: 'text-red-400 border-red-800' },
                { label: '乙方 / B', color: 'border-blue-800', badge: 'text-blue-400 border-blue-800' },
              ].map(({ label, color, badge }) => (
                <div
                  key={label}
                  className={`border ${color} bg-black rounded aspect-video flex flex-col items-center justify-center gap-1`}
                >
                  <span className="text-red-700 text-2xl animate-pulse">●</span>
                  <span className={`text-xs border rounded px-1.5 py-0.5 ${badge}`}>
                    {label}
                  </span>
                  <span className="text-gray-700 text-[10px]">REC</span>
                </div>
              ))}
            </div>

            {/* Script */}
            <div className="bg-black border border-gray-800 rounded p-3 text-xs text-gray-400 leading-relaxed space-y-1">
              <p className="text-gray-600 text-[10px] tracking-widest uppercase mb-2">声明内容 / Statement</p>
              <p>"我已阅读并理解本次同意协议的全部内容。"</p>
              <p>"我在清醒、自愿、无胁迫的状态下作出本声明。"</p>
              <p>"我同意本次行为，并知悉该记录将被永久存储于区块链。"</p>
            </div>

            {/* Revoke notice */}
            <div className="text-xs text-gray-600 border border-gray-800 rounded p-2">
              ℹ️ 同意可随时撤销 — 任意一方均可在任何时间点吊销本存证。
            </div>

            <button
              onClick={() => setStep('BLOCKCHAIN_WRITE')}
              className="w-full py-3 bg-red-950 hover:bg-red-900 text-white border border-red-700 rounded transition-all duration-200 tracking-widest shadow-[0_0_10px_rgba(220,38,38,0.25)]"
            >
              双方确认，上链存证 / SIGN & COMMIT →
            </button>
          </section>
        )}

        {/* ── BLOCKCHAIN WRITE ─────────────────────────────────────────── */}
        {step === 'BLOCKCHAIN_WRITE' && (
          <section className="border border-green-900 bg-gray-950 rounded-lg p-6 space-y-4">
            <h2 className="text-lg text-white tracking-widest font-bold">
              区块链写入 / COMMITTING
            </h2>
            <p className="text-gray-500 text-xs">
              正在将存证写入以太坊区块链，此操作不可逆。
            </p>
            <BlockchainAnimation onDone={(t) => { setTx(t); setStep('SUCCESS'); }} />
          </section>
        )}

        {/* ── SUCCESS ──────────────────────────────────────────────────── */}
        {step === 'SUCCESS' && tx && (
          <section className="border border-green-800 bg-gray-950 rounded-lg p-6 space-y-5">
            <div className="text-center space-y-1">
              <div className="text-4xl">✅</div>
              <h2 className="text-xl text-green-400 tracking-widest font-bold">
                存证成功 / CONSENT LOGGED
              </h2>
              <p className="text-gray-500 text-xs">记录已写入区块链，任何人均可验证，任何人无法篡改。</p>
            </div>

            {/* Certificate */}
            <div className="bg-black border border-green-900 rounded-lg p-4 space-y-3">
              <p className="text-green-600 text-[10px] uppercase tracking-widest font-bold border-b border-green-900 pb-2">
                📜 同意存证证书 / Consent Certificate
              </p>
              {[
                { label: 'Agreement ID', value: tx.hash },
                { label: 'Block Number', value: '#' + tx.block.toLocaleString() },
                { label: 'Timestamp', value: tx.timestamp },
                { label: 'Gas Used', value: tx.gasUsed + ' wei' },
                { label: 'Network', value: 'Ethereum Mainnet (DEMO)' },
                { label: 'Status', value: '✓ Confirmed' },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-gray-600 text-[10px] uppercase tracking-widest">{label}</p>
                  <p className={`text-xs break-all ${label === 'Status' ? 'text-green-400' : 'text-gray-300'}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-600 border border-gray-800 rounded p-3 leading-relaxed space-y-1">
              <p>⚠️ 此证书仅为演示。</p>
              <p>ℹ️ 任意一方可随时撤销同意记录。撤销后状态将更新上链，但原始记录不会消失。</p>
              <p>⚖️ 本工具提供存证辅助，不代替法律认定。</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={reset}
                className="py-2 bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-700 rounded transition-all duration-200 text-xs tracking-widest"
              >
                重新试用 / RETRY
              </button>
              <Link
                href="/wallet"
                className="py-2 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded transition-all duration-200 text-xs tracking-widest text-center"
              >
                真实使用 / REAL →
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-gray-700 space-y-1">
        <p>区块链存证 · 此页面为演示模式 · 数据不上链</p>
        <p>
          <Link href="/" className="hover:text-gray-500 underline">← 返回首页</Link>
          {' · '}
          <Link href="/wallet" className="hover:text-gray-500 underline">连接钱包使用真实功能</Link>
        </p>
      </footer>
    </main>
  );
}
