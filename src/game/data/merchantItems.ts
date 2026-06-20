export type MerchantItemId = 'heal' | 'weapon-upgrade' | 'max-hp' | 'damage' | 'blessing-reroll';

export interface MerchantItemDefinition {
  id: MerchantItemId;
  displayName: string;
  description: string;
  basePrice: number;
  repeatable: boolean;
  color: number;
}

export const merchantItems: readonly MerchantItemDefinition[] = [
  { id: 'heal', displayName: 'Field Dressing', description: 'Heal 30% max HP', basePrice: 20, repeatable: true, color: 0x66e39a },
  { id: 'weapon-upgrade', displayName: 'Temper Weapon', description: '+22% weapon damage', basePrice: 45, repeatable: true, color: 0xd8ad55 },
  { id: 'max-hp', displayName: 'Vitality Draught', description: '+5 maximum HP', basePrice: 35, repeatable: true, color: 0xef6f7e },
  { id: 'damage', displayName: 'Whetstone', description: '+2 flat damage', basePrice: 40, repeatable: true, color: 0xee964b },
  { id: 'blessing-reroll', displayName: 'Diviner Token', description: '+1 blessing reroll', basePrice: 25, repeatable: true, color: 0x9b7ede },
];
