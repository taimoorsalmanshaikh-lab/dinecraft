/**
 * Generates consistent Google/Gmail-style background and text color pairs
 * based on the customer's name so their initial avatar is vibrant and predictable.
 */
export function getAvatarColor(name?: string): { bg: string; text: string; className: string } {
  const palettes = [
    { bg: '#1A73E8', text: '#FFFFFF', className: 'bg-[#1A73E8] text-white' }, // Google Blue
    { bg: '#EA4335', text: '#FFFFFF', className: 'bg-[#EA4335] text-white' }, // Google Red
    { bg: '#34A853', text: '#FFFFFF', className: 'bg-[#34A853] text-white' }, // Google Green
    { bg: '#F29900', text: '#FFFFFF', className: 'bg-[#F29900] text-white' }, // Warm Amber
    { bg: '#FF6900', text: '#FFFFFF', className: 'bg-[#FF6900] text-white' }, // DineCraft Orange
    { bg: '#8E24AA', text: '#FFFFFF', className: 'bg-[#8E24AA] text-white' }, // Purple
    { bg: '#00897B', text: '#FFFFFF', className: 'bg-[#00897B] text-white' }, // Teal
    { bg: '#3949AB', text: '#FFFFFF', className: 'bg-[#3949AB] text-white' }, // Indigo
    { bg: '#D81B60', text: '#FFFFFF', className: 'bg-[#D81B60] text-white' }, // Deep Pink
    { bg: '#0288D1', text: '#FFFFFF', className: 'bg-[#0288D1] text-white' }, // Light Blue
  ];

  if (!name || typeof name !== 'string') {
    return palettes[4];
  }

  let hash = 0;
  const clean = name.trim().toLowerCase();
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

export function getInitial(name?: string): string {
  if (!name || typeof name !== 'string') return 'C';
  const clean = name.trim();
  return clean.length > 0 ? clean.charAt(0).toUpperCase() : 'C';
}
