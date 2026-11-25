interface NavbarProps {
  onJoinWaitlist: () => void;
}

export function Navbar({ onJoinWaitlist }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 h-16 bg-[#F8FAFC]/90 dark:bg-[#090D16]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/90 transition-colors duration-150">
      <div className="max-w-7xl mx-auto h-full px-6 lg:px-10 flex items-center justify-between gap-8">
        <a
          href="#"
          className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
        >
          Proofline
        </a>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <a
            href="#how-it-works"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 decoration-slate-300 dark:decoration-slate-600 transition-colors whitespace-nowrap shrink-0"
          >
            How it works
          </a>
          <a
            href="#live-audit"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 decoration-slate-300 dark:decoration-slate-600 transition-colors whitespace-nowrap shrink-0"
          >
            Live Audit
          </a>
          <a
            href="#proof"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 decoration-slate-300 dark:decoration-slate-600 transition-colors whitespace-nowrap shrink-0"
          >
            Proof
          </a>
          <a
            href="#faq"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 decoration-slate-300 dark:decoration-slate-600 transition-colors whitespace-nowrap shrink-0"
          >
            FAQ
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onJoinWaitlist}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] active:scale-[0.99] rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
          >
            Join Early Access
          </button>
        </div>
      </div>
    </header>
  );
}
