import { X } from 'lucide-react'

export default function ImageLightbox({ src, alt, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div className="relative max-w-7xl w-full">
        <img
          src={src}
          alt={alt || "Variant screenshot"}
          className="max-h-[85vh] w-auto mx-auto rounded-3xl shadow-2xl ring-1 ring-white/10"
          onClick={e => e.stopPropagation()}
        />
        <button
          className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white backdrop-blur-xl transition-all shadow-lg border border-white/10"
          onClick={onClose}
        >
          <X size={24} />
        </button>
      </div>
    </div>
  )
}