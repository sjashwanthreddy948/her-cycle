import { PhaseInfo, CyclePhase } from '../types/cycle';
import { SymptomDefinition, PermissionKey, SharingPermissionsMap } from '../types/database';

export const SYMPTOMS_LIST: SymptomDefinition[] = [
  { id: 'cramps', name: 'Cramps', icon: '⚡', category: 'physical', description: 'Lower abdominal tightening or aching' },
  { id: 'headache', name: 'Headache', icon: '🤕', category: 'physical', description: 'Tension or hormonal migraine' },
  { id: 'bloating', name: 'Bloating', icon: '🎈', category: 'digestive', description: 'Abdominal water retention or fullness' },
  { id: 'fatigue', name: 'Fatigue', icon: '😴', category: 'sleep', description: 'Feeling sluggish or physically tired' },
  { id: 'breast_tenderness', name: 'Breast Tenderness', icon: '🌸', category: 'physical', description: 'Sensitivity or swelling' },
  { id: 'back_pain', name: 'Back Pain', icon: '🦴', category: 'physical', description: 'Lower back tension or dull ache' },
  { id: 'acne', name: 'Skin Flare-up', icon: '✨', category: 'physical', description: 'Hormonal breakout or oiliness' },
  { id: 'mood_changes', name: 'Mood Swings', icon: '🎭', category: 'emotional', description: 'Shifting emotions or heightened sensitivity' },
  { id: 'insomnia', name: 'Insomnia', icon: '🌙', category: 'sleep', description: 'Difficulty falling or staying asleep' },
  { id: 'nausea', name: 'Nausea', icon: '🤢', category: 'digestive', description: 'Stomach unease or mild nausea' },
  { id: 'cravings', name: 'Cravings', icon: '🍫', category: 'digestive', description: 'Strong desire for sweet or salty foods' },
  { id: 'brain_fog', name: 'Brain Fog', icon: '💭', category: 'emotional', description: 'Reduced concentration or clarity' },
];

export const CYCLE_PHASES_DATA: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    id: 'menstrual',
    name: 'Menstrual Phase',
    tagline: 'Time to rest, replenish and restore',
    cyclePosition: 'Days 1 – 5',
    color: '#F43F5E',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700',
    description: 'The uterine lining sheds as estrogen and progesterone reach their monthly baseline. Your body directs energy inward toward cellular recovery.',
    hormoneSummary: 'Low estrogen & progesterone. Endorphins are gentle; your immune system welcomes restorative care.',
    wellnessSuggestions: {
      nutrition: 'Warm iron-rich foods, bone broth, lentil soups, dark chocolate, and hydration with electrolytes.',
      exercise: 'Gentle walking, restorative yin yoga, stretching, and guilt-free restful lounging.',
      selfCare: 'Warm heating pad on pelvis, chamomile tea, early bedtime, cozy socks, and slow mornings.'
    },
    partnerTips: [
      'Bring her a warm water bottle or heating pad without having to be asked.',
      'Prepare nourishing warm meals and make sure her favorite soothing tea or treat is stocked.',
      'Take over heavier household chores so she can rest guilt-free.',
      'Be gentle, patient, and listen with empathy rather than trying to "fix" her physical feelings.'
    ]
  },
  follicular: {
    id: 'follicular',
    name: 'Follicular Phase',
    tagline: 'Renewed vitality, clarity and creative drive',
    cyclePosition: 'Days 6 – 13',
    color: '#EC4899',
    badgeBg: 'bg-pink-100',
    badgeText: 'text-pink-700',
    description: 'Follicle-stimulating hormone (FSH) prompts ovaries to develop eggs while estrogen builds steadily, boosting neurochemistry and muscle tone.',
    hormoneSummary: 'Estrogen is climbing. Dopamine and serotonin are elevated, bringing sharp mental clarity and positive outlook.',
    wellnessSuggestions: {
      nutrition: 'Fermented foods (sauerkraut, yogurt), fresh citrus, vibrant salads, and lean proteins for cellular synthesis.',
      exercise: 'Cardio, strength training, dance, and brisk outdoor hikes. Your endurance is naturally higher.',
      selfCare: 'Kickstart new projects, brainstorm creative goals, plan social catch-ups with dear friends.'
    },
    partnerTips: [
      'Encourage her fresh ideas and collaborate on fun plans or trips together.',
      'Plan an engaging date night or an active outdoor walk.',
      'Match her upbeat energy and celebrate her creative projects.'
    ]
  },
  ovulation: {
    id: 'ovulation',
    name: 'Ovulation Phase',
    tagline: 'Peak confidence, radiance and connection',
    cyclePosition: 'Days 14 – 16',
    color: '#F59E0B',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    description: 'A surge in Luteinizing Hormone (LH) triggers the release of an egg from the ovary. Estrogen reaches its monthly pinnacle.',
    hormoneSummary: 'Peak estrogen and a light surge of testosterone. Communication, verbal memory, and physical magnetism are at their height.',
    wellnessSuggestions: {
      nutrition: 'Anti-inflammatory foods, leafy greens, berries, flaxseeds, and plenty of refreshing water.',
      exercise: 'High-intensity interval training (HIIT), heavy lifting, spin class, or social group sports.',
      selfCare: 'Important conversations, negotiations, social events, date nights, and personal expression.'
    },
    partnerTips: [
      'She is often feeling confident and energetic—plan something special and memorable.',
      'Compliment her radiance and express your affection warmly.',
      'Enjoy meaningful conversation and quality time together.'
    ]
  },
  luteal: {
    id: 'luteal',
    name: 'Luteal Phase',
    tagline: 'Winding down, nestling in and preparing',
    cyclePosition: 'Days 17 – 28',
    color: '#8B5CF6',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    description: 'Progesterone becomes the dominant hormone, warming basal body temperature and calming the nervous system. Toward the end, hormone drop may trigger PMS.',
    hormoneSummary: 'Progesterone peaks, then begins tapering. Metabolism is slightly elevated; sensory sensitivity increases.',
    wellnessSuggestions: {
      nutrition: 'Roasted root vegetables, sweet potatoes, magnesium-rich pumpkin seeds, quinoa, and dark leafy greens.',
      exercise: 'Moderate pilates, steady-state swimming, light resistance work, or nature strolls.',
      selfCare: 'Journaling, tidy organization, cozy ambient lighting, relaxing baths with Epsom salts, saying no to stressful extra commitments.'
    },
    partnerTips: [
      'Her sensory sensitivity may be heightened; create a calm, peaceful atmosphere at home.',
      'Offer comforting snacks like dark chocolate, warm soups, or fresh fruit smoothies.',
      'Give her emotional breathing space and reassuring affection if she feels overwhelmed.',
      'Avoid initiating high-stress debates or questioning sudden changes in her energy.'
    ]
  }
};

export const SHARING_PRESETS: {
  id: 'basic' | 'standard' | 'custom';
  name: string;
  description: string;
  permissions: SharingPermissionsMap;
}[] = [
  {
    id: 'basic',
    name: 'Basic Support',
    description: 'Shares only the general cycle phase and cycle day so your partner understands your schedule.',
    permissions: {
      cycle_phase: true,
      cycle_day: true,
      period_status: true,
      estimated_next_period: false,
      mood: false,
      energy: false,
      symptoms: false,
      flow: false,
      sleep: false,
      notes: false,
      weight: false,
    }
  },
  {
    id: 'standard',
    name: 'Standard Care',
    description: 'Shares cycle phase, day, period status, upcoming estimates, mood, and energy for proactive support.',
    permissions: {
      cycle_phase: true,
      cycle_day: true,
      period_status: true,
      estimated_next_period: true,
      mood: true,
      energy: true,
      symptoms: false,
      flow: false,
      sleep: false,
      notes: false,
      weight: false,
    }
  },
  {
    id: 'custom',
    name: 'Custom Controls',
    description: 'Hand-pick exactly which health fields your partner is permitted to view.',
    permissions: {
      cycle_phase: true,
      cycle_day: true,
      period_status: true,
      estimated_next_period: true,
      mood: true,
      energy: true,
      symptoms: true,
      flow: true,
      sleep: false,
      notes: false,
      weight: false,
    }
  }
];

export const PERMISSION_DESCRIPTIONS: Record<PermissionKey, { title: string; desc: string; icon: string; defaultShared: boolean }> = {
  cycle_phase: {
    title: 'Current Cycle Phase',
    desc: 'Menstrual, Follicular, Ovulation, or Luteal phase name',
    icon: '🌸',
    defaultShared: true,
  },
  cycle_day: {
    title: 'Current Cycle Day',
    desc: 'Day number within the current cycle (e.g. Day 12)',
    icon: '📅',
    defaultShared: true,
  },
  period_status: {
    title: 'Period Status',
    desc: 'Whether you are currently on your period or not',
    icon: '🩸',
    defaultShared: true,
  },
  estimated_next_period: {
    title: 'Estimated Next Period',
    desc: 'Estimated arrival countdown in days',
    icon: '⏳',
    defaultShared: true,
  },
  mood: {
    title: 'Daily Mood',
    desc: 'Your logged mood rating (Great, Good, Low, etc.)',
    icon: '😊',
    defaultShared: true,
  },
  energy: {
    title: 'Energy Level',
    desc: 'Your logged energy (Low, Medium, High)',
    icon: '⚡',
    defaultShared: true,
  },
  symptoms: {
    title: 'Logged Symptoms',
    desc: 'General symptoms like cramps or headache',
    icon: '🩺',
    defaultShared: false,
  },
  flow: {
    title: 'Flow Intensity',
    desc: 'Light, medium, or heavy flow indicator',
    icon: '💧',
    defaultShared: false,
  },
  sleep: {
    title: 'Sleep Duration',
    desc: 'Number of hours slept',
    icon: '🌙',
    defaultShared: false,
  },
  notes: {
    title: 'Personal Log Notes',
    desc: 'Private diary and reflections (Off by default)',
    icon: '📝',
    defaultShared: false,
  },
  weight: {
    title: 'Body Weight',
    desc: 'Logged weight numbers (Off by default)',
    icon: '⚖️',
    defaultShared: false,
  },
};

export const MEDICAL_DISCLAIMER_TEXT = 
  "HerCycle provides tracking and estimates based on information you enter. It is not a medical device and should not be used to diagnose conditions or as a method of contraception. For medical concerns, consult a qualified healthcare professional.";
