'use client';
import { useState } from 'react';
import Link from 'next/link';

type Step = 'INIT' | 'VERIFY' | 'RECORD' | 'SIGNED';

export default function Home() {
  const [step, setStep] = useState<Step>('INIT');
  const [agreementId, setAgreementId] = useState<string>('');

  function simulateBlockchainWrite() {
    const hash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setAgreementId('0x' + hash);
    setStep('SIGNED');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-red-600 p-4 font-mono">
      <h1 className="text-4xl font-bold mb-2 tracking-widest border-b-2 border-red-600 pb-2">
        判了吗
      </h1>
      <p className="text-gray-500 text-sm mb-10 tracking-widest">JUDGEMENT / 区块链同意存证</p>

      {step === 'INIT' && (
        <div className="space-y-6 text-center max-w-md w-full">
          <p className="text-gray-400 text-sm leading-relaxed">
            建立不可篡改的同意契约。<br />
            双方意志，永久上链。
          </p>
          <button
            onClick={() => setStep('VERIFY')}
            className="w-full px-8 py-4 bg-red-900 hover:bg-red-700 text-white font-bold rounded shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-200 tracking-widest"
          >
            发起契约 / INITIATE
          </button>
        </div>
      )}

      {step === 'VERIFY' && (
        <div className="space-y-4 border border-red-900 p-6 rounded bg-gray-950 w-full max-w-md">
          <h2 className="text-xl text-white tracking-widest">身份核验 / ID CHECK</h2>
          <p className="text-gray-500 text-xs">确认操作者为本人，防止代替操作。</p>
          <div className="h-36 bg-black flex flex-col items-center justify-center border border-dashed border-gray-700 rounded gap-2">
            <span className="text-5xl">👁</span>
            <span className="text-gray-600 text-xs tracking-widest">[ 模拟 FaceID / 生物识别 ]</span>
          </div>
          <button
            onClick={() => setStep('RECORD')}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white border border-red-800 rounded transition-all duration-200 tracking-widest"
          >
            确认本人 / CONFIRM IDENTITY
          </button>
        </div>
      )}

      {step === 'RECORD' && (
        <div className="space-y-4 border border-red-900 p-6 rounded bg-gray-950 w-full max-w-md">
          <h2 className="text-xl text-white tracking-widest">视频存证 / VIDEO CONSENT</h2>
          <p className="text-gray-500 text-xs">录制同意声明，哈希值将写入区块链。</p>
          <div className="h-36 bg-black flex flex-col items-center justify-center border border-dashed border-gray-700 rounded gap-2">
            <span className="text-5xl text-red-700 animate-pulse">●</span>
            <span className="text-gray-600 text-xs tracking-widest">[ 模拟摄像头录制中... ]</span>
          </div>
          <p className="text-gray-600 text-xs border border-gray-800 rounded p-2 leading-relaxed">
            "我是本人，在清醒自愿状态下，同意本次行为。"
          </p>
          <button
            onClick={simulateBlockchainWrite}
            className="w-full py-3 bg-red-950 hover:bg-red-900 text-white border border-red-700 rounded transition-all duration-200 tracking-widest shadow-[0_0_10px_rgba(220,38,38,0.3)]"
          >
            确认并上链 / SIGN & COMMIT
          </button>
        </div>
      )}

      {step === 'SIGNED' && (
        <div className="space-y-4 border border-green-900 p-6 rounded bg-gray-950 w-full max-w-md text-center">
          <h2 className="text-xl text-green-400 tracking-widest">存证成功 / CONSENT LOGGED</h2>
          <p className="text-gray-500 text-xs">记录已写入区块链，不可篡改。</p>
          <div className="bg-black p-3 rounded border border-gray-800">
            <p className="text-gray-500 text-xs mb-1 tracking-widest">AGREEMENT ID</p>
            <p className="text-green-500 text-xs break-all font-mono">{agreementId}</p>
          </div>
          <p className="text-gray-600 text-xs leading-relaxed">
            ⚠️ 提示：同意可随时撤销。任何一方均可申请销毁记录。
          </p>
          <button
            onClick={() => { setStep('INIT'); setAgreementId(''); }}
            className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-700 rounded transition-all duration-200 text-xs tracking-widest"
          >
            重置 / RESET
          </button>
        </div>
      )}

      <footer className="mt-16 text-gray-800 text-xs tracking-widest text-center space-y-2">
        <p>区块链存证 · 仅作技术演示 · 不构成法律效力</p>
        <p>
          <Link href="/wallet" className="text-red-900 hover:text-red-700 underline">
            → 连接钱包 / Connect Wallet
          </Link>
        </p>
      </footer>
    </main>
  );
}
