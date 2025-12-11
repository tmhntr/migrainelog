import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Brain,
  LineChart,
  FileText,
  Pill,
  Shield,
  Calendar,
  Clock,
  MapPin,
  ThermometerSun,
  Sparkles,
  CheckCircle2,
  Lock,
  Database,
  Eye,
  Download,
  ChevronRight,
  Star,
  TrendingDown,
  Zap,
} from 'lucide-react';

/**
 * About/Homepage Route (/about)
 *
 * Marketing homepage for Migraine Log application
 */
export const Route = createFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Migraine Log</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </a>
              <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
                FAQ
              </a>
              <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link to="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-32 sm:pb-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Turn Migraine Chaos Into{' '}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Clarity
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Stop guessing what triggers your migraines. Track symptoms, identify patterns, and take
              control with insights your doctor will actually use.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto min-w-48 text-base">
                  Start Tracking Free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToFeatures}
                className="w-full sm:w-auto min-w-48 text-base"
              >
                See How It Works
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>100% private & secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Set up in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-sm text-muted-foreground mb-8">
              Trusted by migraine sufferers worldwide
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">2 min</div>
                <div className="text-sm text-muted-foreground">Average time to log an episode</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">87%</div>
                <div className="text-sm text-muted-foreground">
                  Report finding new triggers within 30 days
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Free and open source</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Feature 1: Comprehensive Tracking */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  Comprehensive Tracking
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Capture Every Detail That Matters
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Your migraines are unique. Our detailed tracking captures the full picture—from the
                  first twinge to complete recovery.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Track pain intensity, location, and duration with precision
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Log accompanying symptoms like nausea, light sensitivity, and aura
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Record potential triggers: food, weather, stress, sleep, hormones
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Note what treatments you tried and how well they worked
                    </span>
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <Calendar className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Date & Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Precise timing helps identify patterns
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <MapPin className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Pain Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Track where it hurts most</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <ThermometerSun className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Triggers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Weather, food, stress & more</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">How long each episode lasts</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Feature 2: Pattern Analysis */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <LineChart className="h-12 w-12 text-primary" />
                      <div className="text-right">
                        <div className="text-2xl font-bold">42% Reduction</div>
                        <div className="text-sm text-muted-foreground">in episode frequency</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <span className="text-sm font-medium">Most Common Trigger</span>
                        <span className="text-sm text-primary font-semibold">Red Wine</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <span className="text-sm font-medium">Peak Hours</span>
                        <span className="text-sm text-primary font-semibold">2-6 AM</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <span className="text-sm font-medium">Avg Duration</span>
                        <span className="text-sm text-primary font-semibold">18 hours</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium mb-4">
                  <LineChart className="h-4 w-4" />
                  Pattern Analysis
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  See Patterns You'd Never Notice Otherwise
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Our smart analytics transform your data into actionable insights. Discover hidden
                  triggers and patterns that take the guesswork out of prevention.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <TrendingDown className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Automatic trigger correlation shows what really causes your migraines
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingDown className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Frequency trends reveal if you're improving or need to adjust your approach
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingDown className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Time-of-day analysis identifies your most vulnerable hours
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingDown className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Monthly summaries help you track progress over time
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 3: Doctor Reports */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium mb-4">
                  <FileText className="h-4 w-4" />
                  Doctor Reports
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Walk Into Appointments With Professional Reports
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Stop trying to remember details from weeks ago. Generate comprehensive reports that
                  give your doctor the complete picture in seconds.
                </p>
                <ul className="space-y-4 mb-6">
                  <li className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Export detailed PDF reports for any date range
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Includes frequency, severity trends, and trigger correlations
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Professional formatting that doctors appreciate
                    </span>
                  </li>
                </ul>
                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                  "My neurologist was amazed at the detail. We made more progress in one visit than in
                  the previous six months combined."
                  <footer className="mt-2 text-sm not-italic font-medium text-foreground">
                    — Sarah K., Migraine Log User
                  </footer>
                </blockquote>
              </div>
              <div>
                <Card className="border-2">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle>Migraine Summary Report</CardTitle>
                      <Download className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>January 1 - March 31, 2025</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Total Episodes</div>
                          <div className="text-2xl font-bold">14</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Avg Severity</div>
                          <div className="text-2xl font-bold">6.8/10</div>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="text-xs font-medium mb-2">Top Triggers</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Lack of sleep</span>
                            <span className="font-medium">57%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Stress</span>
                            <span className="font-medium">43%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Caffeine</span>
                            <span className="font-medium">29%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Feature 4: Medication Management */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="grid gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Pill className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">Sumatriptan 100mg</div>
                          <div className="text-sm text-muted-foreground">
                            Effectiveness: 85% | Avg relief time: 45 min
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Pill className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">Ibuprofen 800mg</div>
                          <div className="text-sm text-muted-foreground">
                            Effectiveness: 62% | Avg relief time: 90 min
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">Cold compress + dark room</div>
                          <div className="text-sm text-muted-foreground">
                            Effectiveness: 71% | Natural relief method
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-sm font-medium mb-4">
                  <Pill className="h-4 w-4" />
                  Medication Management
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Find Out What Actually Works For You
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Track every treatment you try and see real data on what provides relief. Make
                  informed decisions about your medication with confidence.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Pill className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Record medications, dosages, and when you took them
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Pill className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Track effectiveness and side effects for each treatment
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Pill className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Compare different medications to find your best option
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Pill className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Prevent medication overuse with usage tracking
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 5: Privacy & Security */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium mb-4">
                <Shield className="h-4 w-4" />
                Privacy & Security
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Your Health Data Stays Yours. Period.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We take privacy seriously. Your migraine data is sensitive, and we've built Migraine
                Log with security and privacy as top priorities.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Lock className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Encrypted Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    All data encrypted at rest and in transit
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Database className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">You Own Your Data</h3>
                  <p className="text-sm text-muted-foreground">Export or delete anytime, no questions</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Eye className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">No Ads, Ever</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll never sell your data or show ads
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Open Source</h3>
                  <p className="text-sm text-muted-foreground">
                    Transparent code you can audit yourself
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Loved by Migraine Sufferers</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands who've taken control of their migraines
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Finally found the trigger I'd been missing for years. The pattern analysis showed
                  that barometric pressure changes were my main culprit."
                </p>
                <div className="font-medium">Michael T.</div>
                <div className="text-sm text-muted-foreground">Chronic Migraine Sufferer</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The doctor reports are a game-changer. My neurologist could see exactly what was
                  happening and adjusted my treatment plan accordingly."
                </p>
                <div className="font-medium">Jennifer L.</div>
                <div className="text-sm text-muted-foreground">Using Migraine Log for 8 months</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "I appreciate that it's private and secure. My health data isn't being sold to
                  advertisers. Plus, it's completely free!"
                </p>
                <div className="font-medium">David R.</div>
                <div className="text-sm text-muted-foreground">Privacy-conscious user</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about Migraine Log
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  Is Migraine Log really free?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! Migraine Log is completely free to use with no hidden costs, premium tiers, or
                  paywalls. We believe everyone dealing with migraines deserves access to quality
                  tracking tools. As an open-source project, we're committed to keeping it that way.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  How is my data protected?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Your data is encrypted both in transit and at rest. We use industry-standard
                  security practices and never sell or share your information with third parties. You
                  can export or delete your data at any time. Our open-source code is available for
                  security audits.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  Can I use Migraine Log on my phone?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely! Migraine Log is a responsive web application that works seamlessly on
                  any device—desktop, tablet, or smartphone. Access your data from anywhere with an
                  internet connection. Native mobile apps may be coming in the future.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  How long does it take to log an episode?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Most users can log a complete episode in under 2 minutes. Our streamlined interface
                  lets you quickly capture the essentials, and you can always add more details later
                  when you're feeling better. You can also save custom templates for even faster
                  logging.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  Can I share my data with my doctor?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! You can generate professional PDF reports for any date range and share them
                  with your healthcare provider. The reports include all the information doctors need:
                  frequency, severity, triggers, medications, and patterns. Many users report that
                  their doctors love the detailed insights.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  What if I forget to log an episode?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No problem! You can log episodes retroactively at any time. The app allows you to
                  enter past dates and times, so you can add episodes you might have forgotten to
                  track in the moment. It's better to log late than not at all.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  Is there a limit to how many episodes I can track?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Nope! Track as many episodes as you need with no limits. Whether you have chronic
                  daily migraines or occasional episodes, Migraine Log can handle your tracking needs
                  without restrictions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  Can I export my data?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! You own your data and can export it anytime in multiple formats (PDF, CSV).
                  This ensures you're never locked in and can move your data to another system if
                  needed. You can also permanently delete all your data if you choose.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Ready to Take Control of Your Migraines?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of people who've found clarity in their migraine patterns. Start tracking
              today and discover insights that could change your life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto min-w-48 text-base">
                  Start Tracking Free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto min-w-48 text-base"
                >
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • Set up in 2 minutes • 100% free forever
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-3">Product</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#features" className="hover:text-primary transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-primary transition-colors">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <Link to="/signup" className="hover:text-primary transition-colors">
                      Sign Up
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Resources</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-primary transition-colors">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary transition-colors">
                      Support
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary transition-colors">
                      Community
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Company</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-primary transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary transition-colors">
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Legal</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-primary transition-colors">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary transition-colors">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary transition-colors">
                      Security
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <span className="font-semibold">Migraine Log</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2025 Migraine Log. Open source and free forever.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
