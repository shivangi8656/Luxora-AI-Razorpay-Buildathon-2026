import { CartItem, Product } from '../types';

export interface FrequentlyBoughtAccessory {
  product: Product;
  pairingRole: 'Handbag' | 'Jewelry' | 'Belt' | 'Scarf' | 'Eyewear' | 'Accent';
  frequencyPercent: number;
  stylingNote: string;
}

export interface FrequentlyBoughtTogetherData {
  anchorItem: CartItem;
  luxuryCategory: string;
  accessories: FrequentlyBoughtAccessory[];
  bundleTotalPrice: number;
}

/**
 * Identifies the focal luxury piece in the cart and recommends high-affinity accessories
 * frequently purchased together with it.
 */
export function getFrequentlyBoughtTogetherAccessories(
  cartItems: CartItem[],
  catalog: Product[]
): FrequentlyBoughtTogetherData | null {
  if (!cartItems || cartItems.length === 0 || !catalog || catalog.length === 0) {
    return null;
  }

  const inCartProductIds = new Set(cartItems.map((item) => item.product.id));

  // 1. Identify candidate luxury items in the cart
  // Priority: Dresses > Tailoring > Outerwear > Footwear > other apparel (price >= 5000) > Accessories
  const sortedCartItems = [...cartItems].sort((a, b) => {
    const priority = (item: CartItem): number => {
      const cat = item.product.category?.toLowerCase() || '';
      if (cat === 'dresses') return 100;
      if (cat === 'tailoring') return 90;
      if (cat === 'outerwear') return 80;
      if (cat === 'footwear') return 70;
      if (item.product.price >= 6000) return 60;
      if (cat === 'accessories') return 40;
      return 10;
    };
    return priority(b) - priority(a);
  });

  const anchorItem = sortedCartItems[0];
  if (!anchorItem) return null;

  const anchor = anchorItem.product;
  const anchorCat = anchor.category || '';
  const anchorOccasion = anchor.occasion?.toLowerCase() || '';
  const anchorColor = anchor.color?.toLowerCase() || '';

  // 2. Filter available accessories and jewelry from the catalog (not already in cart, in stock)
  const availableAccessories = catalog.filter((p) => {
    if (inCartProductIds.has(p.id)) return false;
    if (p.stock <= 0) return false;
    return p.category === 'Accessories' || p.category === 'Jewelry';
  });

  if (availableAccessories.length === 0) return null;

  // 3. Helper to classify accessory sub-role
  const getAccessoryRole = (product: Product): FrequentlyBoughtAccessory['pairingRole'] => {
    const occ = (product.occasion || '').toLowerCase();
    const name = product.name.toLowerCase();

    if (occ.includes('bag') || name.includes('bag') || name.includes('tote') || name.includes('clutch')) {
      return 'Handbag';
    }
    if (occ.includes('belt') || name.includes('belt')) {
      return 'Belt';
    }
    if (occ.includes('scarf') || name.includes('scarf') || name.includes('wrap')) {
      return 'Scarf';
    }
    if (occ.includes('sunglasses') || name.includes('sunglasses') || name.includes('eyewear')) {
      return 'Eyewear';
    }
    if (
      product.category === 'Jewelry' ||
      name.includes('necklace') ||
      name.includes('earring') ||
      name.includes('ring') ||
      name.includes('jewelry')
    ) {
      return 'Jewelry';
    }
    return 'Accent';
  };

  // 4. Score each candidate accessory based on relation to the anchor item
  interface ScoredCandidate {
    product: Product;
    role: FrequentlyBoughtAccessory['pairingRole'];
    score: number;
    frequencyPercent: number;
    stylingNote: string;
  }

  const scoredCandidates: ScoredCandidate[] = [];

  for (const accessory of availableAccessories) {
    const role = getAccessoryRole(accessory);
    let score = 50;
    let frequencyPercent = 82;
    let stylingNote = `Frequently styled together with ${anchor.name} to complete the ensemble.`;

    // Direct cross-sell match in product definition
    if (anchor.crossSellProductIds && anchor.crossSellProductIds.includes(accessory.id)) {
      score += 45;
      frequencyPercent = 94;
      stylingNote = `Curated by LUXORA Atelier: 94% of patrons acquire this ${accessory.name.toLowerCase()} when ordering the ${anchor.name}.`;
    }

    // Occasion and category synergies
    if (anchorCat === 'Dresses') {
      if (anchorOccasion.includes('evening') || anchorOccasion.includes('formal') || anchorOccasion.includes('black tie') || anchorOccasion.includes('occasion')) {
        if (role === 'Handbag') {
          score += 35;
          frequencyPercent = Math.max(frequencyPercent, 91);
          stylingNote = `Evening silhouette synergy: paired by 91% of patrons as a cocktail clutch.`;
        } else if (role === 'Jewelry') {
          score += 38;
          frequencyPercent = Math.max(frequencyPercent, 93);
          stylingNote = `Luminescent gold & pearl accentuation designed to elevate the neckline.`;
        } else if (role === 'Accent' || role === 'Belt') {
          score += 25;
          frequencyPercent = Math.max(frequencyPercent, 86);
          stylingNote = `Refined finishing touch frequently chosen for gala & dinner dressing.`;
        }
      } else {
        // Day/casual dress
        if (role === 'Jewelry') {
          score += 32;
          frequencyPercent = Math.max(frequencyPercent, 88);
          stylingNote = `Understated everyday luxury accents styled with contemporary dresses.`;
        } else if (role === 'Handbag') {
          score += 30;
          frequencyPercent = Math.max(frequencyPercent, 89);
          stylingNote = `Everyday carryall pairing chosen by 89% of patrons.`;
        }
      }
    } else if (anchorCat === 'Tailoring') {
      if (role === 'Belt') {
        score += 50;
        frequencyPercent = Math.max(frequencyPercent, 95);
        stylingNote = `Architectural silhouette: 95% of patrons pair our tailored suiting with this waist-defining belt.`;
      } else if (role === 'Handbag') {
        score += 35;
        frequencyPercent = Math.max(frequencyPercent, 90);
        stylingNote = `Structured day-to-evening leather carryall chosen with modern tailoring.`;
      } else if (role === 'Jewelry') {
        score += 32;
        frequencyPercent = Math.max(frequencyPercent, 87);
        stylingNote = `Polished minimalist metalwork designed to complement lapels and collars.`;
      }
    } else if (anchorCat === 'Outerwear') {
      if (role === 'Scarf') {
        score += 50;
        frequencyPercent = Math.max(frequencyPercent, 94);
        stylingNote = `Editorial warmth & drape: 94% of coat orders pair with this Italian silk scarf.`;
      } else if (role === 'Eyewear') {
        score += 38;
        frequencyPercent = Math.max(frequencyPercent, 89);
        stylingNote = `Signature Parisian transit styling: UV400 frames to complete the outerwear coat look.`;
      } else if (role === 'Handbag') {
        score += 32;
        frequencyPercent = Math.max(frequencyPercent, 88);
        stylingNote = `Substantial calfskin handbag chosen to balance outerwear proportions.`;
      }
    } else if (anchorCat === 'Accessories') {
      // If user has a handbag in cart, suggest jewelry, scarf, or belt
      if (role === 'Scarf') {
        score += 42;
        frequencyPercent = Math.max(frequencyPercent, 90);
        stylingNote = `Twilly & drape: frequently styled tied to handbag handles or around necklines.`;
      } else if (role === 'Jewelry') {
        score += 38;
        frequencyPercent = Math.max(frequencyPercent, 89);
        stylingNote = `Matching metal hardware tones for coordinated accessorizing.`;
      } else if (role === 'Belt') {
        score += 35;
        frequencyPercent = Math.max(frequencyPercent, 86);
        stylingNote = `Matched leather finish for cohesive day-to-evening dressing.`;
      }
    }

    // Color resonance bonuses
    const accColor = accessory.color?.toLowerCase() || '';
    if (anchorColor.includes('black') || anchorColor.includes('noir')) {
      if (accColor.includes('gold') || accColor.includes('silver') || accColor.includes('black')) {
        score += 10;
        frequencyPercent = Math.min(99, frequencyPercent + 2);
      }
    } else if (anchorColor.includes('white') || anchorColor.includes('ivory') || anchorColor.includes('beige') || anchorColor.includes('sand')) {
      if (accColor.includes('gold') || accColor.includes('pearl') || accColor.includes('beige') || accColor.includes('tan') || accColor.includes('ivory')) {
        score += 10;
        frequencyPercent = Math.min(99, frequencyPercent + 2);
      }
    }

    scoredCandidates.push({
      product: accessory,
      role,
      score,
      frequencyPercent,
      stylingNote,
    });
  }

  // Sort candidates by score descending
  scoredCandidates.sort((a, b) => b.score - a.score);

  // 5. Pick up to 3 distinct accessories (ensure diverse roles, e.g. 1 Bag/Belt, 1 Jewelry, 1 Accent/Scarf/Eyewear)
  const selected: FrequentlyBoughtAccessory[] = [];
  const usedRoles = new Set<string>();

  for (const candidate of scoredCandidates) {
    if (selected.length >= 3) break;
    // Allow at most one per specific role for diverse pairing harmony
    if (!usedRoles.has(candidate.role)) {
      usedRoles.add(candidate.role);
      selected.push({
        product: candidate.product,
        pairingRole: candidate.role,
        frequencyPercent: candidate.frequencyPercent,
        stylingNote: candidate.stylingNote,
      });
    }
  }

  // If still less than 2 and we have more candidates, fill up to 2-3
  if (selected.length < 2) {
    for (const candidate of scoredCandidates) {
      if (selected.length >= 2) break;
      if (!selected.some((s) => s.product.id === candidate.product.id)) {
        selected.push({
          product: candidate.product,
          pairingRole: candidate.role,
          frequencyPercent: candidate.frequencyPercent,
          stylingNote: candidate.stylingNote,
        });
      }
    }
  }

  if (selected.length === 0) return null;

  const bundleTotalPrice = selected.reduce((sum, item) => sum + item.product.price, 0);

  return {
    anchorItem,
    luxuryCategory: anchorCat,
    accessories: selected,
    bundleTotalPrice,
  };
}
