"use client";

import Hero from "@/components/landing/Hero";
import ImpactStats from "@/components/landing/ImpactStats";
import HowItWorks from "@/components/landing/HowItWorks";
import Link from "next/link";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function LandingPage() {
  const { t } = useLanguage();

  const testimonials = [
    {
      name: t("Ayesha, Khulna", "আয়েশা, খুলনা"),
      quote: t(
        "I learned how to do data labeling in three days and now I earn every week without leaving home.",
        "তিন দিনে ডেটা লেবেলিং শিখেছি এবং এখন ঘর না ছেড়েই প্রতি সপ্তাহে আয় করি।"
      ),
    },
    {
      name: t("Nusrat, Rajshahi", "নুসরাত, রাজশাহী"),
      quote: t(
        "The tasks are clear and the training was simple. I can support my family while staying with my children.",
        "কাজগুলো স্পষ্ট আর প্রশিক্ষণ সহজ ছিল। বাচ্চাদের সাথে থেকেও পরিবারের খরচ চালাতে পারি।"
      ),
    },
    {
      name: t("Shila, Barisal", "শীলা, বরিশাল"),
      quote: t(
        "I never used a computer before. Now I work from my phone and feel proud every time I get paid.",
        "আগে কখনও কম্পিউটার ব্যবহার করিনি। এখন ফোনে কাজ করি এবং টাকা পেলেই গর্ব লাগে।"
      ),
    },
  ];

  const faqs = [
    {
      question: t("Do I need prior experience?", "আগে অভিজ্ঞতা দরকার কি?"),
      answer: t(
        "No. The training is beginner-friendly and designed for first-time online workers.",
        "না। প্রশিক্ষণটি নতুনদের জন্য সহজভাবে তৈরি করা।"
      ),
    },
    {
      question: t("How do I get paid?", "কিভাবে টাকা পাবো?"),
      answer: t(
        "Payments are sent directly to your bKash number after your work is approved.",
        "আপনার কাজ অনুমোদিত হলে বিকাশ নম্বরে সরাসরি টাকা পাঠানো হয়।"
      ),
    },
    {
      question: t("Can I work from a phone?", "ফোন থেকে কাজ করা যাবে?"),
      answer: t(
        "Yes. Most tasks are mobile-friendly and can be completed with a smartphone.",
        "হ্যাঁ। বেশিরভাগ কাজ মোবাইল ফ্রেন্ডলি এবং স্মার্টফোনে করা যায়।"
      ),
    },
    {
      question: t("When can I start?", "কখন থেকে শুরু করতে পারব?"),
      answer: t(
        "Right after registration and training. Most workers start earning within a few days.",
        "নিবন্ধন ও প্রশিক্ষণ শেষ করলেই। বেশিরভাগ কর্মী কয়েক দিনের মধ্যেই আয় শুরু করে।"
      ),
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
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t("Stories from Our Workers", "আমাদের কর্মীদের গল্প")}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t(
                "Real people. Real income. Real dignity. These are the women shaping the future of work.",
                "বাস্তব মানুষ। বাস্তব আয়। বাস্তব মর্যাদা। এই নারীরাই কাজের ভবিষ্যৎ গড়ছেন।"
              )}
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
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t("Frequently Asked Questions", "প্রশ্নোত্তর")}</h2>
            <p className="text-gray-600">{t("Everything you need to know before getting started.", "শুরু করার আগে যা জানা দরকার।")}</p>
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
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              {t("Ready to start earning?", "আয় শুরু করতে প্রস্তুত?")}
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              {t(
                "Join the community of women weaving their own financial independence. No experience required.",
                "নিজস্ব আর্থিক স্বাধীনতা গড়তে নারীদের এই কমিউনিটিতে যোগ দিন। কোন অভিজ্ঞতা দরকার নেই।"
              )}
            </p>
            <Link href="/auth/register" className="bg-saffron text-teal-dark px-10 py-4 rounded-full font-black text-xl hover:scale-105 transition-transform inline-block">
              {t("Apply as a Worker", "কর্মী হিসেবে আবেদন করুন")}
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
            {t("\"Work from home. Earn with dignity.\"", "\"ঘরে বসে কাজ করুন। সম্মানের সাথে আয় করুন।\"")}
          </p>
          <div className="flex gap-8 text-sm font-bold text-gray-600">
            <a href="#" className="hover:text-saffron">{t("Terms", "শর্তাবলী")}</a>
            <a href="#" className="hover:text-saffron">{t("Privacy", "গোপনীয়তা")}</a>
            <a href="https://wa.me/8801XXXXXXXXX" className="text-teal-dark">{t("WhatsApp Support", "হোয়াটসঅ্যাপ সাপোর্ট")}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}