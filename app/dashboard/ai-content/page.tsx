"use client";

import { useState } from 'react';
import {
  Sparkles, Copy, Download, Wand2, FileText, Mail,
  MessageSquare, ShoppingBag, Megaphone, Video,
  Briefcase, TrendingUp, Lightbulb, Check,
  ChevronRight, ChevronLeft, Zap, Target, Users, Globe
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ContentTemplate {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  category: string;
  gradient: string;
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
    description: 'SEO-optimized blog articles with engaging narratives',
    category: 'Content', gradient: 'from-blue-500 to-cyan-500',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., The Future of AI in Business' },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Casual', 'Friendly', 'Authoritative', 'Conversational'] },
      { name: 'length', label: 'Length', type: 'select', options: ['Short (300-500 words)', 'Medium (500-1000 words)', 'Long (1000-2000 words)'] },
      { name: 'keywords', label: 'Keywords', type: 'text', placeholder: 'Comma-separated keywords' },
    ],
  },
  {
    id: 'social-media', name: 'Social Post', icon: MessageSquare,
    description: 'Engaging posts for Instagram, Twitter, LinkedIn, and Facebook',
    category: 'Social', gradient: 'from-pink-500 to-rose-500',
    fields: [
      { name: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'Twitter/X', 'LinkedIn', 'Facebook', 'TikTok'] },
      { name: 'topic', label: 'Topic/Message', type: 'textarea', placeholder: 'What do you want to share?' },
      { name: 'style', label: 'Style', type: 'select', options: ['Inspirational', 'Educational', 'Promotional', 'Entertaining', 'News'] },
      { name: 'hashtags', label: 'Include Hashtags', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  {
    id: 'email-campaign', name: 'Email Campaign', icon: Mail,
    description: 'Persuasive email copy that drives conversions',
    category: 'Email', gradient: 'from-purple-500 to-indigo-500',
    fields: [
      { name: 'purpose', label: 'Email Purpose', type: 'select', options: ['Newsletter', 'Promotion', 'Welcome', 'Follow-up', 'Announcement'] },
      { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g., New subscribers, Existing customers' },
      { name: 'cta', label: 'Call-to-Action', type: 'text', placeholder: 'What action should they take?' },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Friendly', 'Professional', 'Urgent', 'Casual', 'Formal'] },
    ],
  },
  {
    id: 'product-description', name: 'Product Desc.', icon: ShoppingBag,
    description: 'Compelling product copy that sells',
    category: 'E-commerce', gradient: 'from-green-500 to-emerald-500',
    fields: [
      { name: 'product', label: 'Product Name', type: 'text', placeholder: 'e.g., Wireless Headphones' },
      { name: 'features', label: 'Key Features', type: 'textarea', placeholder: 'List main features (one per line)' },
      { name: 'audience', label: 'Target Customer', type: 'text', placeholder: 'Who is this for?' },
      { name: 'style', label: 'Style', type: 'select', options: ['Benefit-focused', 'Feature-focused', 'Story-driven', 'Technical'] },
    ],
  },
  {
    id: 'ad-copy', name: 'Ad Copy', icon: Megaphone,
    description: 'High-converting ad copy for Google, Facebook, and more',
    category: 'Ads', gradient: 'from-orange-500 to-red-500',
    fields: [
      { name: 'platform', label: 'Ad Platform', type: 'select', options: ['Google Ads', 'Facebook Ads', 'Instagram Ads', 'LinkedIn Ads', 'Twitter Ads'] },
      { name: 'product', label: 'Product/Service', type: 'text', placeholder: 'What are you advertising?' },
      { name: 'benefit', label: 'Main Benefit', type: 'text', placeholder: 'Key value proposition' },
      { name: 'cta', label: 'Call-to-Action', type: 'text', placeholder: 'e.g., Shop Now, Learn More' },
    ],
  },
  {
    id: 'video-script', name: 'Video Script', icon: Video,
    description: 'Engaging scripts for YouTube, TikTok, and video content',
    category: 'Video', gradient: 'from-red-500 to-pink-500',
    fields: [
      { name: 'topic', label: 'Video Topic', type: 'text', placeholder: 'What is the video about?' },
      { name: 'duration', label: 'Duration', type: 'select', options: ['15-30 seconds', '1 minute', '3-5 minutes', '10+ minutes'] },
      { name: 'style', label: 'Style', type: 'select', options: ['Tutorial', 'Vlog', 'Review', 'Educational', 'Entertainment'] },
      { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'Who will watch this?' },
    ],
  },
  {
    id: 'landing-page', name: 'Landing Page', icon: Globe,
    description: 'Conversion-focused landing page content',
    category: 'Content', gradient: 'from-teal-500 to-cyan-500',
    fields: [
      { name: 'offer', label: 'Offer/Product', type: 'text', placeholder: 'What are you offering?' },
      { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'Who is this for?' },
      { name: 'benefits', label: 'Key Benefits', type: 'textarea', placeholder: 'List 3-5 main benefits' },
      { name: 'cta', label: 'Primary CTA', type: 'text', placeholder: 'e.g., Start Free Trial' },
    ],
  },
  {
    id: 'press-release', name: 'Press Release', icon: Briefcase,
    description: 'Professional press releases for media distribution',
    category: 'PR', gradient: 'from-indigo-500 to-purple-500',
    fields: [
      { name: 'announcement', label: 'Announcement', type: 'text', placeholder: 'What are you announcing?' },
      { name: 'company', label: 'Company Name', type: 'text', placeholder: 'Your company name' },
      { name: 'details', label: 'Key Details', type: 'textarea', placeholder: 'Important information to include' },
      { name: 'quote', label: 'Quote Source', type: 'text', placeholder: 'e.g., CEO, Founder' },
    ],
  },
  {
    id: 'case-study', name: 'Case Study', icon: TrendingUp,
    description: 'Detailed success stories and customer testimonials',
    category: 'Content', gradient: 'from-yellow-500 to-orange-500',
    fields: [
      { name: 'client', label: 'Client/Company', type: 'text', placeholder: 'Client name (or anonymous)' },
      { name: 'challenge', label: 'Challenge', type: 'textarea', placeholder: 'What problem did they face?' },
      { name: 'solution', label: 'Solution', type: 'textarea', placeholder: 'How did you help?' },
      { name: 'results', label: 'Results', type: 'textarea', placeholder: 'Quantifiable outcomes' },
    ],
  },
  {
    id: 'seo-content', name: 'SEO Article', icon: Target,
    description: 'Search-optimized content that ranks',
    category: 'SEO', gradient: 'from-lime-500 to-green-500',
    fields: [
      { name: 'keyword', label: 'Primary Keyword', type: 'text', placeholder: 'Main keyword to target' },
      { name: 'topic', label: 'Topic', type: 'text', placeholder: 'Article topic' },
      { name: 'intent', label: 'Search Intent', type: 'select', options: ['Informational', 'Commercial', 'Transactional', 'Navigational'] },
      { name: 'length', label: 'Word Count', type: 'select', options: ['500-800 words', '800-1200 words', '1200-2000 words', '2000+ words'] },
    ],
  },
  {
    id: 'linkedin-article', name: 'LinkedIn Post', icon: Users,
    description: 'Professional thought leadership content',
    category: 'Social', gradient: 'from-blue-600 to-blue-400',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', placeholder: 'What expertise are you sharing?' },
      { name: 'angle', label: 'Angle', type: 'select', options: ['Personal Experience', 'Industry Insights', 'How-To Guide', 'Opinion Piece', 'Trend Analysis'] },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Conversational', 'Authoritative', 'Inspirational'] },
      { name: 'cta', label: 'Call-to-Action', type: 'text', placeholder: 'What should readers do?' },
    ],
  },
  {
    id: 'slogan', name: 'Slogan', icon: Lightbulb,
    description: 'Memorable brand slogans and taglines',
    category: 'Branding', gradient: 'from-amber-500 to-yellow-500',
    fields: [
      { name: 'brand', label: 'Brand/Product', type: 'text', placeholder: 'What needs a slogan?' },
      { name: 'values', label: 'Brand Values', type: 'text', placeholder: 'Core values or mission' },
      { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'Who is your audience?' },
      { name: 'style', label: 'Style', type: 'select', options: ['Short & Punchy', 'Descriptive', 'Emotional', 'Clever/Witty', 'Inspirational'] },
    ],
  },
];

const CATEGORIES = ['All', 'Content', 'Social', 'Email', 'Ads', 'Video', 'E-commerce', 'SEO', 'PR', 'Branding'];

const fieldCls = "w-full min-h-[48px] px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white transition-all outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400";

export default function AIContentPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<Array<{ template: string; content: string; timestamp: Date }>>([]);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTemplates = activeCategory === 'All'
    ? contentTemplates
    : contentTemplates.filter(t => t.category === activeCategory);

  const hasInput = Object.values(formData).some(v => v?.trim());

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setLoading(true);
    setGeneratedContent('');
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: { id: selectedTemplate.id, name: selectedTemplate.name }, formData }),
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      if (data.content) {
        setGeneratedContent(data.content);
        setHistory(prev => [{ template: selectedTemplate.name, content: data.content, timestamp: new Date() }, ...prev]);
      } else throw new Error('No content');
    } catch {
      setGeneratedContent('## Generation failed\n\nSomething went wrong. Please try again.');
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
    a.download = `${selectedTemplate?.name || 'content'}-${Date.now()}.txt`;
    a.click();
  };

  const wordCount = generatedContent ? generatedContent.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  /* ── Template selection view ─────────────────────────────────────── */
  if (!selectedTemplate) {
    return (
      <div className="relative min-h-screen -m-4 sm:-m-6 p-4 sm:p-6 bg-slate-50">
        {/* Background blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-purple-500/8 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/8 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-5 pb-24 sm:pb-10">
          {/* ── Hero header ── */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-5 sm:p-8 shadow-xl shadow-purple-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Icon */}
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full mb-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">AI Powered</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-none">
                  Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Studio</span>
                </h1>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  Generate professional content in seconds with AI.
                </p>
              </div>

              {/* Stat pill */}
              <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-100 rounded-2xl shrink-0 self-start sm:self-auto">
                <Zap className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <div className="text-xl font-black text-gray-900 leading-none">{history.length}</div>
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-wider mt-0.5">Generated</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Category pills ── */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer border ${
                  activeCategory === cat
                    ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                    : 'bg-white text-gray-500 border-gray-100 hover:border-purple-200 hover:text-purple-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Template grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredTemplates.map((template, i) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => { setSelectedTemplate(template); setFormData({}); setGeneratedContent(''); }}
                  className="group relative bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 text-left flex flex-col gap-3 shadow-sm cursor-pointer active:scale-95"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Gradient hover overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity rounded-2xl sm:rounded-3xl`} />

                  {/* Icon */}
                  <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${template.gradient} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-black text-gray-900 group-hover:text-purple-700 transition-colors leading-tight">
                      {template.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-400 font-medium mt-1 line-clamp-2 leading-relaxed hidden sm:block">
                      {template.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="text-[9px] sm:text-[10px] font-black text-purple-500 uppercase tracking-widest">{template.category}</span>
                    <div className="w-6 h-6 rounded-lg bg-gray-50 group-hover:bg-purple-600 flex items-center justify-center transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Feature pills ── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: FileText, label: '12 Templates', sub: 'Every content type', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: Sparkles, label: 'AI-Powered', sub: 'Groq & Gemini', color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: Zap, label: 'Instant', sub: 'Ready in seconds', color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(({ icon: Icon, label, sub, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3`}>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
                </div>
                <div>
                  <div className="text-[11px] sm:text-sm font-black text-gray-900 leading-tight">{label}</div>
                  <div className="text-[9px] sm:text-[10px] font-medium text-gray-500 hidden sm:block">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Generator view ──────────────────────────────────────────────── */
  const TemplateIcon = selectedTemplate.icon;

  return (
    <div className="relative min-h-screen -m-4 sm:-m-6 p-4 sm:p-6 bg-slate-50">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-purple-500/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/8 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-4 pb-24 sm:pb-10">
        {/* ── Back + template header ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSelectedTemplate(null); setFormData({}); setGeneratedContent(''); }}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-purple-300 hover:text-purple-700 transition-colors shadow-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className={`flex items-center gap-3 flex-1 bg-gradient-to-r ${selectedTemplate.gradient} p-3 sm:p-4 rounded-2xl shadow-lg`}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <TemplateIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-black text-white leading-none truncate">{selectedTemplate.name}</h2>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5">{selectedTemplate.category}</p>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          {/* ── Input panel ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col">
            {/* Panel header */}
            <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Wand2 className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-black text-gray-900 text-sm">Configure</span>
              <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg">
                <Zap className="w-3 h-3 text-purple-500" />
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Groq & Gemini</span>
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4">
              {selectedTemplate.fields.map(field => (
                <div key={field.name}>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
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
                      className={`${fieldCls} cursor-pointer appearance-none`}
                    >
                      <option value="">Select an option...</option>
                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              ))}

              {/* Tips */}
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-indigo-800 uppercase tracking-wider mb-1.5">Tips</p>
                    <ul className="text-[11px] text-indigo-600/80 font-medium space-y-1">
                      <li>• Be specific about your target audience</li>
                      <li>• Set the tone that matches your brand</li>
                      <li>• Include relevant keywords or phrases</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate button — sticky inside the panel */}
            <div className="shrink-0 p-4 sm:p-5 border-t border-gray-100 bg-white">
              <button
                onClick={handleGenerate}
                disabled={loading || !hasInput}
                className={`w-full h-14 sm:h-16 rounded-2xl font-black text-sm sm:text-base uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer ${
                  loading || !hasInput
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-purple-600 hover:shadow-xl hover:shadow-purple-500/30 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Content
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Output panel ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col min-h-[480px] lg:min-h-0">
            {/* Panel header */}
            <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="p-1.5 bg-yellow-50 rounded-lg">
                <Sparkles className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="font-black text-gray-900 text-sm">Output</span>
              {generatedContent && (
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    title="Copy"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg text-[11px] font-bold text-gray-600 transition-colors cursor-pointer border border-transparent hover:border-purple-200"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    title="Download"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg text-[11px] font-bold text-gray-600 transition-colors cursor-pointer border border-transparent hover:border-purple-200"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-5">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-[6px] border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-gray-900">Generating…</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">This may take a few seconds</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-800 font-medium leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-2xl p-4 sm:p-5 border border-gray-100">
                    {generatedContent}
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: wordCount, label: 'Words' },
                      { value: `${readingTime}m`, label: 'Read Time' },
                      { value: generatedContent.length, label: 'Chars' },
                    ].map(({ value, label }) => (
                      <div key={label} className="bg-emerald-50 rounded-2xl p-3 sm:p-4 text-center border border-emerald-100/50">
                        <div className="text-xl sm:text-2xl font-black text-emerald-800">{value}</div>
                        <div className="text-[9px] font-black text-emerald-600 uppercase tracking-wider mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-10">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center shadow-inner">
                    <Wand2 className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-800">Ready to Generate</h4>
                    <p className="text-sm text-gray-400 font-medium mt-1 max-w-xs mx-auto">
                      Fill in the form and click Generate Content.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
