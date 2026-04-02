import { useFlash } from '@/hooks/use-page-props';
import { useEffect, useState } from 'react';

export default function FlashMessage() {
    const flash = useFlash();
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (flash.success) {
            setMessage({ type: 'success', text: flash.success });
            setVisible(true);
        } else if (flash.error) {
            setMessage({ type: 'error', text: flash.error });
            setVisible(true);
        }
    }, [flash.success, flash.error]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible || !message) return null;

    return (
        <div
            className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg transition-all ${
                message.type === 'success' ? 'bg-success' : 'bg-destructive'
            }`}
        >
            {message.text}
            <button onClick={() => setVisible(false)} className="ml-3 font-bold opacity-70 hover:opacity-100">
                &times;
            </button>
        </div>
    );
}
