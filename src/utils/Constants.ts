var chipColorIndex = 0;
export function getRandomChipColor(): string {
  chipColorIndex++;
  if (chipColorIndex >= ChipColors.length) {
    chipColorIndex = chipColorIndex % ChipColors.length;
  }
  return ChipColors[chipColorIndex];
}

export const ChipColors = [
  'primary',
  'tertiary',
  'success',
  'warning',
  'danger',
  'dark',
];
