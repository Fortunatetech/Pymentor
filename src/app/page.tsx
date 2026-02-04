import Link from 'next/link';
import { ArrowRight, Brain, Target, Hammer, Sparkles, Check, X } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-dark-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐍</span>
              <span className="font-bold text-xl text-dark-900">PyMentor AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-dark-600 hover:text-dark-900 font-medium">
                Log in
              </Link>
              <Link href="/auth/signup" className="btn-primary btn-sm">
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-primary-50 via-white to-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-dark-100 mb-6">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm text-dark-600">AI-powered learning that adapts to you</span>
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
            <Link href="/auth/signup" className="btn-primary btn-lg">
              Start Learning Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#demo" className="btn-secondary btn-lg">
              Watch Demo
            </Link>
          </div>

          {/* Hero Preview */}
          <div className="max-w-4xl mx-auto">
            <div className="card overflow-hidden shadow-2xl">
              <div className="bg-dark-800 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-dark-400 text-sm ml-2 font-mono">PyMentor AI</span>
              </div>
              <div className="p-6 flex gap-4 bg-dark-50">
                <div className="flex-1 code-block">
                  <pre className="text-green-400">
{`def greet(name):
    return f"Hello, {name}!"

# Try it yourself!
print(greet("Carlos"))`}
                  </pre>
                </div>
                <div className="w-72 bg-white rounded-xl p-4 border border-dark-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm">🐍</div>
                    <div className="flex-1">
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-dark-900 mb-4">
            Why PyMentor AI?
          </h2>
          <p className="text-dark-500 text-center mb-12 max-w-2xl mx-auto">
            Unlike generic chatbots or rigid courses, we combine the best of AI with proven learning science.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-hover p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-lg text-dark-900 mb-2">Memory That Persists</h3>
              <p className="text-dark-500">
                Unlike ChatGPT, I remember what you've learned across sessions. No more repeating yourself.
              </p>
            </div>
            
            <div className="card-hover p-6">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-accent-600" />
              </div>
              <h3 className="font-semibold text-lg text-dark-900 mb-2">Adaptive Difficulty</h3>
              <p className="text-dark-500">
                Too easy? I'll challenge you. Struggling? I'll slow down and explain differently.
              </p>
            </div>
            
            <div className="card-hover p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Hammer className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg text-dark-900 mb-2">Learn by Building</h3>
              <p className="text-dark-500">
                No more tutorial hell. Build real projects from day one with guided support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-dark-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-dark-900 mb-4">
            Simple, Affordable Pricing
          </h2>
          <p className="text-dark-500 text-center mb-12">
            Less than a coffee per week. Cancel anytime.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="card p-6">
              <h3 className="font-semibold text-dark-900 mb-1">Free</h3>
              <div className="text-3xl font-bold text-dark-900 mb-4">
                $0<span className="text-lg font-normal text-dark-400">/mo</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-dark-600">
                  <Check className="w-4 h-4 text-primary-500" /> 3 lessons
                </li>
                <li className="flex items-center gap-2 text-sm text-dark-600">
                  <Check className="w-4 h-4 text-primary-500" /> 10 AI messages/day
                </li>
                <li className="flex items-center gap-2 text-sm text-dark-600">
                  <Check className="w-4 h-4 text-primary-500" /> Code playground
                </li>
                <li className="flex items-center gap-2 text-sm text-dark-400">
                  <X className="w-4 h-4 text-dark-300" /> Streaks & progress
                </li>
              </ul>
              <Link href="/auth/signup" className="btn-secondary btn-md w-full">
                Get Started
              </Link>
            </div>
            
            {/* Pro Monthly */}
            <div className="card p-6 border-2 border-primary-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-primary">
                POPULAR
              </div>
              <h3 className="font-semibold text-dark-900 mb-1">Pro Monthly</h3>
              <div className="text-3xl font-bold text-dark-900 mb-4">
                $15<span className="text-lg font-normal text-dark-400">/mo</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-dark-600">
                  <Check className="w-4 h-4 text-primary-500" /> Unlimited lessons
                </li>
                <li className="flex items-center gap-2 text-sm text-dark-600">
                  <Check className="w-4 h-4 text-primary-500" /> Unlimited AI chat
                </li>
                <li className="flex items-center gap-2 text-sm text-dark-600">
                  <Check className="w-4 h-4 text-primary-500" /> All projects
                </li>
                <li className="flex items-center gap-2 text-sm text-dark-600">
                  <Check className="w-4 h-4 text-primary-500" /> Streaks & progress
                </li>
              </ul>
              <Link href="/auth/signup?plan=pro_monthly" className="btn-primary btn-md w-full">
                Subscribe
              </Link>
            </div>
            
            {/* Pro Annual */}
            <div className="card p-6">
              <h3 className="font-semibold text-dark-900 mb-1">Pro Annual</h3>
              <div className="text-3xl font-bold text-dark-900 mb-1">
                $12<span className="text-lg font-normal text-dark-400">/mo</span>
              </div>
              <p className="text-sm text-primary-600 mb-4">Save 20% ($144/year)</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-dark-600">
                  <Check className="w-4 h-4 text-primary-500" /> Everything in Pro
                </li>
                <li className="flex items-center gap-2 text-sm text-dark-600">
                  <Check className="w-4 h-4 text-primary-500" /> Priority support
                </li>
                <li className="flex items-center gap-2 text-sm text-dark-600">
                  <Check className="w-4 h-4 text-primary-500" /> Early access
                </li>
              </ul>
              <Link href="/auth/signup?plan=pro_annual" className="btn-secondary btn-md w-full border-primary-500 text-primary-600 hover:bg-primary-50">
                Best Value
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start your Python journey?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join thousands of learners who are building their programming skills with PyMentor AI.
          </p>
          <Link href="/auth/signup" className="btn bg-white text-primary-600 hover:bg-primary-50 btn-lg shadow-xl">
            Start Learning Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-dark-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐍</span>
              <span className="font-bold text-lg text-white">PyMentor AI</span>
            </div>
            <div className="flex items-center gap-6 text-dark-400">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
            <p className="text-dark-500 text-sm">
              © {new Date().getFullYear()} PyMentor AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
