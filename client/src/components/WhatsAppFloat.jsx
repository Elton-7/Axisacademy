import { MessageCircle } from 'lucide-react'

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/254737003007"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40 hover:scale-110 transition-transform"
    >
      <MessageCircle size={28} className="text-white" />
      <span className="absolute -bottom-5 text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
        WhatsApp Us
      </span>
    </a>
  )
}
