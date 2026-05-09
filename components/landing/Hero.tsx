import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-gray-50 py-16 md:py-24 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block px-4 py-1 rounded-full bg-saffron/10 text-saffron text-sm font-bold mb-4">
            SBDC 2026 Project
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
            Weaving <span className="text-teal-dark">Digital</span> Futures.
          </h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-md">
            Empowering housebound women in Bangladesh through remote microwork and specialized skill training.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth/register?role=worker" className="bg-teal-dark text-white text-center px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all">
              Become a Worker
            </Link>
            <Link href="/auth/register?role=employer" className="bg-white border-2 border-teal-dark text-teal-dark text-center px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all">
              Hire Talent
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="w-full h-[400px] bg-teal-dark/5 rounded-3xl border-2 border-dashed border-teal-dark/20 flex items-center justify-center overflow-hidden">
            <div className="text-teal-dark/40 font-medium italic">Image of Empowered Worker</div>
            {/* Once you have an image, use: <img src="/hero-img.jpg" className="object-cover w-full h-full" /> */}
          </div>
          {/* Decorative element */}
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-saffron rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}