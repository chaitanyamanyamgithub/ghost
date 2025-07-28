"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  User,
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  Eye,
  X,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  content: string;
  tags: string[];
  views?: number;
  likes?: number;
  comments?: number;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "GPT-4o vs Claude 3.5: The Ultimate AI Showdown of 2024",
    description: "A comprehensive comparison of the latest AI models from OpenAI and Anthropic, analyzing their capabilities, strengths, and real-world applications.",
    image: "https://picsum.photos/800/400?random=1",
    category: "AI Models",
    date: "December 15, 2024",
    readTime: "8 min read",
    author: "Dr. Sarah Chen",
    views: 15420,
    likes: 89,
    comments: 23,
    tags: ["GPT-4", "Claude", "LLM", "Comparison"],
    content: `The AI landscape has witnessed unprecedented growth in 2024, with two models standing out as clear frontrunners: OpenAI's GPT-4o and Anthropic's Claude 3.5 Sonnet.

## Performance Benchmarks

### Reasoning and Logic
Claude 3.5 Sonnet has shown remarkable improvements in mathematical reasoning and complex problem-solving. In our comprehensive testing suite, it consistently outperformed GPT-4o in multi-step logical puzzles and mathematical proofs.

**Key Findings:**
• Claude 3.5: 94% accuracy on MATH benchmark
• GPT-4o: 88% accuracy on MATH benchmark
• Claude 3.5: Superior code debugging capabilities
• GPT-4o: Better creative writing and storytelling

### Real-World Applications

**Enterprise Adoption:**
1. Customer Service Automation - 40% reduction in response times
2. Content Generation - 60% faster marketing copy creation
3. Data Analysis - Complex report generation in minutes
4. Decision Support - Strategic planning assistance

### The Verdict
While both models are exceptional, the choice depends on your specific needs:

**Choose Claude 3.5 for:**
• Analytical tasks and complex reasoning
• Code development and debugging
• Safety-critical applications
• Mathematical and scientific work

**Choose GPT-4o for:**
• Creative work and content generation
• Conversational AI applications
• Multimodal tasks (text + images)
• General-purpose applications

The future looks bright for AI development, with both companies pushing the boundaries of what's possible in artificial intelligence.`
  },
  {
    id: "2",
    title: "OpenAI's Sora: Revolutionizing Video Generation with AI",
    description: "Explore how Sora is transforming video content creation, from Hollywood studios to independent creators.",
    image: "https://picsum.photos/800/400?random=2",
    category: "Generative AI",
    date: "December 12, 2024",
    readTime: "6 min read",
    author: "Alex Rodriguez",
    views: 12890,
    likes: 156,
    comments: 34,
    tags: ["Sora", "Video AI", "OpenAI", "Content Creation"],
    content: `OpenAI's Sora has emerged as a revolutionary force in video generation, capable of creating stunning, photorealistic videos from simple text prompts.

## Technical Breakthrough
Sora represents a significant leap in diffusion transformer models, capable of generating videos up to 60 seconds long while maintaining temporal consistency and visual quality.

### Key Capabilities:
• Resolution: Up to 1080p HD quality
• Duration: 60-second videos with consistent narrative flow
• Consistency: Maintains character and scene continuity
• Physics: Understands real-world physics and realistic motion

## Industry Impact

### Hollywood and Film Production
Major studios are experimenting with Sora for:
• Concept visualization and storyboarding
• Background plate generation
• Cost reduction in expensive shoots
• Rapid prototyping of scenes

### Content Creation Revolution
Independent creators are leveraging Sora for:
• Social media content production
• Educational video creation
• Marketing material development
• Product demonstrations

## Future Implications
Sora is democratizing video production by lowering barriers to entry for creators and reducing production costs significantly.

The future of video content creation is here, and it's more exciting than we ever imagined.`
  },
  {
    id: "3",
    title: "Quantum Computing Meets AI: IBM's Roadmap to Quantum Advantage",
    description: "IBM's latest quantum processors are showing promising results for machine learning applications.",
    image: "https://picsum.photos/800/400?random=3",
    category: "Quantum AI",
    date: "December 10, 2024",
    readTime: "10 min read",
    author: "Dr. Maria Petrov",
    views: 8760,
    likes: 67,
    comments: 15,
    tags: ["Quantum Computing", "IBM", "Machine Learning", "Future Tech"],
    content: `The convergence of quantum computing and artificial intelligence represents one of the most exciting frontiers in technology.

## Current State of Quantum AI

### Hardware Advances
IBM's newest quantum processors feature:
• 1,121 qubits in their Condor chip
• 10x reduction in quantum errors
• 100+ microsecond coherence times
• Enhanced qubit interactions

### Software Ecosystem
The quantum software stack includes:
• Qiskit Framework for development
• Extensive algorithm library
• Cloud-based quantum computing access
• Integration with classical ML frameworks

## Applications in Machine Learning

### Optimization Problems
Quantum computers excel at solving complex optimization problems:
• Portfolio optimization in finance
• Route optimization in logistics
• Hyperparameter tuning for neural networks
• Feature selection in large datasets

### Real-World Impact
• Drug Discovery: Protein folding prediction with unprecedented accuracy
• Financial Modeling: Real-time portfolio risk calculation
• Materials Science: Next-generation battery materials

## The Road Ahead
The next 5 years will be crucial for quantum AI, with potential breakthroughs in drug discovery, financial modeling, and materials science.

The quantum-AI revolution is just beginning, and those who prepare today will lead tomorrow's breakthroughs.`
  },
  {
    id: "4",
    title: "The Rise of AI Agents: Autonomous Systems Reshaping Business",
    description: "From customer service to software development, AI agents are becoming increasingly sophisticated.",
    image: "https://picsum.photos/800/400?random=4",
    category: "AI Agents",
    date: "December 8, 2024",
    readTime: "7 min read",
    author: "James Liu",
    views: 11230,
    likes: 94,
    comments: 28,
    tags: ["AI Agents", "Automation", "Business", "Productivity"],
    content: `AI agents are rapidly evolving from simple chatbots to sophisticated autonomous systems capable of complex reasoning, planning, and execution.

## What Are AI Agents?
AI agents are autonomous systems that can:
• Perceive their environment through various inputs
• Reason about goals and constraints
• Plan sequences of actions to achieve objectives
• Execute tasks with minimal human oversight
• Learn from experience to improve performance

## Current Capabilities

### Customer Service Revolution
Modern AI agents achieve:
• 70% reduction in average response time
• 40% increase in customer satisfaction scores
• 85% first-contact resolution rate
• 60% reduction in support costs

### Software Development
AI coding agents are transforming development:
• 50% faster development cycles
• 30% reduction in bugs reaching production
• 70% improvement in code consistency
• 40% decrease in security vulnerabilities

### Business Process Automation
Enterprise AI agents are automating:
• Invoice processing and accounts payable
• Resume screening and candidate evaluation
• Inventory optimization and demand forecasting
• Lead qualification and scoring

## Leading Platforms
• OpenAI's GPTs and Assistants API
• Anthropic's Claude with Computer Use
• Microsoft Copilot Studio

## Future Outlook
The age of AI agents is upon us, and organizations that embrace this technology will gain significant competitive advantages.

Are you ready to join the AI agent revolution?`
  },
  {
    id: "5",
    title: "Multimodal AI: When Vision, Language, and Audio Converge",
    description: "The latest multimodal AI models can see, hear, and speak. Discover how this convergence is creating more natural AI interactions.",
    image: "https://picsum.photos/800/400?random=5",
    category: "Multimodal AI",
    date: "December 5, 2024",
    readTime: "9 min read",
    author: "Dr. Emily Watson",
    views: 9540,
    likes: 112,
    comments: 19,
    tags: ["Multimodal", "Computer Vision", "NLP", "Audio AI"],
    content: `The future of artificial intelligence lies in the seamless integration of multiple modalities. Today's multimodal AI systems can simultaneously process text, images, audio, and video.

## The Multimodal Breakthrough
Traditional AI systems were limited to single modalities. Multimodal AI breaks these barriers by:
• Correlating information across different input types
• Understanding relationships between visual and textual content
• Interpreting audio in context of visual scenes
• Generating coherent outputs that combine multiple modalities

## Leading Multimodal Models

### GPT-4 Vision (GPT-4V)
OpenAI's multimodal flagship offers:
• Advanced image analysis and interpretation
• Chart and graph reading
• Document processing and OCR
• Spatial reasoning and object relationships

### Google's Gemini Ultra
Google's native multimodal approach includes:
• Trained multimodally from the ground up
• Superior cross-modal understanding
• Leading vision benchmark scores
• Advanced video understanding

### Anthropic's Claude 3
Claude's multimodal features emphasize:
• Detailed image analysis and description
• Document understanding and summarization
• Visual reasoning and problem-solving
• Built-in content filtering and safety

## Real-World Applications

### Healthcare and Medical Imaging
• Radiology image analysis with clinical context
• Pathology slide interpretation
• Integration of patient history with imaging
• Multi-modal symptom assessment

### Education and Learning
• Personalized tutoring across modalities
• Visual, auditory, and textual explanations
• Real-time comprehension assessment
• Accessibility tools and conversions

### Creative Industries
• Coordinated text, image, and audio generation
• Brand-consistent multi-channel campaigns
• Interactive storytelling experiences
• Multi-sensory brand experiences

## The Future Landscape
The convergence of vision, language, and audio represents a fundamental shift toward more natural human-computer interaction.

The multimodal revolution is not just about better AI—it's about creating technology that understands the world the way humans do.`
  },
  {
    id: "6",
    title: "AI Safety and Alignment: Building Trustworthy Artificial Intelligence",
    description: "As AI systems become more powerful, ensuring their safety and alignment with human values becomes critical.",
    image: "https://picsum.photos/800/400?random=6",
    category: "AI Safety",
    date: "December 3, 2024",
    readTime: "12 min read",
    author: "Dr. Michael Zhang",
    views: 7340,
    likes: 89,
    comments: 31,
    tags: ["AI Safety", "Alignment", "Ethics", "Governance"],
    content: `As artificial intelligence systems become increasingly powerful and autonomous, ensuring they remain safe, beneficial, and aligned with human values has become critical.

## Understanding AI Safety
AI safety encompasses several key areas:
• Robustness: Systems perform reliably across diverse conditions
• Interpretability: Understanding how AI systems make decisions
• Alignment: Ensuring AI goals match human intentions
• Control: Maintaining human oversight and intervention capabilities

## Current Safety Research

### Anthropic's Constitutional AI
Anthropic has pioneered groundbreaking approaches:
• Training models to follow ethical principles
• Self-correction mechanisms for harmful outputs
• Iterative refinement through constitutional feedback
• Scalable oversight through AI assistance

### OpenAI's Safety Frameworks
OpenAI has developed comprehensive safety measures:
• Red teaming programs for vulnerability testing
• Staged deployment with safety checkpoints
• Rigorous testing before public release
• Clear guidelines for acceptable use

### DeepMind's Approach
Google DeepMind focuses on fundamental safety research:
• Mathematical proofs of safety properties
• Learning human preferences through feedback
• Multi-agent safety coordination
• Long-term AGI safety research

## Technical Safety Measures

### Alignment Techniques
• Reinforcement Learning from Human Feedback (RLHF)
• Constitutional AI methods
• Interpretability research
• Value learning and preference modeling

### Governance and Regulation
• European Union AI Act
• US AI Risk Management Framework
• UK AI Safety Institute
• UN AI Advisory Body

## Challenges and Future Directions
• Specification gaming and mesa-optimization
• Distributional shift and emergent capabilities
• Rapid technological change outpacing regulation
• Global coordination and cooperation needs

## Building a Safer AI Future
The stakes for AI safety could not be higher. The decisions we make today will determine whether AI benefits all of humanity or poses risks to our future.

The time for action is now. Every stakeholder has a role to play in building a safer AI future.`
  }
];

export default function BlogView() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePostClick = useCallback((post: BlogPost) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedPost(null), 200);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDialogOpen) {
        handleCloseDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialogOpen, handleCloseDialog]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg mb-4 max-w-md mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded-lg mb-8 max-w-2xl mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-10">
        {/* Compact Header Section */}
        <div className="text-center mb-8 space-y-0">
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            Latest AI Insights & Analysis
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight pt-2 pb-1">
            TechPulse
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Exploring the cutting edge of artificial intelligence, machine learning, and emerging technologies
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["AI Models", "Generative AI", "Quantum AI", "AI Safety", "Multimodal AI"].map((tag) => (
              <Badge key={tag} variant="secondary" className="px-3 py-1 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid - Moved up closer to header */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {blogPosts.map((post, index) => (
            <Card 
              key={post.id} 
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm cursor-pointer transform hover:-translate-y-2"
              onClick={() => handlePostClick(post)}
            >
              <CardHeader className="p-0">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/90 text-gray-800 hover:bg-white font-medium shadow-lg text-xs">
                      {post.category}
                    </Badge>
                  </div>
                  
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/90 text-xs bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{post.author}</span>
                  </div>
                  <span>{post.date}</span>
                </div>
                
                <CardTitle className="text-lg font-bold leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
                
                <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {post.description}
                </CardDescription>
                
                <div className="flex flex-wrap gap-1 pt-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{post.views?.toLocaleString() || '1.2k'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{post.likes || Math.floor(Math.random() * 100) + 20}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{post.comments || Math.floor(Math.random() * 20) + 5}</span>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 h-6 px-2 text-xs">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Read
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Compact Featured Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Stay Updated with AI Trends
          </h2>
          <p className="text-base text-muted-foreground mb-6 max-w-xl mx-auto">
            Get the latest insights on artificial intelligence and emerging technologies delivered to your inbox.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="lg" className="px-6">
              Subscribe to Newsletter
            </Button>
            <Button variant="outline" size="lg" className="px-6">
              Follow on Twitter
            </Button>
          </div>
        </div>
      </div>

      {/* Blog Post Dialog - Unchanged */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl h-[95vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border shadow-2xl">
          {selectedPost && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <DialogHeader className="shrink-0 p-6 pb-4 border-b bg-white dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-4 flex-1 min-w-0">
                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {selectedPost.category}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{selectedPost.readTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Eye className="h-4 w-4" />
                        <span>{selectedPost.views?.toLocaleString()} views</span>
                      </div>
                    </div>
                    
                    <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight text-gray-900 dark:text-white">
                      {selectedPost.title}
                    </DialogTitle>
                    
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{selectedPost.author}</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{selectedPost.date}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-500">
                          <Heart className="h-4 w-4 mr-2" />
                          {selectedPost.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-500">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCloseDialog}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>
              </DialogHeader>
              
              {/* Hero Image */}
              <div className="relative h-80 mx-6 my-4 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              
              {/* Content */}
              <ScrollArea className="flex-1 min-h-0 px-6 pb-6">
                <div className="max-w-none">
                  <div className="prose prose-lg max-w-none text-gray-900 dark:text-gray-100">
                    {selectedPost.content.split('\n').map((paragraph, index) => {
                      if (paragraph.trim() === '') return <br key={index} />;
                      
                      if (paragraph.startsWith('## ')) {
                        return (
                          <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                            {paragraph.replace('## ', '')}
                          </h2>
                        );
                      }
                      
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">
                            {paragraph.replace('### ', '')}
                          </h3>
                        );
                      }
                      
                      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                        return (
                          <p key={index} className="font-semibold mb-3 text-gray-900 dark:text-white">
                            {paragraph.replace(/\*\*/g, '')}
                          </p>
                        );
                      }
                      
                      if (paragraph.startsWith('• ')) {
                        return (
                          <li key={index} className="mb-2 text-gray-700 dark:text-gray-300 list-disc ml-6">
                            {paragraph.replace('• ', '')}
                          </li>
                        );
                      }
                      
                      return (
                        <p key={index} className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPost.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">About the Author</h3>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shrink-0">
                          <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg text-gray-900 dark:text-white">{selectedPost.author}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            AI Researcher and Technology Writer
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Specializing in cutting-edge AI research, machine learning applications, 
                            and the societal implications of artificial intelligence.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center py-6">
                      <Button onClick={handleCloseDialog} size="lg" className="px-8">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Blog
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}