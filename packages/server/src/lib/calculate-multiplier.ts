import Tier from "./constants/tier-enum";
import Polynomial from "polynomial";

const coeficientsMap = {
  [Tier.TIER1]: [1, 0, 0],
  [Tier.TIER2]: [1, 1, 0],
  [Tier.TIER3]: [1, 1, 1],
};

const minimumMultiplierMap = {
  [Tier.TIER1]: 1,
  [Tier.TIER2]: 2,
  [Tier.TIER3]: 3,
};

const nextTierMap = {
  [Tier.TIER1]: null,
  [Tier.TIER2]: Tier.TIER1,
  [Tier.TIER3]: Tier.TIER2,
};

class CalculatorService {
  calculateMultiplier(item: any, tier: Tier): number {

    const coeficients = coeficientsMap[tier] ?? [1, 0, 0]; 
    const minimumMultiplier = minimumMultiplierMap[tier] ?? 1;

    const x = minimumMultiplier - item.tierQuantity / item.maxQuantity;
    
    const poly = new Polynomial(coeficients.reverse());
    let multiplier = poly.eval(x);
    
    multiplier = Math.max(minimumMultiplier, multiplier);

    return multiplier;
  }


  verifyDemote(item: any) {
    return item.tierQuantity >= item.maxQuantity;
  }

  async findNextTier(actualTier: Tier) {
      return nextTierMap[actualTier];
  }
}

export default new CalculatorService();
