import $ from 'jquery';

export function createShip(size: number, draggable: boolean = true): JQuery<HTMLElement> {
    return $('<div>', {
        class: `ship ship-size-${size}`,
        draggable: draggable,
    });
}
