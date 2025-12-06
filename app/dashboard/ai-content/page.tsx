"use client";

import React, { useState } from 'react';
import { 
  Sparkles, Copy, Download, RefreshCw, Wand2, FileText, Mail, 
  MessageSquare, ShoppingBag, Megaphone, BookOpen, Video, 
  Briefcase, TrendingUp, Heart, Code, Lightbulb, Check, X,
  ChevronRight, Star, Zap, Target, Users, Globe
} from 'lucide-react';

interface ContentTemplate {
  id: string;
  name: string;
  icon: any;
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
      const mockContent = `# Generated ${selectedTemplate?.name}\n\nThis is a sample generated content based on your inputs:\n\n${Object.entries(formData).map(([key, value]) => `**${key}**: ${value}`).join('\n')}\n\n[Your AI-generated content would appear here with full formatting, engaging copy, and professional structure based on the template and inputs provided.]`;
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
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            AI Content Studio
          </h1>
          <p className="text-gray-600 mt-2">Create professional content in seconds with AI-powered generation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">{history.length} Generated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeCategory === category
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {!selectedTemplate ? (
        <>
          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-transparent hover:shadow-2xl transition-all duration-300 text-left overflow-hidden"
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className="relative">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${template.gradient} mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600">
                      {template.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">{template.category}</span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">12 Templates</h3>
              </div>
              <p className="text-sm text-gray-600">Professional content types ready to use</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">AI-Powered</h3>
              </div>
              <p className="text-sm text-gray-600">Advanced language models for quality content</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Instant Results</h3>
              </div>
              <p className="text-sm text-gray-600">Generate content in seconds, not hours</p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Back Button */}
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setFormData({});
              setGeneratedContent('');
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <X className="w-5 h-5" />
            Back to Templates
          </button>

          {/* Content Generation Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  {React.createElement(selectedTemplate.icon, { className: `w-6 h-6 text-purple-600` })}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                    <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedTemplate.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {field.label}
                      </label>
                      {field.type === 'text' && (
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      )}
                      {field.type === 'textarea' && (
                        <textarea
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                        />
                      )}
                      {field.type === 'select' && (
                        <select
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select an option...</option>
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
                  className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Generate Content
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Tips */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Pro Tips</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Be specific with your inputs for better results</li>
                        <li>• Include target audience details</li>
                        <li>• Mention desired tone and style</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Output Panel */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 min-h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Generated Content
                  </h3>
                  {generatedContent && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        title="Download as file"
                      >
                        <Download className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        title="Regenerate"
                      >
                        <RefreshCw className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                        <Sparkles className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-gray-600 font-medium">Crafting your content...</p>
                      <p className="text-sm text-gray-500">This usually takes a few seconds</p>
                    </div>
                  ) : generatedContent ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {generatedContent}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                      <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                        <Wand2 className="w-12 h-12 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Ready to Create</h4>
                        <p className="text-sm text-gray-600">Fill in the fields and click Generate to create your content</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Quality Indicators */}
              {generatedContent && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Content Quality
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">95%</div>
                      <div className="text-xs text-green-600">Readability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">A+</div>
                      <div className="text-xs text-green-600">SEO Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">98%</div>
                      <div className="text-xs text-green-600">Originality</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
