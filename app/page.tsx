import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Shield, Zap, Activity } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <header className="px-6 h-16 flex items-center justify-between border-b sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>JetCare</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#solutions" className="hover:text-primary transition-colors">Solutions</Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-6 flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            New: Telemedicine Integration
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl">
            Healthcare Management <br className="hidden sm:inline" />
            <span className="text-primary">Reimagined</span>
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            JetCare simplifies patient management, appointments, and medical records in one unified platform. Designed for modern healthcare providers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                Book a demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-muted/50 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to run your practice</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful tools to help you focus on what matters most - your patients.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="bg-background rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats / Trust Section */}
        <section className="py-20 px-6 border-t">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Patients", value: "10k+" },
              { label: "Doctors", value: "500+" },
              { label: "Consultations", value: "1M+" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-12 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span>JetCare</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Making healthcare accessible, efficient, and secure for everyone.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-sm">
            <div className="space-y-3">
              <h4 className="font-semibold">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Features</Link></li>
                <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary">Security</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">About</Link></li>
                <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary">Careers</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground max-w-6xl mx-auto">
          © {new Date().getFullYear()} JetCare Inc. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: "Secure Records",
    description: "Enterprise-grade security for all your medical records and patient data.",
    icon: Shield,
  },
  {
    title: "Instant Analytics",
    description: "Real-time insights into your practice's performance and patient trends.",
    icon: Zap,
  },
  {
    title: "Smart Scheduling",
    description: "AI-powered, appointment management to minimize no-shows and optimize time.",
    icon: CheckCircle2,
  },
]
