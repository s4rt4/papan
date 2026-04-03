import { useState, useEffect } from 'react';

type TimeFormat = '12' | '24';
type Timezone = 'WIB' | 'WITA' | 'WIT';

const TZ_OFFSETS: Record<Timezone, string> = {
    WIB: 'Asia/Jakarta',
    WITA: 'Asia/Makassar',
    WIT: 'Asia/Jayapura',
};

function getStoredFormat(): TimeFormat {
    return (localStorage.getItem('papan-time-format') as TimeFormat) || '24';
}

function getStoredTimezone(): Timezone {
    return (localStorage.getItem('papan-timezone') as Timezone) || 'WIB';
}

function formatTime(date: Date, format: TimeFormat, tz: Timezone): string {
    const opts: Intl.DateTimeFormatOptions = {
        timeZone: TZ_OFFSETS[tz],
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: format === '12',
    };
    return new Intl.DateTimeFormat('id-ID', opts).format(date);
}

function formatDate(date: Date, tz: Timezone): string {
    return new Intl.DateTimeFormat('id-ID', {
        timeZone: TZ_OFFSETS[tz],
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export default function TopbarClock() {
    const [now, setNow] = useState(new Date());
    const [format, setFormat] = useState<TimeFormat>(getStoredFormat);
    const [tz, setTz] = useState<Timezone>(getStoredTimezone);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    function changeFormat(f: TimeFormat) {
        setFormat(f);
        localStorage.setItem('papan-time-format', f);
    }

    function changeTimezone(t: Timezone) {
        setTz(t);
        localStorage.setItem('papan-timezone', t);
    }

    return (
        <div className="relative hidden sm:block">
            <button
                onClick={() => setShowSettings(prev => !prev)}
                className="flex flex-col items-end rounded-lg px-2 py-1 transition-colors hover:bg-muted"
                title="Klik untuk ubah format waktu"
            >
                <span className="text-sm font-medium tabular-nums text-foreground">
                    {formatTime(now, format, tz)}
                    <span className="ml-1 text-[10px] font-normal text-muted-foreground">{tz}</span>
                </span>
                <span className="text-[10px] text-muted-foreground">{formatDate(now, tz)}</span>
            </button>

            {showSettings && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card p-3 shadow-xl">
                        <p className="mb-2 text-xs font-semibold text-muted-foreground">Format Jam</p>
                        <div className="mb-3 flex gap-1">
                            {(['24', '12'] as TimeFormat[]).map(f => (
                                <button
                                    key={f}
                                    onClick={() => changeFormat(f)}
                                    className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                                        format === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/70'
                                    }`}
                                >
                                    {f} Jam
                                </button>
                            ))}
                        </div>
                        <p className="mb-2 text-xs font-semibold text-muted-foreground">Zona Waktu</p>
                        <div className="flex gap-1">
                            {(['WIB', 'WITA', 'WIT'] as Timezone[]).map(t => (
                                <button
                                    key={t}
                                    onClick={() => changeTimezone(t)}
                                    className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                                        tz === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/70'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
