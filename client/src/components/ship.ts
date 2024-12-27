import $ from 'jquery';

export function createShip(size: number, draggable: boolean = true, i: number = 0): JQuery<HTMLElement> {
    return $('<div>', {
        class: `ship ship-size-${size}`,
        'data-ship-id': `ship-${size}-${i}`,
        'data-direction': 'horizontal',
        draggable: draggable,
    });
}
