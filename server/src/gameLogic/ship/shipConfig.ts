export interface ShipConfig {
    area: number;
    count: number;
}

export enum ShipSize {
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
}

export enum ShipsConfigAlternatives {
    DEFAULT = 0,
}

export const ShipsConfigurations: Record<ShipsConfigAlternatives, ShipConfig[]> = {
    [ShipsConfigAlternatives.DEFAULT]: [
        { area: ShipSize.TWO, count: 1 },
        { area: ShipSize.THREE, count: 2 },
        { area: ShipSize.FOUR, count: 1 },
        { area: ShipSize.FIVE, count: 1 },
    ],
};
