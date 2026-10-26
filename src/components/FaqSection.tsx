import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  { q: "How many days to dispatch?", a: "Orders are dispatched within 1–2 business days." },
  { q: "How many days for returns?", a: "Returns can be raised within 36 hours of delivery." },
  { q: "Is COD available?", a: "Yes, cash on delivery is available across India." },
  { q: "How long does delivery take?", a: "Most orders arrive in 3–6 business days after dispatch." },
  { q: "Do you ship pan-India?", a: "Yes, we ship to all serviceable pin codes in India." },
  { q: "Is shipping free?", a: "Yes — we offer free shipping across India on all orders." },
];

export function FaqSection() {
  return (
    <section className="border-t-4 border-primary bg-secondary/40">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Good to know
        </p>
        <h2 className="mt-3 text-center text-3xl font-semibold sm:text-4xl">
          Frequently asked <span className="text-primary">questions</span>
        </h2>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-primary" />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Everything you need to know about shipping, returns and payments.
        </p>
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.map((faq) => (
            <AccordionItem
              key={faq.q}
              value={faq.q}
              className="border-primary/20 transition-colors hover:border-primary/50"
            >
              <AccordionTrigger className="text-left text-base font-medium hover:text-primary">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="border-l-2 border-primary/40 pl-4 text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
