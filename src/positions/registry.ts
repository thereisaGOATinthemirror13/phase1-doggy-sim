import type { PositionModule } from '../core/types';
import { doggyPosition } from './doggy';

export const POSITIONS: PositionModule[] = [doggyPosition];

export function getPosition(id: string): PositionModule {
  const p = POSITIONS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown position: ${id}`);
  return p;
}
