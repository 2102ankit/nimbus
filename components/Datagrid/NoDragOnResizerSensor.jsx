import { PointerSensor } from "@dnd-kit/core";

export class NoDragOnResizerSensor extends PointerSensor {
    static activators = [
        {
            eventName: "onPointerDown",
            handler: (event, { onActivation }) => {
                const target = event.target;

                // Block if clicking on disabled elements
                if (target.closest('[data-dnd-kit-disabled]')) {
                    return false;
                }

                // Block if clicking on resize handle
                if (target.classList.contains("cursor-col-resize") ||
                    target.closest('.cursor-col-resize')) {
                    return false;
                }

                // Block if near column edge (resize zone)
                const th = target.closest("th");
                if (th) {
                    const rect = th.getBoundingClientRect();
                    const distanceFromRight = rect.right - event.clientX;
                    const distanceFromLeft = event.clientX - rect.left;

                    // 8px resize zone on each edge
                    if (distanceFromRight < 8 || distanceFromLeft < 8) {
                        return false;
                    }
                }

                return PointerSensor.activators[0].handler(event, { onActivation });
            },
        },
    ];
}