'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Cat,
  Dog,
  Mic,
  Upload,
  Send,
  Volume2,
  Heart,
  Brain,
  MessageCircle,
  Sparkles,
  AlertTriangle,
  Info,
  PawPrint,
  Moon,
  Sun,
  Activity,
  ShieldCheck,
  Lightbulb,
  BookOpen,
  ChevronRight,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

// Types
interface SoundTranslation {
  emotion: string;
  confidence: number;
  humanTranslation: string;
  scientificExplanation: string;
  bodyLanguage: string;
  recommendedResponse: string;
  funFact: string;
  urgency: 'low' | 'medium' | 'high';
}

interface BehaviorAnalysis {
  overallMood: string;
  moodEmoji: string;
  confidence: number;
  interpretation: string;
  detailedAnalysis: Array<{
    behavior: string;
    meaning: string;
    significance: string;
  }>;
  isCalm: boolean;
  needsAttention: boolean;
  healthWarning: string | null;
  tips: string[];
  bondingSuggestions: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Preset sound types for quick selection
const SOUND_PRESETS = {
  cat: [
    { label: 'Meow (short)', description: 'Quick, high-pitched meow' },
    { label: 'Meow (long/drawn out)', description: 'Extended, pleading meow' },
    { label: 'Purr', description: 'Soft rumbling sound' },
    { label: 'Hiss', description: 'Sharp, hissing sound' },
    { label: 'Chirp/Trill', description: 'Bird-like chirping' },
    { label: 'Yowl', description: 'Loud, drawn-out wailing' },
    { label: 'Growl', description: 'Low, rumbling growl' },
    { label: 'Chatter (at birds)', description: 'Teeth chattering at prey' },
  ],
  dog: [
    { label: 'Bark (short, sharp)', description: 'Quick alert bark' },
    { label: 'Bark (continuous)', description: 'Repeated barking' },
    { label: 'Whine', description: 'High-pitched whining' },
    { label: 'Howl', description: 'Long, mournful howling' },
    { label: 'Growl (low)', description: 'Low rumbling growl' },
    { label: 'Whimper', description: 'Soft, sad whimpering' },
    { label: 'Bark (playful)', description: 'Happy, excited barking' },
    { label: 'Sigh/Groan', description: 'Relaxed sighing sound' },
  ],
};

// Behavior checklist items
const BEHAVIOR_CATEGORIES = {
  cat: {
    'Ears': ['Forward & alert', 'Flattened back', 'Slightly sideways', 'Twitching rapidly', 'Pinned down'],
    'Tail': ['Held high & straight', 'Tucked under', 'Slow swishing', 'Puffed up/fluffy', 'Twitching tip'],
    'Eyes': 'Wide open & dilated,Half-closed & relaxed,Slow blinking,Narrowed pupils,Staring intently',
    'Posture': ['Relaxed & loose', 'Arched back', 'Crouched low', 'Rolling on back', 'Stiff & tense'],
    'Vocalization': ['Purring', 'Meowing', 'Hissing', 'Chirping', 'Silent'],
    'Actions': ['Kneading/biscuits', 'Head butting', 'Hiding', 'Bringing gifts', 'Over-grooming'],
  },
  dog: {
    'Ears': ['Perked up & forward', 'Dropped down', 'Pulled back', 'One up one down', 'Relaxed & natural'],
    'Tail': ['Wagging broadly', 'Tucked between legs', 'Stiff & raised', 'Slow wagging', 'Wagging in circles'],
    'Eyes': 'Soft & relaxed,Whale eye (whites showing),Direct stare,Avoiding eye contact,Happy squint',
    'Posture': ['Relaxed & loose', 'Play bow', 'Stiff & rigid', 'Cowering', 'Leaning into you'],
    'Vocalization': ['Barking', 'Whining', 'Growling', 'Howling', 'Quiet'],
    'Actions': ['Jumping up', 'Licking', 'Pacing', 'Bringing toys', 'Pawing at you'],
  },
};

// Emotion colors
function getEmotionColor(emotion: string): string {
  const lower = emotion.toLowerCase();
  if (lower.includes('happy') || lower.includes('playful') || lower.includes('content') || lower.includes('affectionate'))
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
  if (lower.includes('anxious') || lower.includes('scared') || lower.includes('nervous'))
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
  if (lower.includes('angry') || lower.includes('aggressive') || lower.includes('territorial'))
    return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
  if (lower.includes('hungry') || lower.includes('food'))
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
  if (lower.includes('curious') || lower.includes('alert'))
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
  return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
}

function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'high': return 'text-red-600 dark:text-red-400';
    case 'medium': return 'text-amber-600 dark:text-amber-400';
    default: return 'text-emerald-600 dark:text-emerald-400';
  }
}

// Animated paw prints background
function FloatingPawPrints() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.03]">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            rotate: Math.random() * 360,
            scale: 0.5 + Math.random() * 1.5,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 3,
          }}
        >
          <PawPrint className="w-8 h-8" />
        </motion.div>
      ))}
    </div>
  );
}

// Header component
function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="/pet-logo.png" alt="PetSpeak Logo" className="w-10 h-10 rounded-xl" />
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-teal-500 bg-clip-text text-transparent">
              PetSpeak
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Pet Language Translator</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            <Sun className="h-4 w-4 block dark:hidden" />
            <Moon className="h-4 w-4 hidden dark:block" />
          </Button>
        </div>
      </div>
    </header>
  );
}

// Hero section
function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="secondary" className="mb-4 text-xs sm:text-sm px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Pet Communication
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Understand Your Pet&apos;s{' '}
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-teal-500 bg-clip-text text-transparent">
                  Secret Language
                </span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-xl mx-auto lg:mx-0">
                Decode your cat&apos;s meows, understand your dog&apos;s barks, and learn to read their body language.
                Powered by AI trained on animal behavior research.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Cat className="w-4 h-4 text-amber-500" />
                  <span>Cat Translator</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Dog className="w-4 h-4 text-teal-500" />
                  <span>Dog Translator</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span>AI Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4 text-pink-500" />
                  <span>Behavior Guide</span>
                </div>
              </div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-orange-200/50 dark:shadow-orange-900/20">
              <img
                src="/pet-translator-hero.png"
                alt="Cute cat and dog - Pet Language Translator"
                className="w-full h-auto"
              />
            </div>
            <motion.div
              className="absolute -bottom-3 -right-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-medium">Mood Detected</p>
                  <p className="text-xs text-emerald-600 font-bold">Happy & Relaxed</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

// Sound Translator Component
function SoundTranslator() {
  const [petType, setPetType] = useState<'cat' | 'dog'>('cat');
  const [soundDescription, setSoundDescription] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoundTranslation | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recordingRef.current) {
      clearInterval(recordingRef.current);
      recordingRef.current = null;
    }
    toast.info('Recording saved! Describe what you heard in the field below.');
  }, []);

  const handlePresetClick = (preset: { label: string; description: string }) => {
    setSoundDescription(`${preset.label} - ${preset.description}`);
  };

  const handleTranslate = async () => {
    if (!soundDescription.trim()) {
      toast.error('Please describe the sound your pet made');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/translate-sound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petType, soundDescription, context: context.trim() || undefined }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.error || 'Translation failed';
        toast.error(errorMsg);
        return;
      }

      const data = await response.json();
      setResult(data);
      toast.success('Translation complete!');
    } catch (err) {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const presets = SOUND_PRESETS[petType];

  return (
    <div className="space-y-6">
      {/* Pet Type Selection */}
      <div className="flex gap-3">
        <Button
          variant={petType === 'cat' ? 'default' : 'outline'}
          className={`flex-1 h-14 ${petType === 'cat' ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
          onClick={() => { setPetType('cat'); setResult(null); setSoundDescription(''); }}
        >
          <Cat className="w-5 h-5 mr-2" />
          Cat
        </Button>
        <Button
          variant={petType === 'dog' ? 'default' : 'outline'}
          className={`flex-1 h-14 ${petType === 'dog' ? 'bg-teal-500 hover:bg-teal-600' : ''}`}
          onClick={() => { setPetType('dog'); setResult(null); setSoundDescription(''); }}
        >
          <Dog className="w-5 h-5 mr-2" />
          Dog
        </Button>
      </div>

      {/* Sound Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Volume2 className="w-5 h-5 text-amber-500" />
            Describe the Sound
          </CardTitle>
          <CardDescription>
            Tell us about the sound your {petType} made
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Record Button */}
          <div className="flex items-center gap-3">
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={isRecording ? stopRecording : startRecording}
            >
              <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
            </Button>
            {isRecording && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-600 font-medium">
                  Recording... {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                </span>
              </div>
            )}
            {!isRecording && (
              <span className="text-sm text-muted-foreground">
                Tap to simulate recording, then describe the sound
              </span>
            )}
          </div>

          <Textarea
            placeholder={`e.g., "My ${petType} made a short, high-pitched meow while looking at their food bowl..."`}
            value={soundDescription}
            onChange={(e) => setSoundDescription(e.target.value)}
            rows={3}
            className="resize-none"
          />

          {/* Quick Presets */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Quick Sound Types</Label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <Textarea
            placeholder="Any additional context? (time of day, recent events, pet's surroundings...)"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            className="resize-none"
          />

          <Button
            onClick={handleTranslate}
            disabled={loading || !soundDescription.trim()}
            className="w-full h-12 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Translate Pet Sound
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Translation Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="overflow-hidden">
              <div className={`p-4 ${getEmotionColor(result.emotion)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    <span className="font-semibold">Translation Result</span>
                  </div>
                  <Badge variant="outline" className={`font-bold ${getUrgencyColor(result.urgency)}`}>
                    {result.urgency === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    Urgency: {result.urgency}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`text-lg px-4 py-1 ${getEmotionColor(result.emotion)}`}>
                    {result.emotion}
                  </Badge>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Confidence</span>
                      <span className="font-bold">{result.confidence}%</span>
                    </div>
                    <Progress value={result.confidence} className="h-2" />
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-5">
                {/* Human Translation */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-amber-500" />
                    <h4 className="font-semibold text-sm">
                      &quot;What your {petType} is saying...&quot;
                    </h4>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 border-l-4 border-amber-500">
                    <p className="text-base italic">{result.humanTranslation}</p>
                  </div>
                </div>

                <Separator />

                {/* Scientific Explanation */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <h4 className="font-semibold text-sm">Scientific Explanation</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.scientificExplanation}</p>
                </div>

                <Separator />

                {/* Body Language */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <h4 className="font-semibold text-sm">Accompanying Body Language</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.bodyLanguage}</p>
                </div>

                <Separator />

                {/* Recommended Response */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-orange-500" />
                    <h4 className="font-semibold text-sm">How You Should Respond</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.recommendedResponse}</p>
                </div>

                <Separator />

                {/* Fun Fact */}
                <div className="bg-gradient-to-r from-amber-50 to-teal-50 dark:from-amber-950/30 dark:to-teal-950/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-teal-600" />
                    <h4 className="font-semibold text-sm">Fun Fact</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.funFact}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Eye icon placeholder (since it's not imported from lucide)
function Eye({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Body Language Decoder Component
function BodyLanguageDecoder() {
  const [petType, setPetType] = useState<'cat' | 'dog'>('cat');
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([]);
  const [customBehavior, setCustomBehavior] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BehaviorAnalysis | null>(null);

  const categories = BEHAVIOR_CATEGORIES[petType];

  const toggleBehavior = (behavior: string) => {
    setSelectedBehaviors((prev) =>
      prev.includes(behavior) ? prev.filter((b) => b !== behavior) : [...prev, behavior]
    );
    setResult(null);
  };

  const handleAnalyze = async () => {
    const allBehaviors = [...selectedBehaviors];
    if (customBehavior.trim()) {
      allBehaviors.push(customBehavior.trim());
    }

    if (allBehaviors.length === 0) {
      toast.error('Please select at least one behavior');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze-behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petType, behaviors: allBehaviors.join(', ') }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResult(data);
      toast.success('Behavior analysis complete!');
    } catch {
      toast.error('Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string): LucideIcon | null => {
    const icons: Record<string, LucideIcon> = {
      'Ears': Volume2,
      'Tail': Activity,
      'Eyes': Eye,
      'Posture': ShieldCheck,
      'Vocalization': Mic,
      'Actions': PawPrint,
    };
    return icons[category] || null;
  };

  return (
    <div className="space-y-6">
      {/* Pet Type Selection */}
      <div className="flex gap-3">
        <Button
          variant={petType === 'cat' ? 'default' : 'outline'}
          className={`flex-1 h-14 ${petType === 'cat' ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
          onClick={() => { setPetType('cat'); setSelectedBehaviors([]); setResult(null); }}
        >
          <Cat className="w-5 h-5 mr-2" />
          Cat
        </Button>
        <Button
          variant={petType === 'dog' ? 'default' : 'outline'}
          className={`flex-1 h-14 ${petType === 'dog' ? 'bg-teal-500 hover:bg-teal-600' : ''}`}
          onClick={() => { setPetType('dog'); setSelectedBehaviors([]); setResult(null); }}
        >
          <Dog className="w-5 h-5 mr-2" />
          Dog
        </Button>
      </div>

      {/* Body Language Reference Image */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <img
            src={petType === 'cat' ? '/cat-body-language.png' : '/dog-body-language.png'}
            alt={`${petType} body language guide`}
            className="w-full h-auto"
          />
        </CardContent>
      </Card>

      {/* Behavior Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PawPrint className="w-5 h-5 text-teal-500" />
            Select Observed Behaviors
          </CardTitle>
          <CardDescription>
            Choose the behaviors you&apos;re observing in your {petType}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {Object.entries(categories).map(([category, items]) => {
            const IconComp = getCategoryIcon(category);
            const itemList = typeof items === 'string' ? items.split(',') : items;

            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  {IconComp && <IconComp className="w-4 h-4 text-muted-foreground" />}
                  <Label className="text-sm font-semibold">{category}</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {itemList.map((item: string) => (
                    <Button
                      key={item.trim()}
                      variant={selectedBehaviors.includes(item.trim()) ? 'default' : 'outline'}
                      size="sm"
                      className={`text-xs h-8 ${
                        selectedBehaviors.includes(item.trim())
                          ? petType === 'cat' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-teal-500 hover:bg-teal-600'
                          : ''
                      }`}
                      onClick={() => toggleBehavior(item.trim())}
                    >
                      {selectedBehaviors.includes(item.trim()) && '✓ '}
                      {item.trim()}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}

          <Separator />

          <div>
            <Label className="text-sm">Additional behavior description</Label>
            <Textarea
              placeholder="Describe any other behaviors not listed above..."
              value={customBehavior}
              onChange={(e) => setCustomBehavior(e.target.value)}
              rows={2}
              className="resize-none mt-1"
            />
          </div>

          {selectedBehaviors.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {selectedBehaviors.length} behavior{selectedBehaviors.length !== 1 ? 's' : ''} selected
            </p>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={loading || (selectedBehaviors.length === 0 && !customBehavior.trim())}
            className="w-full h-12 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Behavior...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze Body Language
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Mood Card */}
            <Card className="overflow-hidden">
              <div className={`p-6 text-center ${getEmotionColor(result.overallMood)}`}>
                <motion.div
                  className="text-6xl mb-3"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {result.moodEmoji}
                </motion.div>
                <h3 className="text-2xl font-bold mb-1">{result.overallMood}</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm">Confidence: {result.confidence}%</span>
                  <Progress value={result.confidence} className="w-24 h-2" />
                </div>
                <div className="flex justify-center gap-2 mt-3">
                  {result.isCalm && (
                    <Badge className="bg-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Calm
                    </Badge>
                  )}
                  {result.needsAttention && (
                    <Badge className="bg-orange-200 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Needs Attention
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-6 space-y-5">
                {/* Health Warning */}
                {result.healthWarning && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <h4 className="font-semibold text-sm text-red-700 dark:text-red-400">Health Notice</h4>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-400">{result.healthWarning}</p>
                  </div>
                )}

                {/* Interpretation */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Interpretation</h4>
                  <p className="text-sm text-muted-foreground">{result.interpretation}</p>
                </div>

                {/* Detailed Analysis */}
                {result.detailedAnalysis && result.detailedAnalysis.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Behavior Breakdown</h4>
                      <div className="space-y-3">
                        {result.detailedAnalysis.map((item, index) => (
                          <div key={index} className="bg-muted/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <ChevronRight className="w-3 h-3 text-amber-500" />
                              <span className="font-medium text-sm">{item.behavior}</span>
                            </div>
                            <p className="text-sm text-muted-foreground ml-5">{item.meaning}</p>
                            <p className="text-xs text-muted-foreground ml-5 mt-1 italic">
                              Significance: {item.significance}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Tips */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-orange-500" />
                    Tips
                  </h4>
                  <ul className="space-y-1">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bonding Suggestions */}
                {result.bondingSuggestions && result.bondingSuggestions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        Bonding Suggestions
                      </h4>
                      <ul className="space-y-1">
                        {result.bondingSuggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-pink-500 mt-1">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// AI Pet Chat Component
function PetChat() {
  const [petType, setPetType] = useState<string>('cat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi there! I'm PetSpeak AI, your pet communication expert. Tell me about your pet's behavior, sounds, or body language, and I'll help you understand what they're trying to say! What's on your mind? 🐾",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const chatMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/pet-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages, petType }),
      });

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm sorry, I had trouble processing that. Could you try describing your pet's behavior again?" },
      ]);
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "Why does my cat meow at 3 AM?",
    "My dog keeps staring at me - what does it mean?",
    "How do I know if my cat is happy?",
    "Why does my dog whine when I leave?",
    "What does it mean when my cat purrs loudly?",
    "My dog's tail is tucked - is something wrong?",
  ];

  return (
    <div className="space-y-4">
      {/* Pet Type Selection */}
      <div className="flex gap-3">
        <Select value={petType} onValueChange={setPetType}>
          <SelectTrigger className="flex-1 h-12">
            <SelectValue placeholder="Select pet type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cat">
              <span className="flex items-center gap-2"><Cat className="w-4 h-4" /> Cat</span>
            </SelectItem>
            <SelectItem value="dog">
              <span className="flex items-center gap-2"><Dog className="w-4 h-4" /> Dog</span>
            </SelectItem>
            <SelectItem value="both">
              <span className="flex items-center gap-2"><PawPrint className="w-4 h-4" /> Both / General</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chat Area */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] sm:h-[500px]" ref={scrollRef}>
            <div className="p-4 space-y-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-white rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <div className="border-t p-4 space-y-3">
          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              placeholder={`Describe your ${petType}'s behavior...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="resize-none min-h-[44px] flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl bg-amber-500 hover:bg-amber-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Suggested Questions */}
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 3).map((q, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs h-7 shrink-0"
                onClick={() => {
                  setInput(q);
                }}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-r from-amber-50 to-teal-50 dark:from-amber-950/20 dark:to-teal-950/20 border-0">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Pro Tips for Better Communication
          </h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Describe the specific sound, body position, and context</li>
            <li>• Mention the time of day and recent activities</li>
            <li>• Note if other pets or people are nearby</li>
            <li>• Consider your pet&apos;s age, breed, and personality</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Stats Section
function StatsSection() {
  const stats = [
    { label: 'Sounds Decoded', value: '50+', icon: Volume2, color: 'text-amber-500' },
    { label: 'Behaviors Mapped', value: '100+', icon: Activity, color: 'text-teal-500' },
    { label: 'Pet Types', value: '2', icon: PawPrint, color: 'text-purple-500' },
    { label: 'AI Accuracy', value: '~80%', icon: Brain, color: 'text-pink-500' },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <Card className="text-center p-4">
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Describe the Behavior',
      description: 'Tell us about your pet\'s sound, body language, or behavior in detail. Use our preset options for quick selection.',
      icon: MessageCircle,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
    {
      number: '2',
      title: 'AI Analyzes',
      description: 'Our AI, trained on veterinary research and animal behavior studies, analyzes the description to understand the communication.',
      icon: Brain,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    },
    {
      number: '3',
      title: 'Get the Translation',
      description: 'Receive a detailed interpretation including emotion, meaning, recommended response, and fun facts about pet communication.',
      icon: Sparkles,
      color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">How PetSpeak Works</h3>
        <p className="text-muted-foreground">Three simple steps to understanding your pet</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i }}
          >
            <Card className="p-6 h-full">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${step.color}`}>
                <step.icon className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-muted-foreground mb-2">STEP {step.number}</div>
              <h4 className="font-bold text-lg mb-2">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/pet-logo.png" alt="PetSpeak" className="w-6 h-6 rounded" />
            <span className="text-sm font-medium">PetSpeak</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            AI-powered pet communication translator. For educational and entertainment purposes. Not a substitute for veterinary advice.
          </p>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span className="text-xs text-muted-foreground">Made for pet lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Page
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <FloatingPawPrints />
      <Header />

      <main className="flex-1 relative z-10">
        <HeroSection />
        <StatsSection />

        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Tabs defaultValue="sound" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1 mb-6">
              <TabsTrigger value="sound" className="flex items-center justify-center gap-2 py-3 text-xs sm:text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Volume2 className="w-4 h-4" />
                <span className="hidden xs:inline sm:inline">Sound</span> Translator
              </TabsTrigger>
              <TabsTrigger value="body" className="flex items-center justify-center gap-2 py-3 text-xs sm:text-sm data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                <Eye className="w-4 h-4" />
                <span className="hidden xs:inline sm:inline">Body</span> Language
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center justify-center gap-2 py-3 text-xs sm:text-sm data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                <MessageCircle className="w-4 h-4" />
                AI <span className="hidden xs:inline sm:inline">Chat</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sound">
              <SoundTranslator />
            </TabsContent>

            <TabsContent value="body">
              <BodyLanguageDecoder />
            </TabsContent>

            <TabsContent value="chat">
              <PetChat />
            </TabsContent>
          </Tabs>
        </section>

        <HowItWorksSection />
      </main>

      <Footer />
    </div>
  );
}
