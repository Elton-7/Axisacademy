import { MessageCircle } from 'lucide-react'
import { trackConversion } from '../services/analytics'
import { whatsappHref } from '../content/contact'

export default function WhatsAppFloat() {
  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackConversion('whatsapp_opened')}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 transition-transform duration-300 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-navy-surface" />
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-navy-surface bg-[#25D366] px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        WhatsApp Us
      </span>
    </a>
  )
}