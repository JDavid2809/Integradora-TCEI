import { createCheckoutSession } from '@/actions/customer-portal/customer-portal';

export function BuyButton({ courseId, label = 'Comprar Curso'}: { courseId: number; label?: string }) {
  return (
    <form action={createCheckoutSession.bind(null, courseId)}>
      <button
        type="submit"
        className="w-full bg-[#e30f28] text-white px-6 py-3 rounded-lg hover:bg-[#c20e24] transition-colors font-semibold flex items-center justify-center gap-2"
      >
        {label}
      </button>
    </form>
  );
}