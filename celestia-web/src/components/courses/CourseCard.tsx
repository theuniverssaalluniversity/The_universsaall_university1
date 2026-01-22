import { Link } from 'react-router-dom';
import { Clock, Users, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseCardProps {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    price: number;
    slug: string;
}

const CourseCard = ({ title, description, thumbnail_url, price, slug }: CourseCardProps) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300"
        >
            <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                {thumbnail_url ? (
                    <img src={thumbnail_url} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">No Image</div>
                )}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                    Astrology
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-center gap-2 mb-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><Users size={12} /> 1.2k Students</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500" /> 4.8</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> 12h 30m</span>
                </div>

                <h3 className="text-xl font-serif text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-zinc-400 text-sm line-clamp-2 mb-6">{description}</p>

                <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-medium text-white">${price}</span>
                    <Link to={`/courses/${slug}`} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:border-primary transition-all">
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default CourseCard;
