export function HotkeyLabel({ children, hotkey }) {
    const text = String(children);
    const index = text.toLowerCase().indexOf(hotkey.toLowerCase());

    if (index === -1) return <>{children}</>;

    return (
        <span>
            {text.slice(0, index)}
            <span className="underline underline-offset-2 p-0 m-0">{text[index]}</span>
            {text.slice(index + 1)}
        </span>
    );
}