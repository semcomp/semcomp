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
    let multiplier = poly.eval(x >= 0 ? x : 0);
    
    multiplier = Math.max(minimumMultiplier, multiplier);

    return multiplier;
  }


  findNextTier(actualTier: Tier) {
      return nextTierMap[actualTier];
  }

  totalPoints(item: any, quantity: number): number {
      let points: number = 0;

      for (let i = 0; i < quantity; i++) {
        item.tierQuantity += 1;

        points += this.calculateMultiplier(item, item.tier) * item.value;


        if (item.tierQuantity >= item.maxQuantity) {
          const nextTier = this.findNextTier(item.tier);

          if (nextTier) {
            item.tier = nextTier;
            item.tierQuantity = 0;
          } else {
            item.tierQuantity = item.maxQuantity;
          }
        }
      }

      return Math.round(points);
    }
}

export default new CalculatorService();
