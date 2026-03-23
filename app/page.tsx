import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center px-4 py-16">
      {/* Title */}
      <header className="text-center mb-12 space-y-3">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-widest text-red-600">
          判了吗
        </h1>
        <p className="text-gray-500 text-sm tracking-widest">
          PAN LE MA · 区块链同意存证
        </p>
        <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
          Blockchain-based mutual consent verification.<br />
          双方知情同意，永久上链存证。
        </p>
      </header>

      {/* CTA cards */}
      <div className="w-full max-w-sm space-y-4">

        {/* Demo — primary CTA */}
        <Link
          href="/demo"
          className="block w-full border border-yellow-700 bg-yellow-950/40 hover:bg-yellow-950/70 rounded-lg p-5 transition-all duration-200 group"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">🎮</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-yellow-300 font-bold tracking-widest text-sm">
                  免费试用 / DEMO
                </p>
                <span className="text-[10px] border border-yellow-700 text-yellow-500 px-1.5 py-0.5 rounded">
                  推荐 / START HERE
                </span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                无需钱包，无需链地址。完整体验双方同意流程、身份核验、视频存证和区块链写入动画。
              </p>
            </div>
          </div>
        </Link>

        {/* Wallet — advanced */}
        <Link
          href="/wallet"
          className="block w-full border border-gray-800 bg-gray-950 hover:bg-gray-900 rounded-lg p-5 transition-all duration-200 group"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">⛓</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-gray-300 font-bold tracking-widest text-sm">
                  真实使用 / REAL
                </p>
                <span className="text-[10px] border border-gray-700 text-gray-500 px-1.5 py-0.5 rounded">
                  需要钱包
                </span>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                连接 MetaMask 钱包，将同意记录真实写入以太坊区块链。需要已部署的合约地址。
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Features */}
      <div className="mt-12 w-full max-w-sm grid grid-cols-3 gap-3 text-center">
        {[
          { icon: '🔒', label: '不可篡改', sub: 'Immutable' },
          { icon: '⏱', label: '精确时间戳', sub: 'Timestamped' },
          { icon: '↩️', label: '可随时撤销', sub: 'Revocable' },
        ].map(({ icon, label, sub }) => (
          <div key={label} className="border border-gray-800 rounded p-3 space-y-1">
            <div className="text-xl">{icon}</div>
            <p className="text-xs text-gray-300">{label}</p>
            <p className="text-[10px] text-gray-600">{sub}</p>
          </div>
        ))}
      </div>

      <footer className="mt-16 text-gray-700 text-xs text-center space-y-1">
        <p>仅作技术演示 · 不构成法律效力</p>
        <p>This tool provides evidence, not legal guarantee.</p>
      </footer>
    </main>
  );
}
