import React from 'react';
import type { AiLawyerPersona } from './types';
import { ScaleIcon, LightBulbIcon, ShieldCheckIcon, UserGroupIcon, ExclamationIcon, SearchIcon, MicroscopeIcon, ClipboardCheckIcon } from './components/icons';

export const AI_LAWYERS: Omit<AiLawyerPersona, 'title' | 'description'>[] = [
  {
    name: "Qonun Ustuvori",
    icon: <ScaleIcon />,
    bgColor: "bg-cyan-500/10",
    textColor: "text-cyan-300",
    glowColor: "shadow-cyan-500/50",
  },
  {
    name: "Strateg",
    icon: <LightBulbIcon />,
    bgColor: "bg-lime-500/10",
    textColor: "text-lime-300",
    glowColor: "shadow-lime-500/50",
  },
  {
    name: "Advokat Himoyachi",
    icon: <ShieldCheckIcon />,
    bgColor: "bg-magenta-500/10",
    textColor: "text-magenta-300",
    glowColor: "shadow-magenta-500/50",
  },
  {
    name: "Prokuror",
    icon: <ExclamationIcon />,
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-300",
    glowColor: "shadow-orange-500/50",
  },
  {
    name: "Inson Huquqlari",
    icon: <UserGroupIcon />,
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-300",
    glowColor: "shadow-purple-500/50",
  },
  {
    name: "Sudya",
    icon: <ScaleIcon />,
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-300",
    glowColor: "shadow-yellow-500/50",
  },
];

export const AI_INVESTIGATORS: Omit<AiLawyerPersona, 'title' | 'description'>[] = [
  {
    name: "Tergovchi",
    icon: <SearchIcon />,
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-300",
    glowColor: "shadow-blue-500/50",
  },
  {
    name: "Prokuror",
    icon: <ExclamationIcon />,
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-300",
    glowColor: "shadow-orange-500/50",
  },
  {
    name: "Himoyachi",
    icon: <ShieldCheckIcon />,
    bgColor: "bg-magenta-500/10",
    textColor: "text-magenta-300",
    glowColor: "shadow-magenta-500/50",
  },
  {
    name: "Ekspert-Kriminalist",
    icon: <MicroscopeIcon />,
    bgColor: "bg-teal-500/10",
    textColor: "text-teal-300",
    glowColor: "shadow-teal-500/50",
  },
  {
    name: "Protsessual Nazoratchi",
    icon: <ClipboardCheckIcon />,
    bgColor: "bg-gray-500/10",
    textColor: "text-gray-300",
    glowColor: "shadow-gray-500/50",
  },
];