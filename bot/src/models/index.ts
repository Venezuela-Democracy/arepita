import { User, IUser } from './user';
import { Group, IGroup } from './group';

// Exportar modelos
export { User, Group };

// Exportar interfaces
export type { IUser, IGroup };

// Exportar objeto de modelos
export const Models = {
  User,
  Group
} as const;