"use client";

import { BookOpen, Briefcase, ClipboardCheck, MousePointer2, Users, Wallet } from "lucide-react";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function HowItWorks() {
  const { t } = useLanguage();

  const workerSteps = [
    {
      title: t("Register + Training", "নিবন্ধন + প্রশিক্ষণ"),
      desc: t(
        "Complete 3 short modules and get verified to unlock higher-paying tasks.",
        "৩টি ছোট মডিউল শেষ করুন এবং যাচাই হয়ে উচ্চ পারিশ্রমিকের কাজ আনলক করুন।"
      ),
      icon: <BookOpen className="w-8 h-8 text-white" />,
    },
    {
      title: t("Choose Tasks", "কাজ বেছে নিন"),
      desc: t(
        "Filter tasks by skills, pay, and deadline from your phone or laptop.",
        "ফোন বা ল্যাপটপ থেকে দক্ষতা, পারিশ্রমিক ও সময়সীমা অনুযায়ী কাজ বাছাই করুন।"
      ),
      icon: <MousePointer2 className="w-8 h-8 text-white" />,
    },
    {
      title: t("Get Paid", "পারিশ্রমিক পান"),
      desc: t(
        "Submit work, get approved, and receive bKash payouts every week.",
        "কাজ জমা দিন, অনুমোদন পান, এবং প্রতি সপ্তাহে বিকাশে টাকা পান।"
      ),
      icon: <Wallet className="w-8 h-8 text-white" />,
    },
  ];

  const employerSteps = [
    {
      title: t("Post a Task", "কাজ পোস্ট করুন"),
      desc: t(
        "Describe your task, pay per unit, and deadline in minutes.",
        "কাজের বিবরণ, ইউনিটপ্রতি পারিশ্রমিক ও সময়সীমা মিনিটেই যোগ করুন।"
      ),
      icon: <Briefcase className="w-8 h-8 text-white" />,
    },
    {
      title: t("Match Talent", "উপযুক্ত কর্মী খুঁজুন"),
      desc: t(
        "Browse verified workers and assign tasks based on skills.",
        "যাচাইকৃত কর্মী দেখুন এবং দক্ষতা অনুযায়ী কাজ দিন।"
      ),
      icon: <Users className="w-8 h-8 text-white" />,
    },
    {
      title: t("Review + Pay", "রিভিউ + পেমেন্ট"),
      desc: t(
        "Approve submissions and trigger payments with full visibility.",
        "জমা দেওয়া কাজ অনুমোদন করুন এবং স্বচ্ছভাবে পেমেন্ট দিন।"
      ),
      icon: <ClipboardCheck className="w-8 h-8 text-white" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-gray-900 mb-4">{t("How Bunon Works", "বুনন কীভাবে কাজ করে")}</h2>
          <div className="w-20 h-1.5 bg-saffron mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <h3 className="text-2xl font-bold text-teal-dark mb-6">{t("For Workers", "কর্মীদের জন্য")}</h3>
            <div className="grid gap-10">
              {workerSteps.map((step) => (
                <div key={step.title} className="relative group">
                  <div className="mb-6 w-16 h-16 bg-teal-dark rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                    {step.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-teal-dark mb-6">{t("For Employers", "নিয়োগদাতাদের জন্য")}</h3>
            <div className="grid gap-10">
              {employerSteps.map((step) => (
                <div key={step.title} className="relative group">
                  <div className="mb-6 w-16 h-16 bg-teal-dark rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                    {step.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}