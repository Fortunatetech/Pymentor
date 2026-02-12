"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: string) => {
    setLoading(plan);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <nav className="bg-white border-b border-dark-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐍</span>
            <span className="font-bold text-xl text-dark-900">PyMentor AI</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Back to Dashboard</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-900 mb-4">
            Upgrade to Pro
          </h1>
          <p className="text-xl text-dark-500">
            Unlock unlimited learning and take your Python skills to the next level
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-white rounded-2xl p-6 border border-dark-200">
            <h3 className="font-semibold text-dark-900 mb-1">Free</h3>
            <div className="text-3xl font-bold text-dark-900 mb-4">
              $0<span className="text-lg font-normal text-dark-400">/mo</span>
            </div>
            <p className="text-dark-500 text-sm mb-6">Get started with Python basics</p>

            <ul className="space-y-3 mb-6">
              <Feature included>Module 1 lessons</Feature>
              <Feature included>15 AI messages/day</Feature>
              <Feature included>Code playground</Feature>
              <Feature>Unlimited lessons</Feature>
              <Feature>Daily challenges</Feature>
              <Feature>Streak tracking</Feature>
            </ul>

            <Button variant="secondary" className="w-full" disabled>
              Current Plan
            </Button>
          </div>

          {/* Pro Annual - Highlighted, center position */}
          <div className="bg-white rounded-2xl p-6 border-2 border-primary-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              BEST VALUE
            </div>
            <h3 className="font-semibold text-dark-900 mb-1">Pro Annual</h3>
            <div className="text-3xl font-bold text-dark-900 mb-1">
              $8<span className="text-lg font-normal text-dark-400">/mo</span>
            </div>
            <p className="text-sm text-primary-600 mb-4">$96/year — Save 33%</p>
            <p className="text-dark-500 text-sm mb-6">Best value for committed learners</p>

            <ul className="space-y-3 mb-6">
              <Feature included>Everything in Pro</Feature>
              <Feature included>4 months free vs monthly</Feature>
              <Feature included>Early access to new features</Feature>
              <Feature included>Exclusive content</Feature>
            </ul>

            <Button
              className="w-full"
              onClick={() => handleCheckout("pro_annual")}
              disabled={loading !== null}
            >
              {loading === "pro_annual" ? "Loading..." : "Get Best Value"}
            </Button>
          </div>

          {/* Pro Monthly */}
          <div className="bg-white rounded-2xl p-6 border border-dark-200">
            <h3 className="font-semibold text-dark-900 mb-1">Pro Monthly</h3>
            <div className="text-3xl font-bold text-dark-900 mb-4">
              $12<span className="text-lg font-normal text-dark-400">/mo</span>
            </div>
            <p className="text-dark-500 text-sm mb-6">Full access, cancel anytime</p>

            <ul className="space-y-3 mb-6">
              <Feature included>Unlimited lessons</Feature>
              <Feature included>500 AI messages/day</Feature>
              <Feature included>Daily challenges</Feature>
              <Feature included>Streak tracking</Feature>
              <Feature included>All projects</Feature>
              <Feature included>Priority support</Feature>
            </ul>

            <Button
              variant="secondary"
              className="w-full border-primary-500 text-primary-600 hover:bg-primary-50"
              onClick={() => handleCheckout("pro_monthly")}
              disabled={loading !== null}
            >
              {loading === "pro_monthly" ? "Loading..." : "Subscribe Monthly"}
            </Button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-dark-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <FAQ
              q="Can I cancel anytime?"
              a="Yes! Cancel anytime from your dashboard. You'll keep access until the end of your billing period."
            />
            <FAQ
              q="What payment methods do you accept?"
              a="We accept all major credit cards through Stripe."
            />
            <FAQ
              q="Is there a free trial?"
              a="The free plan gives you full access to Module 1 and 15 AI messages per day. No credit card required!"
            />
            <FAQ
              q="What happens to my progress if I cancel?"
              a="Your progress is saved forever! You can always come back and continue where you left off."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ children, included = false }: { children: React.ReactNode; included?: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className={included ? "text-primary-500" : "text-dark-300"}>
        {included ? "✓" : "✗"}
      </span>
      <span className={included ? "text-dark-600" : "text-dark-400"}>
        {children}
      </span>
    </li>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-dark-100">
      <h3 className="font-medium text-dark-900 mb-2">{q}</h3>
      <p className="text-dark-500 text-sm">{a}</p>
    </div>
  );
}
