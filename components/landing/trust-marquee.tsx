"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export function TrustMarquee() {
  const logos = [
    "ACME CORP", "STARLIGHT SAAS", "HORIZON LABS", "APEX GLOBAL", "NEXTGEN CLOUD", "VANGUARD DYNAMICS"
  ];

  const testimonials = [
    {
      quote: "Okleevo consolidated 4 separate subscriptions into one ultra-fast workspace. Our sales cycle dropped from 18 days to 4 days.",
      author: "Marcus Vance",
      title: "VP of Operations, Starlight SaaS",
      rating: 5,
    },
    {
      quote: "The malware-scanned client file vault and zero-friction video huddles completely transformed how we interact with high-value enterprise clients.",
      author: "Elena Rostova",
      title: "Head of Product, Horizon Labs",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-white text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logos Bar */}
        <div className="text-center mb-10">
          <p className="text-xs font-mono uppercase font-bold tracking-widest text-slate-500">
            Trusted by fast-growing remote teams & enterprises worldwide
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {logos.map((logo, idx) => (
              <span
                key={idx}
                className="text-sm font-extrabold font-mono tracking-wider text-slate-400 hover:text-slate-900 transition duration-200 cursor-default"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200 backdrop-blur-xl relative flex flex-col justify-between shadow-sm"
            >
              <Quote className="w-8 h-8 text-orange-500/40 mb-4" />
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic font-medium">
                "{item.quote}"
              </p>
              
              <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.author}</h4>
                  <p className="text-xs text-slate-500 font-medium">{item.title}</p>
                </div>
                <div className="flex gap-1 text-amber-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
