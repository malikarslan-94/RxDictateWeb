import type { Action } from '@/constants/roles';
import { selectCan } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';

/**
 * Whether the active membership may do `action`, from the `can` list the
 * server sends. What a role sees is decided by its actions, never its name;
 * the server refuses the rest anyway.
 */
export function useCan(action: Action): boolean {
  return useAppSelector((state) => selectCan(state, action));
}
