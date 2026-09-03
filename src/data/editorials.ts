import { EditorialStory } from '../types';

export const EDITORIAL_STORIES: EditorialStory[] = [
  {
    id: 'campaign-ss26',
    title: 'Silent Solitude: The SS26 Campaign',
    subtitle: 'A meditation on architectural form, tactile drape, and monochrome stillness.',
    heroImage: 'https://images.pexels.com/photos/18510948/pexels-photo-18510948.jpeg?auto=compress&cs=tinysrgb&w=3840',
    quote: 'True luxury does not announce itself. It is felt in the weight of double-faced cashmere and the unbroken line of bias-cut silk.',
    narrative: 'Shot on location against the brutalist modernist monoliths of the Mediterranean coast, the Spring/Summer collection investigates the dialogue between structured tailoring and fluid motion.',
    featuredProductIds: ['LX-WD-001', 'LX-WD-002', 'LX-TL-001', 'LX-BG-001'],
    hotspots: [
      {
        productId: 'LX-WD-001',
        x: 48,
        y: 35,
        label: 'Noir Column Dress — ₹12,500'
      },
      {
        productId: 'LX-WD-002',
        x: 52,
        y: 72,
        label: 'Noir Atelier Gown — ₹16,900'
      },
      {
        productId: 'LX-BG-001',
        x: 75,
        y: 60,
        label: 'Structured Noir Handbag — ₹8,900'
      }
    ]
  },
  {
    id: 'evening-atelier',
    title: 'The Evening Atelier: Fluid Sculpture',
    subtitle: 'Mulberry silks and hand-forged vermeil under twilight radiance.',
    heroImage: 'https://images.pexels.com/photos/13715552/pexels-photo-13715552.jpeg?auto=compress&cs=tinysrgb&w=3840',
    quote: 'A column dress should feel like a second skin that commands the entire room without a single embellishment.',
    narrative: 'Our eveningwear program rejects ostentation in favor of impeccable proportion, sensual weightlessness, and hand-finished French seams.',
    featuredProductIds: ['LX-WD-002', 'LX-WD-003', 'LX-NEW-003', 'LX-BG-002'],
    hotspots: [
      {
        productId: 'LX-WD-002',
        x: 50,
        y: 40,
        label: 'Noir Atelier Gown — ₹16,900'
      },
      {
        productId: 'LX-WD-003',
        x: 65,
        y: 45,
        label: 'Rouge Sculpt Dress — ₹14,500'
      },
      {
        productId: 'LX-BG-002',
        x: 35,
        y: 70,
        label: 'Noir & Rouge Bag — ₹9,500'
      }
    ]
  },
  {
    id: 'crimson-solstice',
    title: 'Rouge Vernissage: The Crimson Solstice',
    subtitle: 'Sculptural cady and bias-cut silks in commanding vermilion.',
    heroImage: 'https://images.pexels.com/photos/13690142/pexels-photo-13690142.jpeg?auto=compress&cs=tinysrgb&w=3840',
    quote: 'Color is not decoration; it is emotional architecture. Crimson speaks with unmistakable authority.',
    narrative: 'Tailored for opening nights and celebratory galas, this capsule marries structural boning with effortless, flowing hems in rich Venetian scarlet.',
    featuredProductIds: ['LX-WD-003', 'LX-WD-004', 'LX-WD-005', 'LX-NEW-005'],
    hotspots: [
      {
        productId: 'LX-WD-003',
        x: 50,
        y: 35,
        label: 'Rouge Sculpt Dress — ₹14,500'
      },
      {
        productId: 'LX-WD-004',
        x: 60,
        y: 65,
        label: 'Rouge Draped Dress — ₹11,900'
      },
      {
        productId: 'LX-WD-005',
        x: 30,
        y: 50,
        label: 'Rouge Studio Gown — ₹18,500'
      }
    ]
  },
  {
    id: 'luminous-silk',
    title: 'Luminous Drape: Ivory & Champagne Silk',
    subtitle: 'Hand-loomed Mulberry silk satin capturing ambient candlelight.',
    heroImage: 'https://images.pexels.com/photos/19605422/pexels-photo-19605422.jpeg?auto=compress&cs=tinysrgb&w=3840',
    quote: 'Silk should move like water over marble. Unforced, luminous, and completely unforgettable.',
    narrative: 'Crafted from 32-momme pure Mulberry silk, each gown is cut on the true bias to cascade naturally across the silhouette with pearl button accents.',
    featuredProductIds: ['LX-NEW-001', 'LX-NEW-003', 'LX-NEW-006', 'LX-WT-001'],
    hotspots: [
      {
        productId: 'LX-NEW-003',
        x: 52,
        y: 40,
        label: 'Ivory Pearl Gown — ₹18,900'
      },
      {
        productId: 'LX-NEW-006',
        x: 70,
        y: 55,
        label: 'Champagne Silk Dress — ₹17,900'
      },
      {
        productId: 'LX-NEW-001',
        x: 35,
        y: 45,
        label: 'Noir Satin Slip Dress — ₹12,900'
      }
    ]
  }
];
