import { Instagram, Twitter } from 'lucide-react'

const Navbar = () => {
  return (
    <div className="fixed top-4 left-0 right-0 z-90 flex justify-center">
      <nav className="flex w-full max-w-5xl items-center justify-between rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md shadow-lg">
        <div className="text-sm sm:text-base font-semibold tracking-tight text-white">
          Move Arcade
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/90 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <Instagram size={18} strokeWidth={2} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/90 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <Twitter size={18} strokeWidth={2} />
          </a>
        </div>
      </nav>
    </div>
  )
}

export default Navbar