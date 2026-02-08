// src/shared/components/Icons.tsx
import React from 'react';
import {
  Link,
  Link2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Plus,
  Minus,
  Settings,
  Home,
  Star,
  Crown,
  Sparkles,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
  Download,
  Upload,
  Copy,
  Trash2,
  Edit,
  Save,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Loader2,
  Newspaper,
  Code,
  ShoppingCart,
  Gamepad2,
  GraduationCap,
  Briefcase,
  Heart,
  Plane,
  Users,
  Globe,
  Smile,
  Meh,
  Frown,
  Shield,
  ShieldCheck,
  Zap,
  ZapOff,
  Brain,
  Clock,
  Timer,
  Lock,
  Unlock,
  Key,
  MessageCircle,
  Mail,
  Share2,
  Moon,
  Sun,
  Monitor,
  Palette,
  Sliders,
  ToggleLeft,
  ToggleRight,
  CircleDot,
  Layers,
  Tag,
  Bookmark,
  TrendingUp,
  BarChart3,
  Gauge,
  type LucideProps,
} from 'lucide-react';

// Re-export all icons
export {
  Link,
  Link2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Plus,
  Minus,
  Settings,
  Home,
  Star,
  Crown,
  Sparkles,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
  Download,
  Upload,
  Copy,
  Trash2,
  Edit,
  Save,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Loader2,
  Newspaper,
  Code,
  ShoppingCart,
  Gamepad2,
  GraduationCap,
  Briefcase,
  Heart,
  Plane,
  Users,
  Globe,
  Smile,
  Meh,
  Frown,
  Shield,
  ShieldCheck,
  Zap,
  ZapOff,
  Brain,
  Clock,
  Timer,
  Lock,
  Unlock,
  Key,
  MessageCircle,
  Mail,
  Share2,
  Moon,
  Sun,
  Monitor,
  Palette,
  Sliders,
  ToggleLeft,
  ToggleRight,
  CircleDot,
  Layers,
  Tag,
  Bookmark,
  TrendingUp,
  BarChart3,
  Gauge,
};

// Custom Link Preview Logo Icon
export const LinkPreviewLogo: React.FC<LucideProps> = (props) => (
  <svg 
    width={props.size || 24}
    height={props.size || 24}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

// Animated Loading Spinner
export const Spinner: React.FC<LucideProps> = (props) => (
  <Loader2 
    {...props} 
    style={{ 
      animation: 'spin 1s linear infinite',
      ...props.style 
    }} 
  />
);

// Category Icon Component
interface CategoryIconProps extends Omit<LucideProps, 'ref'> {
  category: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  size = 14, 
  ...props 
}) => {
  const iconProps = { size, ...props };
  
  switch (category) {
    case 'news':
      return <Newspaper {...iconProps} />;
    case 'tech':
      return <Code {...iconProps} />;
    case 'social':
      return <Users {...iconProps} />;
    case 'shopping':
      return <ShoppingCart {...iconProps} />;
    case 'entertainment':
      return <Gamepad2 {...iconProps} />;
    case 'education':
      return <GraduationCap {...iconProps} />;
    case 'business':
      return <Briefcase {...iconProps} />;
    case 'health':
      return <Heart {...iconProps} />;
    case 'travel':
      return <Plane {...iconProps} />;
    default:
      return <Globe {...iconProps} />;
  }
};

// Sentiment Icon Component
interface SentimentIconProps extends Omit<LucideProps, 'ref'> {
  sentiment: string;
}

export const SentimentIcon: React.FC<SentimentIconProps> = ({ 
  sentiment, 
  size = 14, 
  ...props 
}) => {
  const iconProps = { size, ...props };
  
  switch (sentiment) {
    case 'positive':
      return <Smile {...iconProps} />;
    case 'negative':
      return <Frown {...iconProps} />;
    case 'mixed':
      return <Meh {...iconProps} />;
    default:
      return <Meh {...iconProps} />;
  }
};