import Tier from "./tier-enum";

type Item = {
  name: string;
  value: number;
  maxQuantity?: number;
  tier: Tier;
  tierQuantity?: number;
  totalQuantity?: number;
}

export default Item;
