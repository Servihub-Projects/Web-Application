import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

const faqs = [
  {
    question: "How do I book a service on ServiHub?",
    answer:
      "Simply search for the service you need, browse through verified professionals, compare their ratings and prices, and book instantly with your preferred provider. You can schedule a time that works best for you.",
  },
  {
    question: "Are all service providers verified?",
    answer:
      "Yes! All service providers on ServiHub go through a thorough vetting process including background checks, license verification, and insurance confirmation. We ensure only qualified professionals join our platform.",
  },
  {
    question: "How does payment work?",
    answer:
      "Payments are processed securely through our platform. Your payment is held in escrow until the service is completed to your satisfaction. You can pay using credit cards, debit cards, or digital wallets.",
  },
  {
    question: "What if I'm not satisfied with the service?",
    answer:
      "We have a satisfaction guarantee. If you're not happy with the service, contact our support team within 48 hours. We'll work with you and the provider to resolve any issues or process a refund if necessary.",
  },
  {
    question: "Can I cancel or reschedule a booking?",
    answer:
      "Yes, you can cancel or reschedule bookings through your account dashboard. Cancellation policies vary by provider, but most allow free cancellation up to 24 hours before the scheduled service.",
  },
  {
    question: "How do I become a service provider on ServiHub?",
    answer:
      'Click on "Become a Provider" and complete the application process. You\'ll need to provide your credentials, undergo a background check, and verify your insurance. Once approved, you can start accepting bookings.',
  },
  {
    question: "Is there a service fee?",
    answer:
      "For customers, there's a small service fee added to each booking that covers platform maintenance and customer support. Service providers keep 85% of their earnings, with 15% going to platform fees.",
  },
  {
    question: "What areas does ServiHub serve?",
    answer:
      "ServiHub is available in major cities across the country and expanding rapidly. Enter your location to see if service providers are available in your area. New cities are added regularly.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Got questions? We&apos;ve got answers
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-gray-200 rounded-lg px-6 hover:border-orange-300 transition-colors"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4 flex w-full items-center justify-between [&[data-state=open]>svg]:rotate-180">
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 transition-transform duration-200"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center p-8 bg-orange-50 rounded-xl">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Our support team is here to help you 24/7
          </p>
          <Link
            href="mailto:support@servihub.com"
            className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}
