import { useMemo } from 'react';


interface CustomVideoPlayerProps {
    url: string;
    onComplete?: () => void;
    onProgress?: (progress: number) => void;
}

const CustomVideoPlayer = ({ url }: CustomVideoPlayerProps) => {
    // Extract Video ID reliably
    const videoId = useMemo(() => {
        try {
            const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            if (match && match[1]) {
                return match[1];
            }
            return null;
        } catch (e) {
            console.error("Error extracting video ID", e);
            return null;
        }
    }, [url]);

    if (!videoId) {
        return (
            <div className="w-full aspect-video bg-black flex items-center justify-center text-white border border-white/10 rounded-xl">
                <div className="text-center p-4">
                    <p className="text-red-400 mb-2">Invalid Video URL</p>
                    <p className="text-xs text-zinc-500 break-all">{url}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
            {/* Native YouTube IFrame - Guaranteed to work */}
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1&controls=1`}
                title="Course Video"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        </div>
    );
};

export default CustomVideoPlayer;
