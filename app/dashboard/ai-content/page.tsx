"use client";

import React, { useState } from 'react';
import { 
  Sparkles, Copy, Download, Wand2, FileText, Mail, 
  MessageSquare, ShoppingBag, Megaphone, Video, 
  Briefcase, TrendingUp, Lightbulb, Check,
  ChevronRight, Star, Zap, Target, Users, Globe
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

interface AIModel {
  id: string;
  name: string;
  provider: 'Groq' | 'Gemini';
  description: string;
}

const availableModels: AIModel[] = [
  { id: 'mistral-saba-24b', name: 'Mistral Saba', provider: 'Groq', description: 'Fast, efficient 24B parameter model' },
  { id: 'gemma2-9b-it', name: 'Gemma 2', provider: 'Groq', description: 'Google\'s lightweight instruction-tuned model' },
  { id: 'qwen-qwq-32b', name: 'Qwen 2', provider: 'Groq', description: 'Advanced model from Alibaba Cloud' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1', provider: 'Groq', description: 'Reasoning-focused model' },
  { id: 'falcon-2-11b', name: 'Falcon 2', provider: 'Groq', description: 'High-performance open-source model' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Gemini', description: 'Google\'s most capable multimodal model' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Gemini', description: 'Fast and cost-efficient multimodal model' },
];

const contentTemplates: ContentTemplate[] = [
  {
    id: 'blog-post',
    name: 'Blog Post',
    icon: FileText,
    description: 'SEO-optimized blog articles with engaging narratives',
    category: 'Content Marketing',
    gradient: 'from-blue-500 to-cyan-500',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., The Future of AI in Business' },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Casual', 'Friendly', 'Authoritative', 'Conversational'] },
      { name: 'length', label: 'Length', type: 'select', options: ['Short (300-500 words)', 'Medium (500-1000 words)', 'Long (1000-2000 words)'] },
      { name: 'keywords', label: 'Keywords', type: 'text', placeholder: 'Comma-separated keywords' }
    ]
  },
  {
    id: 'social-media',
    name: 'Social Media Post',
    icon: MessageSquare,
    description: 'Engaging posts for Instagram, Twitter, LinkedIn, and Facebook',
    category: 'Social Media',
    gradient: 'from-pink-500 to-rose-500',
    fields: [
      { name: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'Twitter/X', 'LinkedIn', 'Facebook', 'TikTok'] },
      { name: 'topic', label: 'Topic/Message', type: 'textarea', placeholder: 'What do you want to share?' },
      { name: 'style', label: 'Style', type: 'select', options: ['Inspirational', 'Educational', 'Promotional', 'Entertaining', 'News'] },
      { name: 'hashtags', label: 'Include Hashtags', type: 'select', options: ['Yes', 'No'] }
    ]
  },
  {
    id: 'email-campaign',
    name: 'Email Campaign',
    icon: Mail,
    description: 'Persuasive email copy that drives conversions',
    category: 'Email Marketing',
    gradient: 'from-purple-500 to-indigo-500',
    fields: [
      { name: 'purpose', label: 'Email Purpose', type: 'select', options: ['Newsletter', 'Promotion', 'Welcome', 'Follow-up', 'Announcement'] },
      { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g., New subscribers, Existing customers' },
      { name: 'cta', label: 'Call-to-Action', type: 'text', placeholder: 'What action should they take?' },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Friendly', 'Professional', 'Urgent', 'Casual', 'Formal'] }
    ]
  },
  {
    id: 'product-description',
    name: 'Product Description',
    icon: ShoppingBag,
    description: 'Compelling product copy that sells',
    category: 'E-commerce',
    gradient: 'from-green-500 to-emerald-500',
    fields: [
      { name: 'product', label: 'Product Name', type: 'text', placeholder: 'e.g., Wireless Headphones' },
      { name: 'features', label: 'Key Features', type: 'textarea', placeholder: 'List main features (one per line)' },
      { name: 'audience', label: 'Target Customer', type: 'text', placeholder: 'Who is this for?' },
      { name: 'style', label: 'Style', type: 'select', options: ['Benefit-focused', 'Feature-focused', 'Story-driven', 'Technical'] }
    ]
  },
  {
    id: 'ad-copy',
    name: 'Ad Copy',
    icon: Megaphone,
    description: 'High-converting ad copy for Google, Facebook, and more',
    category: 'Advertising',
    gradient: 'from-orange-500 to-red-500',
    fields: [
      { name: 'platform', label: 'Ad Platform', type: 'select', options: ['Google Ads', 'Facebook Ads', 'Instagram Ads', 'LinkedIn Ads', 'Twitter Ads'] },
      { name: 'product', label: 'Product/Service', type: 'text', placeholder: 'What are you advertising?' },
      { name: 'benefit', label: 'Main Benefit', type: 'text', placeholder: 'Key value proposition' },
      { name: 'cta', label: 'Call-to-Action', type: 'text', placeholder: 'e.g., Shop Now, Learn More' }
    ]
  },
  {
    id: 'video-script',
    name: 'Video Script',
    icon: Video,
    description: 'Engaging scripts for YouTube, TikTok, and video content',
    category: 'Video Content',
    gradient: 'from-red-500 to-pink-500',
    fields: [
      { name: 'topic', label: 'Video Topic', type: 'text', placeholder: 'What is the video about?' },
      { name: 'duration', label: 'Duration', type: 'select', options: ['15-30 seconds', '1 minute', '3-5 minutes', '10+ minutes'] },
      { name: 'style', label: 'Style', type: 'select', options: ['Tutorial', 'Vlog', 'Review', 'Educational', 'Entertainment'] },
      { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'Who will watch this?' }
    ]
  },
  {
    id: 'landing-page',
    name: 'Landing Page Copy',
    icon: Globe,
    description: 'Conversion-focused landing page content',
    category: 'Web Content',
    gradient: 'from-teal-500 to-cyan-500',
    fields: [
      { name: 'offer', label: 'Offer/Product', type: 'text', placeholder: 'What are you offering?' },
      { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'Who is this for?' },
      { name: 'benefits', label: 'Key Benefits', type: 'textarea', placeholder: 'List 3-5 main benefits' },
      { name: 'cta', label: 'Primary CTA', type: 'text', placeholder: 'e.g., Start Free Trial' }
    ]
  },
  {
    id: 'press-release',
    name: 'Press Release',
    icon: Briefcase,
    description: 'Professional press releases for media distribution',
    category: 'PR & Communications',
    gradient: 'from-indigo-500 to-purple-500',
    fields: [
      { name: 'announcement', label: 'Announcement', type: 'text', placeholder: 'What are you announcing?' },
      { name: 'company', label: 'Company Name', type: 'text', placeholder: 'Your company name' },
      { name: 'details', label: 'Key Details', type: 'textarea', placeholder: 'Important information to include' },
      { name: 'quote', label: 'Quote Source', type: 'text', placeholder: 'e.g., CEO, Founder' }
    ]
  },
  {
    id: 'case-study',
    name: 'Case Study',
    icon: TrendingUp,
    description: 'Detailed success stories and customer testimonials',
    category: 'Content Marketing',
    gradient: 'from-yellow-500 to-orange-500',
    fields: [
      { name: 'client', label: 'Client/Company', type: 'text', placeholder: 'Client name (or anonymous)' },
      { name: 'challenge', label: 'Challenge', type: 'textarea', placeholder: 'What problem did they face?' },
      { name: 'solution', label: 'Solution', type: 'textarea', placeholder: 'How did you help?' },
      { name: 'results', label: 'Results', type: 'textarea', placeholder: 'Quantifiable outcomes' }
    ]
  },
  {
    id: 'seo-content',
    name: 'SEO Article',
    icon: Target,
    description: 'Search-optimized content that ranks',
    category: 'SEO',
    gradient: 'from-lime-500 to-green-500',
    fields: [
      { name: 'keyword', label: 'Primary Keyword', type: 'text', placeholder: 'Main keyword to target' },
      { name: 'topic', label: 'Topic', type: 'text', placeholder: 'Article topic' },
      { name: 'intent', label: 'Search Intent', type: 'select', options: ['Informational', 'Commercial', 'Transactional', 'Navigational'] },
      { name: 'length', label: 'Word Count', type: 'select', options: ['500-800 words', '800-1200 words', '1200-2000 words', '2000+ words'] }
    ]
  },
  {
    id: 'linkedin-article',
    name: 'LinkedIn Article',
    icon: Users,
    description: 'Professional thought leadership content',
    category: 'Social Media',
    gradient: 'from-blue-600 to-blue-400',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', placeholder: 'What expertise are you sharing?' },
      { name: 'angle', label: 'Angle', type: 'select', options: ['Personal Experience', 'Industry Insights', 'How-To Guide', 'Opinion Piece', 'Trend Analysis'] },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Conversational', 'Authoritative', 'Inspirational'] },
      { name: 'cta', label: 'Call-to-Action', type: 'text', placeholder: 'What should readers do?' }
    ]
  },
  {
    id: 'slogan',
    name: 'Slogan & Tagline',
    icon: Lightbulb,
    description: 'Memorable brand slogans and taglines',
    category: 'Branding',
    gradient: 'from-amber-500 to-yellow-500',
    fields: [
      { name: 'brand', label: 'Brand/Product', type: 'text', placeholder: 'What needs a slogan?' },
      { name: 'values', label: 'Brand Values', type: 'text', placeholder: 'Core values or mission' },
      { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'Who is your audience?' },
      { name: 'style', label: 'Style', type: 'select', options: ['Short & Punchy', 'Descriptive', 'Emotional', 'Clever/Witty', 'Inspirational'] }
    ]
  }
];

export default function AIContentPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedModel, setSelectedModel] = useState<AIModel>(availableModels[0]);
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ template: string; content: string; timestamp: Date }>>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(contentTemplates.map(t => t.category)))];

  const filteredTemplates = activeCategory === 'All' 
    ? contentTemplates 
    : contentTemplates.filter(t => t.category === activeCategory);

  const handleGenerate = () => {
    setLoading(true);
    // Simulate AI generation
    setTimeout(() => {
      const mockContent = `# Generated ${selectedTemplate?.name}\n\n**Engine**: ${selectedModel.name} (${selectedModel.provider})\n\nThis is a sample generated content based on your inputs:\n\n${Object.entries(formData).map(([key, value]) => `**${key}**: ${value}`).join('\n')}\n\n{"\""}[Your synthesized intelligence, forged via ${selectedModel.name}, would appear here with full formatting, engaging copy, and professional structure based on the template and inputs provided.]{"\""}`;
      setGeneratedContent(mockContent);
      setHistory([{ template: selectedTemplate?.name || '', content: mockContent, timestamp: new Date() }, ...history]);
      setLoading(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.name || 'content'}-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="relative min-h-screen -m-4 md:-m-8 p-4 md:p-8 overflow-hidden bg-slate-50">
      {/* Dynamic Mesh Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse decoration-1000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-600/5 blur-[100px] rounded-full animate-bounce decoration-2000" />
      </div>

      <div className="relative z-10 space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/90 backdrop-blur-2xl p-8 rounded-3xl border-2 border-white shadow-2xl shadow-purple-500/5 items-start">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-black uppercase tracking-widest border border-purple-200">
              <Sparkles className="w-3 h-3" />
              Intelligence Core
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              AI Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Studio</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-2xl text-lg">
              Forge high-performance semantic assets with our advanced neural synthesis engine.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-6 py-4 rounded-2xl border-2 border-purple-50 shadow-sm group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg group-hover:rotate-12 transition-transform">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900 leading-none">{history.length}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Synthesized</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 whitespace-nowrap border-2 cursor-pointer ${
                activeCategory === category
                  ? 'bg-gray-900 border-gray-900 text-white shadow-xl scale-105 z-10'
                  : 'bg-white/50 backdrop-blur-md border-white text-gray-600 hover:border-purple-200 hover:text-purple-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

      {!selectedTemplate ? (
        <div className="space-y-8">
          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template, index) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="group relative w-full h-full bg-white rounded-3xl border-2 border-gray-100 p-8 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 text-left overflow-hidden flex flex-col justify-between shadow-sm cursor-pointer"
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    <div className="relative z-10">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${template.gradient} mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                        {template.name}
                      </h3>
                      
                      <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    
                    <div className="relative z-10 flex items-center justify-between pt-6 border-t border-gray-100/50">
                      <span className="text-xs font-black text-purple-600 uppercase tracking-widest">{template.category}</span>
                      <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText className="w-24 h-24 text-blue-600" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">12 Templates</h3>
              </div>
              <p className="text-gray-500 font-medium">Professional content types ready for high-level synthesis.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-24 h-24 text-purple-600" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-500/10 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">AI-Powered</h3>
              </div>
              <p className="text-gray-500 font-medium">Advanced language models optimized for semantic excellence.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-24 h-24 text-amber-600" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl">
                  <Zap className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Instant Forge</h3>
              </div>
              <p className="text-gray-500 font-medium">Generate mission-critical content in sub-second intervals.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          {/* Back Button */}
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setFormData({});
              setGeneratedContent('');
            }}
            className="group flex items-center gap-3 text-gray-600 hover:text-gray-900 font-black uppercase tracking-widest text-xs transition-all bg-white/70 hover:bg-white backdrop-blur-md px-6 py-3 rounded-2xl border border-white/50 shadow-xl cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Forge
          </button>

          {/* Content Generation Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-2xl p-10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  {React.createElement(selectedTemplate.icon, { className: "w-32 h-32 text-purple-600" })}
                </div>
                
                <div className="relative z-10 flex items-center gap-6 mb-10 pb-10 border-b border-gray-100">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedTemplate.gradient} shadow-lg shadow-purple-500/20`}>
                    {React.createElement(selectedTemplate.icon, { className: "w-8 h-8 text-white" })}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{selectedTemplate.name}</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-wider text-xs mt-1">{selectedTemplate.category}</p>
                  </div>
                </div>

                {/* Model Selection */}
                <div className="mb-10 p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-xl">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Synthesis Engine</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                      <select
                        value={selectedModel.id}
                        onChange={(e) => {
                          const model = availableModels.find(m => m.id === e.target.value);
                          if (model) setSelectedModel(model);
                        }}
                        className="w-full px-6 py-4 bg-white border-2 border-transparent focus:border-purple-500 rounded-2xl transition-all duration-300 font-bold text-gray-900 shadow-sm appearance-none cursor-pointer"
                      >
                        {availableModels.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name} — {model.provider}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronRight className="w-5 h-5 text-gray-400 rotate-90" />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-400 ml-2 italic">
                      {selectedModel.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-8 relative z-10">
                  {selectedTemplate.fields.map((field) => (
                    <div key={field.name} className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        {field.label}
                      </label>
                      {field.type === 'text' && (
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          className="w-full px-6 py-5 bg-gray-50/50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-3xl transition-all duration-300 font-bold text-gray-900 placeholder:text-gray-300 shadow-inner"
                        />
                      )}
                      {field.type === 'textarea' && (
                        <textarea
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          rows={4}
                          className="w-full px-6 py-5 bg-gray-50/50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-3xl transition-all duration-300 font-bold text-gray-900 placeholder:text-gray-300 resize-none shadow-inner"
                        />
                      )}
                      {field.type === 'select' && (
                        <select
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          className="w-full px-6 py-5 bg-gray-50/50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-3xl transition-all duration-300 font-bold text-gray-900 shadow-inner appearance-none cursor-pointer"
                        >
                          <option value="">Select configuration...</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || Object.keys(formData).length === 0}
                  className="w-full mt-10 px-8 py-6 bg-gray-900 text-white font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-purple-600 hover:shadow-2xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 flex items-center justify-center gap-4 group h-[80px] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="animate-pulse">Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-500" />
                      Forge Asset
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
                    </>
                  )}
                </button>

                {/* Pro Tips */}
                <div className="mt-10 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[2rem] border border-indigo-100/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                    <Lightbulb className="w-12 h-12 text-indigo-600 font-black" />
                  </div>
                  <div className="flex items-start gap-4 uppercase">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <Lightbulb className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-indigo-900 tracking-widest text-xs mb-3">Operational Intelligence</h4>
                      <ul className="text-[10px] font-black text-indigo-700/70 space-y-2 tracking-widest leading-loose">
                        <li className="flex items-center gap-2 underline decoration-indigo-200">SPECIFY TARGET AUDIENCE METRICS</li>
                        <li className="flex items-center gap-2 underline decoration-indigo-200">DEFINE SEMANTIC TONE PARAMETERS</li>
                        <li className="flex items-center gap-2 underline decoration-indigo-200">AUGMENT WITH KEYWORD CLUSTERS</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Output Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-2xl p-10 min-h-[700px] flex flex-col relative group">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    Synthesized Intelligence
                  </h3>
                  {generatedContent && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCopy}
                        className="p-4 bg-gray-50 hover:bg-purple-600 hover:text-white rounded-2xl transition-all duration-300 group/btn cursor-pointer"
                        title="Mirror to clipboard"
                      >
                        <Copy className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-4 bg-gray-50 hover:bg-purple-600 hover:text-white rounded-2xl transition-all duration-300 group/btn cursor-pointer"
                        title="Extract data package"
                      >
                        <Download className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-6">
                      <div className="relative">
                        <div className="w-24 h-24 border-8 border-purple-50 border-t-purple-600 rounded-full animate-spin shadow-xl" />
                        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                          <Sparkles className="w-10 h-10 text-purple-600" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-gray-900 tracking-tight">Processing Forge...</p>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Initializing Neural Synthesis</p>
                      </div>
                    </div>
                  ) : generatedContent ? (
                    <div className="prose prose-lg max-w-none">
                      <div className="text-gray-800 font-medium leading-relaxed whitespace-pre-wrap selection:bg-purple-100 p-6 bg-gray-50/30 rounded-3xl border border-gray-100">
                        {generatedContent}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-12 space-y-8 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000">
                      <div className="p-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-[3rem] shadow-inner relative">
                        <div className="absolute inset-0 bg-purple-400/20 blur-3xl rounded-full" />
                        <Wand2 className="w-20 h-20 text-purple-600 relative z-10" />
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-2xl font-black text-gray-900 tracking-tight">Intelligence Ready</h4>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
                          Populate the operational parameters to initiate neural synthesis and forge your asset.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Quality Indicators */}
                {generatedContent && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[2rem] p-8 border border-green-100/50 shadow-sm relative overflow-hidden">
                      <div className="absolute top-[-20px] right-[-20px] p-4 opacity-5">
                        <Check className="w-40 h-40 text-green-600 font-black" />
                      </div>
                      <h4 className="text-xs font-black text-green-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <div className="p-1 bg-green-200 rounded-full">
                          <Check className="w-3 h-3 text-green-800" />
                        </div>
                        Quality Assurance Metrics
                      </h4>
                      <div className="grid grid-cols-3 gap-8">
                        <div className="space-y-1">
                          <div className="text-4xl font-black text-green-900 tracking-tighter">95%</div>
                          <div className="text-[10px] font-black text-green-600 uppercase tracking-widest">Readability</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-4xl font-black text-green-900 tracking-tighter">A+</div>
                          <div className="text-[10px] font-black text-green-600 uppercase tracking-widest">SEO Score</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-4xl font-black text-green-900 tracking-tighter">98%</div>
                          <div className="text-[10px] font-black text-green-600 uppercase tracking-widest">Originality</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}
