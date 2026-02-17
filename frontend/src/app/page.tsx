import BuyButton from "@/components/BuyButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black selection:bg-blue-500/30 overflow-hidden">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-12 px-4">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-800 bg-black/50 backdrop-blur-md pb-6 pt-8 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-900/50 lg:p-4 text-gray-300">
          SENTINEL PROJECT&nbsp;
          <code className="font-bold text-blue-500">v1.0</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-black via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0 text-gray-500 hover:text-white transition-colors"
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
          >
            Admin Dashboard <span className="text-xl">→</span>
          </a>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 tracking-tighter">
            FLASH SALE
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-light tracking-wide max-w-2xl">
            High Concurrency. Zero Overselling. Bot Proof.
          </p>
        </div>

        {/* THE MAIN COMPONENT */}
        <BuyButton />
      </div>

      <div className="mt-20 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-4 px-4 pb-20">
        <FeatureCard title="Redis Atomic" desc="Prevents race conditions using single-threaded counters." />
        <FeatureCard title="Kafka Async" desc="Buffers 100k requests/sec to protect the database." />
        <FeatureCard title="Sentinel Defense" desc="Honey pots & fingerprinting to ban bots instantly." />
      </div>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="group rounded-lg border border-gray-800 px-5 py-4 transition-colors hover:border-gray-600 hover:bg-gray-900/50">
      <h2 className="mb-3 text-2xl font-semibold text-gray-200">
        {title} <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
      </h2>
      <p className="m-0 max-w-[30ch] text-sm text-gray-500">
        {desc}
      </p>
    </div>
  );
}