import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

const FAQS = [
  {
    q: "How does escrow work on ServiHub?",
    a: "When you book a service, your payment is held securely by ServiHub — not the provider. Funds are released to the provider only after you confirm the job is done to your satisfaction. If there's a dispute, our team reviews the evidence and resolves it.",
  },
  {
    q: "Are providers vetted before they join?",
    a: "Yes. Every provider goes through credential verification, trade licence checks, and identity confirmation before their profile goes live. Verified badges on profiles indicate completed checks.",
  },
  {
    q: "Can I book a provider for the same day?",
    a: "Yes. Where providers show 'Available now' on their profile, same-day bookings are possible. Use the availability filter in Discover to find providers with immediate availability in your area.",
  },
  {
    q: "What if a provider doesn't show up or does poor work?",
    a: "Raise a dispute within 48 hours of the job completion date. Our support team will review the evidence — photos, messages, job description — and either arrange a re-do or issue a full refund from escrow.",
  },
  {
    q: "What cities is ServiHub active in?",
    a: "We are currently active in Lagos, Abuja, Port Harcourt, Enugu, Kano, and Ibadan. We expand to new cities every quarter — join the waitlist to be notified when we launch in your city.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-14 md:py-20 bg-slate-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3">
            Common questions
          </h2>
          <p className="text-slate-500 text-sm md:text-base">
            Everything you need to know before your first booking
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-slate-200 rounded-xl px-5 bg-white hover:border-orange-200 transition-colors"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4 flex w-full items-center justify-between [&[data-state=open]>svg]:rotate-180">
                <span className="font-semibold text-slate-800 pr-4 text-sm md:text-base">
                  {faq.q}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-slate-400 transition-transform duration-200"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </AccordionTrigger>
              <AccordionContent className="text-slate-500 pb-4 text-sm leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 text-center p-7 bg-orange-50 rounded-2xl border border-orange-100">
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Still have questions?
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            Our support team is here to help you 24/7
          </p>
          <Link
            href="mailto:support@servihub.com"
            className="inline-block px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}
