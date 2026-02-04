import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-dark-100 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐍</span>
            <span className="font-bold text-xl text-dark-900">PyMentor AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-dark-600 hover:text-dark-900 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-dark-600 hover:text-dark-900 transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-dark-600 hover:text-dark-900 transition-colors">
              Log in
            </Link>
            <Link href="/signup">
              <Button size="sm">Start Learning Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm mb-6">
            <span className="text-sm">🚀</span>
            <span className="text-sm text-dark-600">AI-powered learning with persistent memory</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-dark-900 mb-6 leading-tight">
            Learn Python with an AI tutor
            <br />
            <span className="gradient-text">that remembers you</span>
          </h1>
          
          <p className="text-xl text-dark-500 mb-8 max-w-2xl mx-auto">
            A patient, personalized tutor that adapts to your pace, celebrates your wins, 
            and guides you from zero to Python developer.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button size="lg">
                Start Learning Free →
              </Button>
            </Link>
            <Button variant="secondary" size="lg">
              Watch Demo
            </Button>
          </div>

          {/* Hero Code Preview */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-dark-200">
            <div className="bg-dark-800 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-dark-400 text-sm ml-2 font-mono">PyMentor AI</span>
            </div>
            <div className="p-6 flex gap-4">
              <div className="flex-1 bg-dark-900 rounded-xl p-4">
                <pre className="text-sm text-green-400 font-mono">
                  <code>
                    <span className="text-purple-400">def</span>{" "}
                    <span className="text-yellow-400">greet</span>(name):{"\n"}
                    {"    "}<span className="text-purple-400">return</span>{" "}
                    <span className="text-green-300">f&quot;Hello, &#123;name&#125;!&quot;</span>
                    {"\n\n"}
                    <span className="text-dark-400"># Try it yourself!</span>{"\n"}
                    print(greet(<span className="text-green-300">&quot;Carlos&quot;</span>))
                  </code>
                </pre>
              </div>
              <div className="w-80 bg-dark-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm">
                    🐍
                  </div>
                  <div className="flex-1 bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-dark-700">
                      Great job! You just created your first function! 🎉 
                      Functions are reusable blocks of code. Want to try adding a second parameter?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-dark-900 mb-4">
            Why PyMentor AI?
          </h2>
          <p className="text-dark-500 text-center mb-12 max-w-2xl mx-auto">
            Unlike generic chatbots or rigid courses, we combine the best of AI with proven learning science.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🧠"
              title="Memory That Persists"
              description="Unlike ChatGPT, I remember what you've learned across sessions. No more repeating yourself."
            />
            <FeatureCard
              icon="🎯"
              title="Adaptive Difficulty"
              description="Too easy? I'll challenge you. Struggling? I'll slow down. Your pace, always."
            />
            <FeatureCard
              icon="🏗️"
              title="Learn by Building"
              description="No more tutorial hell. Build real projects from day one with guided support."
            />
            <FeatureCard
              icon="💬"
              title="Socratic Teaching"
              description="I guide you to answers through questions, building real problem-solving skills."
            />
            <FeatureCard
              icon="🔥"
              title="Streak System"
              description="Stay motivated with daily streaks, XP points, and achievements."
            />
            <FeatureCard
              icon="💰"
              title="Affordable"
              description="Premium learning at a fraction of the cost. Less than a coffee per week."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-dark-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-dark-900 mb-4">
            Simple, Affordable Pricing
          </h2>
          <p className="text-dark-500 text-center mb-12">
            Less than a coffee per week. Cancel anytime.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              name="Free"
              price="$0"
              period="/mo"
              features={[
                { text: "3 lessons", included: true },
                { text: "10 AI messages/day", included: true },
                { text: "Code playground", included: true },
                { text: "Streaks & progress", included: false },
              ]}
              buttonText="Get Started"
              buttonVariant="secondary"
            />
            <PricingCard
              name="Pro Monthly"
              price="$15"
              period="/mo"
              popular
              features={[
                { text: "Unlimited lessons", included: true },
                { text: "Unlimited AI chat", included: true },
                { text: "All projects", included: true },
                { text: "Streaks & progress", included: true },
              ]}
              buttonText="Subscribe"
              buttonVariant="primary"
            />
            <PricingCard
              name="Pro Annual"
              price="$12"
              period="/mo"
              savings="Save 20%"
              features={[
                { text: "Everything in Pro", included: true },
                { text: "Priority support", included: true },
                { text: "Early access features", included: true },
              ]}
              buttonText="Best Value"
              buttonVariant="secondary"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start your Python journey?
          </h2>
          <p className="text-primary-100 mb-8">
            Join thousands of learners who are mastering Python with their personal AI tutor.
          </p>
          <Link href="/signup">
            <Button variant="secondary" size="lg">
              Start Learning Free →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 text-dark-400 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐍</span>
            <span className="font-bold text-lg text-white">PyMentor AI</span>
          </div>
          <p className="text-sm">
            © 2024 PyMentor AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-dark-50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-dark-900 mb-2">{title}</h3>
      <p className="text-dark-500">{description}</p>
    </div>
  );
}

interface PricingFeature {
  text: string;
  included: boolean;
}

function PricingCard({
  name,
  price,
  period,
  savings,
  popular,
  features,
  buttonText,
  buttonVariant,
}: {
  name: string;
  price: string;
  period: string;
  savings?: string;
  popular?: boolean;
  features: PricingFeature[];
  buttonText: string;
  buttonVariant: "primary" | "secondary";
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 relative ${
        popular ? "border-2 border-primary-500" : "border border-dark-200"
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
          POPULAR
        </div>
      )}
      <h3 className="font-semibold text-dark-900 mb-1">{name}</h3>
      <div className="text-3xl font-bold text-dark-900 mb-1">
        {price}
        <span className="text-lg font-normal text-dark-400">{period}</span>
      </div>
      {savings && <p className="text-sm text-primary-600 mb-4">{savings}</p>}
      {!savings && <div className="mb-4" />}
      
      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className={feature.included ? "text-primary-500" : "text-dark-300"}>
              {feature.included ? "✓" : "✗"}
            </span>
            <span className={feature.included ? "text-dark-600" : "text-dark-400"}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      
      <Button variant={buttonVariant} className="w-full">
        {buttonText}
      </Button>
    </div>
  );
}
