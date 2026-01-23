import { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import clsx from 'clsx';

interface CustomVideoPlayerProps {
    url: string;
    onComplete?: () => void;
    onProgress?: (progress: number) => void;
}

const CustomVideoPlayer = ({ url, onComplete, onProgress }: CustomVideoPlayerProps) => {
    const playerRef = useRef<ReactPlayer>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<any>(null);

    const formatTime = (seconds: number) => {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        if (hh) {
            return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
        }
        return `${mm}:${ss}`;
    };

    const handlePlayPause = () => setPlaying(!playing);

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => setSeeking(true);

    const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        setSeeking(false);
        playerRef.current?.seekTo(parseFloat((e.target as HTMLInputElement).value));
    };

    const handleProgress = (state: { played: number; loaded: number; playedSeconds: number }) => {
        if (!seeking) {
            setPlayed(state.played);
        }
        if (onProgress) onProgress(state.played * 100);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setFullscreen(true);
        } else {
            document.exitFullscreen();
            setFullscreen(false);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (playing) setShowControls(false);
        }, 3000);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black group overflow-hidden rounded-xl shadow-2xl border border-white/10"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => playing && setShowControls(false)}
        >
            <ReactPlayer
                ref={playerRef}
                url={url}
                width="100%"
                height="100%"
                playing={playing}
                volume={volume}
                muted={muted}
                onProgress={handleProgress}
                onDuration={setDuration}
                onEnded={() => {
                    setPlaying(false);
                    if (onComplete) onComplete();
                }}
                config={{
                    youtube: {
                        playerVars: {
                            controls: 0,
                            modestbranding: 1,
                            rel: 0,
                            showinfo: 0,
                            iv_load_policy: 3,
                            disablekb: 1,
                            fs: 0
                        }
                    }
                }}
                style={{ position: 'absolute', top: 0, left: 0 }}
            />

            {/* Custom Overlay Controls */}
            <div
                className={clsx(
                    "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 flex flex-col justify-end p-4",
                    showControls ? "opacity-100" : "opacity-0 cursor-none"
                )}
            >
                {/* Big Center Play Button (Only when paused) */}
                {!playing && showControls && (
                    <button
                        onClick={handlePlayPause}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-lg shadow-primary/20"
                    >
                        <Play fill="currentColor" size={32} className="ml-1" />
                    </button>
                )}

                {/* Bottom Bar */}
                <div className="space-y-2">
                    {/* Progress Bar */}
                    <div className="relative h-1 group/slider">
                        <input
                            type="range"
                            min={0}
                            max={0.999999}
                            step="any"
                            value={played}
                            onMouseDown={handleSeekMouseDown}
                            onChange={handleSeekChange}
                            onMouseUp={handleSeekMouseUp}
                            className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="absolute top-0 left-0 w-full h-full bg-white/20 rounded-full">
                            <div
                                className="h-full bg-primary relative rounded-full"
                                style={{ width: `${played * 100}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow scale-0 group-hover/slider:scale-100 transition-transform" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-4">
                            <button onClick={handlePlayPause} className="text-white hover:text-primary transition-colors">
                                {playing ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
                            </button>

                            <div className="flex items-center gap-2 group/vol">
                                <button onClick={() => setMuted(!muted)} className="text-white hover:text-primary transition-colors">
                                    {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>
                                <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step="any"
                                        value={volume}
                                        onChange={e => {
                                            setVolume(parseFloat(e.target.value));
                                            setMuted(false);
                                        }}
                                        className="w-full h-1 bg-white/20 accent-primary rounded-full cursor-pointer"
                                    />
                                </div>
                            </div>

                            <span className="text-xs font-mono text-zinc-300">
                                {formatTime(duration * played)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
                                {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Click Mask for Play/Pause toggle on video area */}
            <div
                className="absolute inset-0 z-0"
                onClick={handlePlayPause}
                onDoubleClick={toggleFullscreen}
            />
        </div>
    );
};

export default CustomVideoPlayer;
