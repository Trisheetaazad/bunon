import Hero from '@/components/landing/Hero';
import ImpactStats from '@/components/landing/ImpactStats';
import HowItWorks from '@/components/landing/HowItWorks';
import Link from 'next/link';

export default function LandingPage() {
  const testimonials = [
    {
      name: "Ayesha, Khulna",
      quote:
        "I learned how to do data labeling in three days and now I earn every week without leaving home.",
    },
    {
      name: "Nusrat, Rajshahi",
      quote:
        "The tasks are clear and the training was simple. I can support my family while staying with my children.",
    },
    {
      name: "Shila, Barisal",
      quote:
        "I never used a computer before. Now I work from my phone and feel proud every time I get paid.",
    },
  ];

  const faqs = [
    {
      question: "Do I need prior experience?",
      answer:
        "No. The training is beginner-friendly and designed for first-time online workers.",
    },
    {
      question: "How do I get paid?",
      answer:
        "Payments are sent directly to your bKash number after your work is approved.",
    },
    {
      question: "Can I work from a phone?",
      answer:
        "Yes. Most tasks are mobile-friendly and can be completed with a smartphone.",
    },
    {
      question: "When can I start?",
      answer:
        "Right after registration and training. Most workers start earning within a few days.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <ImpactStats />
      <HowItWorks />

      {/* Testimonials */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Stories from Our Workers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real people. Real income. Real dignity. These are the women shaping the future of work.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm"
              >
                <p className="text-gray-700 leading-relaxed mb-6">&quot;{item.quote}&quot;</p>
                <div className="text-teal-dark font-bold">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Everything you need to know before getting started.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((item) => (
              <details key={item.question} className="group border border-gray-100 rounded-2xl p-6">
                <summary className="cursor-pointer list-none font-bold text-teal-dark flex items-center justify-between">
                  {item.question}
                  <span className="text-gray-400 group-open:rotate-45 transition">+</span>
                </summary>
                <p className="text-gray-600 leading-relaxed mt-3">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-teal-dark rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to start earning?</h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Join the community of women weaving their own financial independence. No experience required.
            </p>
            <Link href="/auth/register" className="bg-saffron text-teal-dark px-10 py-4 rounded-full font-black text-xl hover:scale-105 transition-transform inline-block">
              Apply as a Worker
            </Link>
          </div>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-black text-teal-dark">BUNON.</div>
          <p className="text-gray-400 text-sm italic text-center">
            &quot;Work from home. Earn with dignity.&quot;
          </p>
          <div className="flex gap-8 text-sm font-bold text-gray-600">
            <a href="#" className="hover:text-saffron">Terms</a>
            <a href="#" className="hover:text-saffron">Privacy</a>
            <a href="https://wa.me/8801XXXXXXXXX" className="text-teal-dark">WhatsApp Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
}