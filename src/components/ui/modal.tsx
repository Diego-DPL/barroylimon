import { type ReactNode, useEffect } from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEsc)

    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-stone-900/30 bg-opacity-60 z-50 flex justify-center items-center transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-md w-full relative transform transition-all duration-300 scale-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-3 -right-3">
            <button
            onClick={onClose}
            className="bg-white rounded-full p-1.5 shadow-md hover:bg-stone-100 transition-colors"
            aria-label="Cerrar modal"
            >
            <X className="h-5 w-5 text-stone-600" />
            </button>
        </div>
        {children}
      </div>
    </div>
  )
}
