import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Search } from 'lucide-react';
import CourseCard from '../components/courses/CourseCard';

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    price: number;
    slug: string;
}

const CoursesPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('status', 'published')
                .eq('is_deleted', false);

            if (!error && data) {
                setCourses(data);
            }
            setLoading(false);
        };

        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="bg-zinc-900/50 border-b border-white/5 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-serif text-white mb-4">Course Marketplace</h1>
                    <p className="text-zinc-400 max-w-2xl">Browse our extensive library of spiritual and astrological knowledge.</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                {/* Search Bar */}
                <div className="bg-zinc-900 border border-zinc-700/50 p-4 rounded-xl shadow-xl flex items-center gap-4 mb-12 backdrop-blur-xl">
                    <Search className="text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search for courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:outline-none text-white w-full placeholder:text-zinc-600"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-zinc-500">Loading courses...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map(course => (
                                <Link to={`/courses/${course.slug}`} className="block group">
                                    <CourseCard {...course} />
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-zinc-500">
                                No courses found matching "{searchTerm}"
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursesPage;
