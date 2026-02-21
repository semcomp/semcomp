import Tier from "./constants/tier-enum";

const maxMinPointsMap = {
  [Tier.TIER1]: [5, 1, 3],
  [Tier.TIER2]: [10, 5, 7],
  [Tier.TIER3]: [30, 10, 13],
};

const nextTierMap = {
  [Tier.TIER1]: null,
  [Tier.TIER2]: Tier.TIER1,
  [Tier.TIER3]: Tier.TIER2,
};

const previousTierMap = {
  [Tier.TIER1]: Tier.TIER2,
  [Tier.TIER2]: Tier.TIER3,
  [Tier.TIER3]: null,
};

const polynomialDegree = 2;

class CalculatorService {

  findNextTier(actualTier: Tier) {
      return nextTierMap[actualTier];
  }

  findPreviousTier(actualTier) {
      return previousTierMap[actualTier];
  }

  pointsEquation(maxMin: number[], item: any) {
      // Considerando que o valor máximo de um item é 40 e o mínimo é 5
      // Teto(i), sendo i o valor, é igual (i-5)/(40-5) * (Chão do tier - Teto do valor mínimo) + Teto do valor mínimo
      const ceil = (((item.value - 5)/35) * (maxMin[0] - maxMin[2])) + maxMin[2];
      const decay = 1 - ((item.tierQuantity/item.maxQuantity) ** polynomialDegree)
      const points = ((ceil - maxMin[1]) * decay) + maxMin[1];
      return points;
  }

  totalPoints(item: any, quantity: number): number {
      let points: number = 0;

      for (let i = 0; i < quantity; i++) {
        item.tierQuantity += 1;
        points += this.pointsEquation(maxMinPointsMap[item.tier], item);

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

  throwbackItem(item: any, quantity: number): any {
      item.totalQuantity -= quantity;
      for (let i = 0; i < quantity; i++) {
        item.tierQuantity -= 1;

        if (item.tierQuantity < 0) {

          const previousTier = this.findPreviousTier(item.tier);

          if (previousTier) {
            item.tier = previousTier;
            item.tierQuantity = item.maxQuantity - 1;
          } else {
            item.tierQuantity = 0;
            break;
          }
        }
      }
      return {tier: item.tier, tierQuantity: item.tierQuantity, totalQuantity: item.totalQuantity};
  }
}

export default new CalculatorService();
