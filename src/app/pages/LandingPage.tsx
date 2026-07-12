import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Activity, Brain, LineChart, Shield, Sun, Moon } from "lucide-react";
import { Logo } from "../components/Logo";
import { useState, useEffect } from "react";

export function LandingPage() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 text-gray-900 dark:text-white transition-colors duration-200">
      {/* Navbar */}
      <nav className="border-b dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo className="w-6 h-6 md:w-8 md:h-8" />
              <span className="font-bold text-lg md:text-xl text-gray-900 dark:text-white">DiabeGuide</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Home</a>
              <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">About</a>
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Features</a>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="hover:bg-gray-100 rounded-full transition text-gray-600"
                title="Toggle Dark Mode"
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </Button>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Sign Up
                </Button>
              </Link>
            </div>
            {/* Mobile Menu Buttons */}
            <div className="flex md:hidden items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="hover:bg-gray-100 rounded-full transition text-gray-600"
                title="Toggle Dark Mode"
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </Button>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Smart Diabetes Management with AI
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
              Track glucose, monitor health, and get AI-powered assistance in real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 cursor-pointer">
                  Get Started
                </Button>
              </Link>
              <a href="#about" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full cursor-pointer dark:text-white dark:border-slate-700 dark:hover:bg-slate-800">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 blur-3xl opacity-30 rounded-full"></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-blue-100 dark:border-slate-800">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Level</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">120 mg/dL</p>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-end p-4">
                    <div className="flex items-end gap-2 w-full">
                      {[70, 85, 80, 95, 120, 110, 100].map((height, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-600 rounded-t" style={{ height: `${height}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-4 md:px-6 py-12 md:py-20 border-t border-b border-gray-100 dark:border-slate-800/80">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium">
              <Logo className="w-4 h-4" /> About DiabeGuide
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              A Secure SaaS Platform Designed to Streamline Patient Health
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              DiabeGuide is a comprehensive health management suite that empowers users and healthcare professionals with clinical-grade tracking, automated analytics, and intelligent AI assistance. Our goal is to make diabetes monitoring intuitive, insightful, and accessible from anywhere.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4 text-left">
              <div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">100%</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">Local Control</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Secure local database and client-side offline mode fallback.</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">24/7</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">AI Advisor</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Instant clinical suggestions based on your blood sugar readings.</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-blue-100 dark:border-slate-800/80 dark:bg-slate-900/40">
              <CardHeader className="p-5">
                <CardTitle className="text-lg text-gray-900 dark:text-white">Our Vision</CardTitle>
                <CardDescription className="dark:text-gray-400">To simplify glycemic control by converting raw numbers into actionable, clinically-sound lifestyle guidance.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-cyan-100 dark:border-slate-800/80 dark:bg-slate-900/40">
              <CardHeader className="p-5">
                <CardTitle className="text-lg text-gray-900 dark:text-white">Security First</CardTitle>
                <CardDescription className="dark:text-gray-400">All authentication keys, emails, and data logs are protected using modern standards like JWT and bcrypt hashing.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-emerald-100 dark:border-slate-800/80 dark:bg-slate-900/40">
              <CardHeader className="p-5">
                <CardTitle className="text-lg text-gray-900 dark:text-white">Medical Context</CardTitle>
                <CardDescription className="dark:text-gray-400">Our chatbot evaluates glycemic states (hypoglycemia/hyperglycemia) to give explicit clinical Dos and Don'ts.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-purple-100 dark:border-slate-800/80 dark:bg-slate-900/40">
              <CardHeader className="p-5">
                <CardTitle className="text-lg text-gray-900 dark:text-white">Excel Reports</CardTitle>
                <CardDescription className="dark:text-gray-400">Generate and export fully detailed spreadsheets containing your entire logging history with one click.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Powerful Features</h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">Everything you need to manage your diabetes effectively</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="border-blue-100 dark:border-slate-800/80 dark:bg-slate-900/40 hover:shadow-lg transition">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="dark:text-white">AI Chatbot</CardTitle>
              <CardDescription className="dark:text-gray-400">Get instant answers and personalized advice from our AI assistant</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-emerald-100 dark:border-slate-800/80 dark:bg-slate-900/40 hover:shadow-lg transition">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="dark:text-white">Glucose Tracking</CardTitle>
              <CardDescription className="dark:text-gray-400">Monitor your blood sugar levels with easy-to-use tracking tools</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-purple-100 dark:border-slate-800/80 dark:bg-slate-900/40 hover:shadow-lg transition">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-4">
                <LineChart className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="dark:text-white">Health Reports</CardTitle>
              <CardDescription className="dark:text-gray-400">Comprehensive analytics and insights into your health trends</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-orange-100 dark:border-slate-800/80 dark:bg-slate-900/40 hover:shadow-lg transition">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="dark:text-white">Smart Monitoring</CardTitle>
              <CardDescription className="dark:text-gray-400">Real-time alerts and reminders to keep you on track</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo className="w-6 h-6" />
                <span className="font-bold text-lg">DiabeGuide</span>
              </div>
              <p className="text-gray-400">Smart diabetes management with AI</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 DiabeGuide. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
