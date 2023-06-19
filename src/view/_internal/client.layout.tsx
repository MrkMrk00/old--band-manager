'use client';

import { useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';

function createRipple(event: MouseEvent<HTMLElement>) {
    const button = event.currentTarget;

    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];

    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
}

export function RippleAnimation() {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!ref.current?.parentElement) {
            return;
        }
        const parent = ref.current.parentElement;

        // @ts-ignore
        parent.addEventListener('click', createRipple);
        if (!parent.classList.contains('_with-ripple-anim')) {
            parent.classList.add('_with-ripple-anim');
        }

        ref.current.remove();
    });

    return <span ref={ref} />;
}
