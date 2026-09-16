import React from 'react';
import { 
  Video, 
  Instagram, 
  Youtube, 
  Send, 
  Twitter, 
  Facebook, 
  Music2, 
  AtSign, 
  MessageSquare,
  Globe,
  Radio,
  Disc,
  Flame,
  AudioWaveform,
  Headphones
} from 'lucide-react';
import { PlatformType } from '../types';

interface PlatformIconProps {
  platform: PlatformType;
  className?: string;
  size?: number;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, className = 'w-4 h-4', size }) => {
  switch (platform) {
    case 'tiktok':
      return <Video className={`${className} text-cyan-400`} size={size} />;
    case 'instagram':
      return <Instagram className={`${className} text-pink-400`} size={size} />;
    case 'youtube':
      return <Youtube className={`${className} text-red-500`} size={size} />;
    case 'telegram':
      return <Send className={`${className} text-sky-400`} size={size} />;
    case 'twitter':
      return <Twitter className={`${className} text-slate-200`} size={size} />;
    case 'facebook':
      return <Facebook className={`${className} text-blue-500`} size={size} />;
    case 'spotify':
      return <Music2 className={`${className} text-emerald-400`} size={size} />;
    case 'applemusic':
      return <Headphones className={`${className} text-rose-500`} size={size} />;
    case 'audiomack':
      return <Flame className={`${className} text-amber-500 fill-amber-500/20`} size={size} />;
    case 'boomplay':
      return <Disc className={`${className} text-fuchsia-400`} size={size} />;
    case 'soundcloud':
      return <Radio className={`${className} text-orange-400`} size={size} />;
    case 'threads':
      return <AtSign className={`${className} text-slate-200`} size={size} />;
    case 'discord':
      return <MessageSquare className={`${className} text-indigo-400`} size={size} />;
    default:
      return <Globe className={`${className} text-blue-400`} size={size} />;
  }
};

export const getPlatformName = (platform: PlatformType): string => {
  switch (platform) {
    case 'tiktok': return 'TikTok';
    case 'instagram': return 'Instagram';
    case 'youtube': return 'YouTube';
    case 'telegram': return 'Telegram';
    case 'twitter': return 'X (Twitter)';
    case 'facebook': return 'Facebook';
    case 'spotify': return 'Spotify';
    case 'applemusic': return 'Apple Music';
    case 'audiomack': return 'Audiomack';
    case 'boomplay': return 'Boomplay';
    case 'soundcloud': return 'SoundCloud';
    case 'threads': return 'Threads';
    case 'discord': return 'Discord';
    default: return 'All Platforms';
  }
};
