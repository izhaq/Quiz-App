export interface NavigationItem {
    description: string;
    state: NavigationItemState;
    id: string;
    isActive: boolean;
}

export enum NavigationItemState {
    VISITED = 'visited',
    CURRENT = 'current',
    PENDING = 'pending'
}