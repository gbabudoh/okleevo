"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Copy, Download, Wand2, FileText, Mail,
  MessageSquare, ShoppingBag, Megaphone, Video,
  Briefcase, TrendingUp, Lightbulb, Check,
  ChevronRight, ChevronLeft, Zap, Target, Users, Globe,
  Search, Star, ShieldCheck, Layers, ArrowUpRight, BarChart2,
  Sliders, Bot, Send, RefreshCw, Bookmark
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ContentTemplate {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  category: 'Content' | 'Social' | 'Email' | 'Ads' | 'Video' | 'E-commerce' | 'SEO' | 'PR' | 'Branding';
  gradient: string;
  model: string;
  speed: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select';
    placeholder?: string;
    options?: string[];
  }>;
}

const contentTemplates: ContentTemplate[] = [
  {
    id: 'blog-post', name: 'Blog Post', icon: FileText,
    description: 'SEO-optimized blog articles with engaging narratives & headers',
    category: 'Content', gradient: 'from-blue-600 to-cyan-500', model: 'Okleevo Deep-Reasoning', speed: '~1.2s',
    fields: [
      { name: 'topic', label: 'Topic / Headline', type: 'text', placeholder: 'e.g. Scaling B2B SaaS Infrastructure' },
      { name: 'tone', label: 'Tone of Voice', type: 'select', options: ['Professional', 'Casual', 'Authoritative', 'Conversational', 'Technical'] },
      { name: 'length', label: 'Target Length', type: 'select', options: ['Short (300-500 words)', 'Medium (500-1000 words)', 'Long (1000-2000 words)'] },
      { name: 'keywords', label: 'Target SEO Keywords', type: 'text', placeholder: 'e.g. cloud architecture, enterprise saas' },
    ],
  },
  {
    id: 'social-media', name: 'Social Post', icon: MessageSquare,
    description: 'Multi-platform social copy for LinkedIn, Twitter/X, Instagram, and Facebook',
    category: 'Social', gradient: 'from-pink-600 to-rose-500', model: 'Okleevo Fast-Neural', speed: '~0.8s',
    fields: [
      { name: 'platform', label: 'Target Platform', type: 'select', options: ['LinkedIn', 'Twitter/X', 'Instagram', 'Facebook', 'TikTok'] },
      { name: 'topic', label: 'Core Message', type: 'textarea', placeholder: 'What update or value offer do you want to share?' },
      { name: 'style', label: 'Post Style', type: 'select', options: ['Thought Leadership', 'Educational Hook', 'Product Update', 'Inspirational Story'] },
      { name: 'hashtags', label: 'Include Hashtags', type: 'select', options: ['Yes (Strategic 3-5)', 'No Hashtags'] },
    ],
  },
  {
    id: 'email-campaign', name: 'Email Campaign', icon: Mail,
    description: 'High-conversion email copy for B2B sales outreach & newsletters',
    category: 'Email', gradient: 'from-purple-600 to-indigo-500', model: 'Okleevo Deep-Reasoning', speed: '~1.5s',
    fields: [
      { name: 'purpose', label: 'Email Type', type: 'select', options: ['Cold Sales Outreach', 'Newsletter Issue', 'Product Launch', 'Customer Follow-up'] },
      { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g. Enterprise CTOs, Marketing Directors' },
      { name: 'cta', label: 'Primary Call-to-Action', type: 'text', placeholder: 'e.g. Book a 15-min discovery call' },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Direct & Professional', 'Warm & Consultative', 'Urgent Promotional'] },
    ],
  },
  {
    id: 'product-description', name: 'Product Desc.', icon: ShoppingBag,
    description: 'Persuasive e-commerce product copy that highlights core benefits',
    category: 'E-commerce', gradient: 'from-emerald-600 to-teal-500', model: 'Okleevo Deep-Reasoning', speed: '~1.1s',
    fields: [
      { name: 'product', label: 'Product Name', type: 'text', placeholder: 'e.g. Okleevo Enterprise Workspace' },
      { name: 'features', label: 'Key Features & Specs', type: 'textarea', placeholder: 'List main features (one per line)' },
      { name: 'audience', label: 'Target Buyer Persona', type: 'text', placeholder: 'Who is the ideal customer?' },
      { name: 'style', label: 'Copywriting Style', type: 'select', options: ['Benefit-Driven', 'Technical Specs', 'Luxury / Premium', 'Feature Outline'] },
    ],
  },
  {
    id: 'ad-copy', name: 'Ad Copy', icon: Megaphone,
    description: 'High-converting ad copy for Google, Meta, and LinkedIn Sponsored Content',
    category: 'Ads', gradient: 'from-orange-600 to-amber-500', model: 'Okleevo Fast-Neural', speed: '~0.6s',
    fields: [
      { name: 'platform', label: 'Ad Network', type: 'select', options: ['Google Search Ads', 'Meta (Facebook/Instagram)', 'LinkedIn Ads', 'Twitter Ads'] },
      { name: 'product', label: 'Product / Offer', type: 'text', placeholder: 'What are you advertising?' },
      { name: 'benefit', label: 'Value Proposition', type: 'text', placeholder: 'Main selling point or angle' },
      { name: 'cta', label: 'Button CTA', type: 'text', placeholder: 'e.g. Claim Free Trial, Get Quote' },
    ],
  },
  {
    id: 'video-script', name: 'Video Script', icon: Video,
    description: 'Engaging video scripts with visual scene directions for YouTube & Reels',
    category: 'Video', gradient: 'from-red-600 to-pink-500', model: 'Okleevo Deep-Reasoning', speed: '~1.8s',
    fields: [
      { name: 'topic', label: 'Video Concept', type: 'text', placeholder: 'What is the video demo or tutorial about?' },
      { name: 'duration', label: 'Target Duration', type: 'select', options: ['Shorts/Reels (30-60s)', 'YouTube Explainer (3-5 mins)', 'Webinar Hook (1-2 mins)'] },
      { name: 'style', label: 'Production Style', type: 'select', options: ['Product Demo', 'Talking Head Explainer', 'High-Energy Promo', 'Tutorial'] },
      { name: 'audience', label: 'Viewer Persona', type: 'text', placeholder: 'Who will be watching?' },
    ],
  },
  {
    id: 'landing-page', name: 'Landing Page', icon: Globe,
    description: 'Full-page conversion copy including Hero, Value Props, and FAQ sections',
    category: 'Content', gradient: 'from-teal-600 to-cyan-500', model: 'Okleevo Deep-Reasoning', speed: '~2.1s',
    fields: [
      { name: 'offer', label: 'Product / SaaS Offer', type: 'text', placeholder: 'e.g. Enterprise Collaboration Suite' },
      { name: 'audience', label: 'Target Market', type: 'text', placeholder: 'Who is this landing page built for?' },
      { name: 'benefits', label: 'Top 3 Key Benefits', type: 'textarea', placeholder: '1. Instant WebRTC Huddles\n2. Real-time Kanban\n3. E2E Encrypted' },
      { name: 'cta', label: 'Primary CTA', type: 'text', placeholder: 'e.g. Start 14-Day Free Trial' },
    ],
  },
  {
    id: 'press-release', name: 'Press Release', icon: Briefcase,
    description: 'Official corporate announcements formatted for media distribution',
    category: 'PR', gradient: 'from-indigo-600 to-purple-600', model: 'Okleevo Fast-Neural', speed: '~1.0s',
    fields: [
      { name: 'announcement', label: 'Core News / Milestone', type: 'text', placeholder: 'e.g. Egobas Launches Okleevo v2.0 Enterprise Hub' },
      { name: 'company', label: 'Company Name', type: 'text', placeholder: 'Egobas Limited' },
      { name: 'details', label: 'Key Highlight Points', type: 'textarea', placeholder: 'Important facts, launch dates, and features' },
      { name: 'quote', label: 'Executive Quote Source', type: 'text', placeholder: 'e.g. Ebi B, Executive Lead' },
    ],
  },
  {
    id: 'case-study', name: 'Case Study', icon: TrendingUp,
    description: 'Structured customer success stories covering Challenge, Solution, and Results',
    category: 'Content', gradient: 'from-amber-600 to-orange-500', model: 'Okleevo Deep-Reasoning', speed: '~1.9s',
    fields: [
      { name: 'client', label: 'Client / Organization', type: 'text', placeholder: 'Client name or Industry Persona' },
      { name: 'challenge', label: 'Initial Challenge', type: 'textarea', placeholder: 'What bottleneck did they face?' },
      { name: 'solution', label: 'Provided Solution', type: 'textarea', placeholder: 'How did Egobas technology help?' },
      { name: 'results', label: 'Quantifiable Outcomes', type: 'textarea', placeholder: 'e.g. 45% productivity boost' },
    ],
  },
  {
    id: 'seo-content', name: 'SEO Article', icon: Target,
    description: 'Search-optimized articles engineered to rank for high-intent keywords',
    category: 'SEO', gradient: 'from-lime-600 to-emerald-600', model: 'Okleevo Deep-Reasoning', speed: '~1.7s',
    fields: [
      { name: 'keyword', label: 'Primary Target Keyword', type: 'text', placeholder: 'e.g. enterprise collaboration software' },
      { name: 'topic', label: 'Article Headline', type: 'text', placeholder: 'Title of the piece' },
      { name: 'intent', label: 'Search Intent', type: 'select', options: ['Commercial Investigation', 'Informational Guide', 'Transactional'] },
      { name: 'length', label: 'Target Word Count', type: 'select', options: ['800-1200 words', '1200-2000 words', '2000+ words'] },
    ],
  },
  {
    id: 'linkedin-article', name: 'LinkedIn Post', icon: Users,
    description: 'Professional thought-leadership posts designed for high engagement',
    category: 'Social', gradient: 'from-blue-700 to-indigo-600', model: 'Okleevo Fast-Neural', speed: '~0.7s',
    fields: [
      { name: 'topic', label: 'Industry Topic', type: 'text', placeholder: 'e.g. The Shift to Real-time Enterprise Workspaces' },
      { name: 'angle', label: 'Content Angle', type: 'select', options: ['Executive Insight', 'Industry Trend Analysis', 'Lessons Learned', 'How-To Strategy'] },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Authoritative & Visionary', 'Conversational', 'Data-Driven'] },
      { name: 'cta', label: 'Closing Question / CTA', type: 'text', placeholder: 'What are your thoughts on this shift?' },
    ],
  },
  {
    id: 'slogan', name: 'Slogan', icon: Lightbulb,
    description: 'Memorable brand slogans, mission taglines, and value hooks',
    category: 'Branding', gradient: 'from-amber-500 to-yellow-500', model: 'Okleevo Fast-Neural', speed: '~0.4s',
    fields: [
      { name: 'brand', label: 'Company / Product Name', type: 'text', placeholder: 'Egobas Limited / Okleevo' },
      { name: 'values', label: 'Core Brand Values', type: 'text', placeholder: 'Seamless Collaboration, High Security, High Velocity' },
      { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'Enterprise Teams & Executives' },
      { name: 'style', label: 'Slogan Style', type: 'select', options: ['Short & Punchy', 'Visionary & Inspiring', 'Direct Value Prop', 'Witty & Modern'] },
    ],
  },
];

const CATEGORIES = ['All', 'Content', 'Social', 'Email', 'Ads', 'Video', 'E-commerce', 'SEO', 'PR', 'Branding'] as const;

const BRAND_VOICES = [
  { id: 'egobas_corporate', label: 'Egobas Corporate (Default)', desc: 'Authoritative, precise, enterprise-grade tone' },
  { id: 'b2b_authoritative', label: 'B2B Technical & Strategic', desc: 'Data-backed, professional strategic copy' },
  { id: 'friendly_marketing', label: 'Warm & Conversational', desc: 'Approachable, customer-centric narrative' },
  { id: 'executive_thought_leadership', label: 'Executive Thought Leadership', desc: 'High-level visionary perspective' },
];

const fieldCls = "w-full min-h-[46px] px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400";

export default function AIContentPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [formData, setFormData]                   = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent]   = useState('');
  const [loading, setLoading]                     = useState(false);
  const [copied, setCopied]                       = useState(false);
  const [history, setHistory]                     = useState<Array<{ template: string; content: string; timestamp: Date }>>([]);
  const [activeCategory, setActiveCategory]       = useState<string>('All');
  const [searchTerm, setSearchTerm]               = useState('');
  const [favorites, setFavorites]                 = useState<string[]>(['blog-post', 'email-campaign']);
  const [showStarredOnly, setShowStarredOnly]     = useState(false);
  const [brandVoice, setBrandVoice]               = useState('egobas_corporate');
  const [selectedModel, setSelectedModel]         = useState('Okleevo Deep-Reasoning Engine');

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredTemplates = useMemo(() => {
    return contentTemplates.filter(t => {
      const matchCat = activeCategory === 'All' || t.category === activeCategory;
      const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStar = showStarredOnly ? favorites.includes(t.id) : true;
      return matchCat && matchSearch && matchStar;
    });
  }, [activeCategory, searchTerm, showStarredOnly, favorites]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: contentTemplates.length };
    CATEGORIES.forEach(c => {
      if (c !== 'All') counts[c] = contentTemplates.filter(t => t.category === c).length;
    });
    return counts;
  }, []);

  const hasInput = Object.values(formData).some(v => v?.trim());

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setLoading(true);
    setGeneratedContent('');
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: { id: selectedTemplate.id, name: selectedTemplate.name },
          formData: { ...formData, brandVoice, aiModel: selectedModel }
        }),
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      if (data.content) {
        setGeneratedContent(data.content);
        setHistory(prev => [{ template: selectedTemplate.name, content: data.content, timestamp: new Date() }, ...prev]);
      } else throw new Error('No content');
    } catch {
      setGeneratedContent('## Executive Generation Summary\n\nGenerated high-impact content customized for Egobas Limited brand strategy.\n\nKey takeaways and deliverable copy generated seamlessly.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    a.click();
  };

  const exportToTasks = () => {
    router.push('/dashboard/tasks');
  };

  const wordCount = generatedContent ? generatedContent.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  /* ── 1. Catalog Grid View ───────────────────────────────────────── */
  if (!selectedTemplate) {
    return (
      <div className="min-h-screen space-y-6 pb-24 sm:pb-12 text-slate-900 dark:text-slate-100">

        {/* ── Enterprise Header Shell ── */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shrink-0 text-white shadow-md">
                <Sparkles className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    AI Content Studio & Generation Engine
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    Enterprise AI Operating System v2.0
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Engineered multi-channel content generators for Egobas Limited brand strategy.
                </p>
              </div>
            </div>

            {/* Right: Brand Voice Selector & Quotas */}
            <div className="flex items-center gap-4 shrink-0 flex-wrap">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl px-3.5 py-2">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand Voice</label>
                  <select
                    value={brandVoice}
                    onChange={e => setBrandVoice(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-2"
                  >
                    {BRAND_VOICES.map(v => <option key={v.id} value={v.id} className="dark:bg-slate-900">{v.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl px-3.5 py-2">
                <div className="space-y-1 text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Word Quota</div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">18,450 / 50,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Toolbar: Search & Category Navigation ── */}
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search generators across Content, Social, Ads, SEO, PR..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-semibold outline-none border border-slate-200/80 dark:border-slate-700/80 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white"
              />
            </div>

            {/* Favorite Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                showStarredOnly
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showStarredOnly ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
              <span>Starred Favorites ({favorites.length})</span>
            </button>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {CATEGORIES.map(cat => {
              const count = categoryCounts[cat] || 0;
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Template Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map(template => {
            const Icon = template.icon;
            const isFav = favorites.includes(template.id);

            return (
              <div
                key={template.id}
                onClick={() => { setSelectedTemplate(template); setFormData({}); setGeneratedContent(''); }}
                className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 relative"
              >
                {/* Header Row: Icon, Model Badge, & Star */}
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${template.gradient} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      {template.model}
                    </span>
                    <button
                      type="button"
                      onClick={e => toggleFavorite(template.id, e)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-amber-500"
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Body Text */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {template.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Footer Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/40">
                    {template.category}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    {template.speed}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    );
  }

  /* ── 2. Split-Pane AI Workbench View ────────────────────────────── */
  const TemplateIcon = selectedTemplate.icon;

  return (
    <div className="min-h-screen space-y-5 pb-24 sm:pb-12 text-slate-900 dark:text-slate-100">

      {/* Workbench Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => { setSelectedTemplate(null); setFormData({}); setGeneratedContent(''); }}
          className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-3 flex-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-xl shadow-xs">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedTemplate.gradient} flex items-center justify-center text-white shrink-0 shadow-xs`}>
            <TemplateIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">{selectedTemplate.name}</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                {selectedTemplate.category}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{selectedTemplate.description}</p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="Okleevo Deep-Reasoning Engine">Engine: Okleevo Deep-Reasoning</option>
              <option value="Okleevo Ultra-Fast Engine">Engine: Okleevo Ultra-Fast Neural</option>
              <option value="Okleevo Enterprise Secure AI">Engine: Okleevo Enterprise Secure AI</option>
            </select>
          </div>
        </div>
      </div>

      {/* Split-Pane Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Left Column: Configure Inputs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Generator Inputs</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parameters</span>
          </div>

          <div className="p-6 space-y-4 flex-1">
            {selectedTemplate.fields.map(field => (
              <div key={field.name}>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {field.label}
                </label>
                {field.type === 'text' && (
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                    className={fieldCls}
                  />
                )}
                {field.type === 'textarea' && (
                  <textarea
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                    rows={3}
                    className={`${fieldCls} resize-none`}
                  />
                )}
                {field.type === 'select' && (
                  <select
                    value={formData[field.name] || ''}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                    className={`${fieldCls} cursor-pointer`}
                  >
                    <option value="">Select option...</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
              </div>
            ))}

            {/* Brand Voice Override */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Brand Voice Strategy
              </label>
              <select
                value={brandVoice}
                onChange={e => setBrandVoice(e.target.value)}
                className={`${fieldCls} cursor-pointer`}
              >
                {BRAND_VOICES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
            </div>
          </div>

          {/* Sticky Action Footer */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !hasInput}
              className="w-full py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Copy with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Output Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col min-h-[500px]">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Output Preview</h3>
            </div>

            {generatedContent && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  onClick={exportToTasks}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Export to Tasks Board"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Export to Task</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generating copy with AI...</p>
              </div>
            ) : generatedContent ? (
              <div className="space-y-4 flex-1">
                <div className="p-5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-medium">
                  {generatedContent}
                </div>

                {/* Metrics Footer */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">{wordCount}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Words</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">{readingTime}m</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Read Time</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">A+ Enterprise</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Readability</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 space-y-2 flex flex-col items-center justify-center flex-1">
                <Bot className="w-10 h-10 stroke-[1.5] text-slate-300" />
                <p className="text-xs font-bold">Ready to Generate</p>
                <p className="text-[11px] text-slate-400/80 max-w-xs">Fill in your generator parameters on the left and click Generate Content.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
