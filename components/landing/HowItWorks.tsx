import { BookOpen, Briefcase, ClipboardCheck, MousePointer2, Users, Wallet } from "lucide-react";

export default function HowItWorks() {
  const workerSteps = [
    {
      title: "Register + Training",
      desc: "Complete 3 short modules and get verified to unlock higher-paying tasks.",
      icon: <BookOpen className="w-8 h-8 text-white" />,
    },
    {
      title: "Choose Tasks",
      desc: "Filter tasks by skills, pay, and deadline from your phone or laptop.",
      icon: <MousePointer2 className="w-8 h-8 text-white" />,
    },
    {
      title: "Get Paid",
      desc: "Submit work, get approved, and receive bKash payouts every week.",
      icon: <Wallet className="w-8 h-8 text-white" />,
    },
  ];

  const employerSteps = [
    {
      title: "Post a Task",
      desc: "Describe your task, pay per unit, and deadline in minutes.",
      icon: <Briefcase className="w-8 h-8 text-white" />,
    },
    {
      title: "Match Talent",
      desc: "Browse verified workers and assign tasks based on skills.",
      icon: <Users className="w-8 h-8 text-white" />,
    },
    {
      title: "Review + Pay",
      desc: "Approve submissions and trigger payments with full visibility.",
      icon: <ClipboardCheck className="w-8 h-8 text-white" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-gray-900 mb-4">How Bunon Works</h2>
          <div className="w-20 h-1.5 bg-saffron mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <h3 className="text-2xl font-bold text-teal-dark mb-6">For Workers</h3>
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
            <h3 className="text-2xl font-bold text-teal-dark mb-6">For Employers</h3>
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