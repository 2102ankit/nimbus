import { PointerSensor } from "@dnd-kit/core";

export class NoDragOnResizerSensor extends PointerSensor {
    static activators = [
        {
            eventName: "onPointerDown",
            handler: (event, { onActivation }) => {
                const target = event.target;

                if (target.closest('[data-dnd-kit-disabled]')) {
                    return false;
                }

                if (target.classList.contains("tanstack-resizer")) {
                    return false;
                }

                const th = target.closest("th");
                if (th) {
                    const rect = th.getBoundingClientRect();
                    const distanceFromRight = rect.right - event.clientX;
                    if (distanceFromRight < 12) {
                        const columnId = th.getAttribute("data-column-id");
                        if (columnId) {
                            const column = table?.getColumn(columnId);
                            if (column?.getCanResize?.()) {
                                return false;
                            }
                        }
                    }
                }
                return PointerSensor.activators[0].handler(event, { onActivation });
            },
        },
    ];
}