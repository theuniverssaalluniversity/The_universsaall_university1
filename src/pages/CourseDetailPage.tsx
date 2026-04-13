import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Clock, Users, Star, PlayCircle, Lock } from 'lucide-react';
import { PaymentService } from '../services/payment/PaymentService';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

interface CourseDetail {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    price: number;
    duration?: string;
    certificate?: boolean;
    community_access?: boolean;
}

const CourseDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState<{ amount: number, type: 'percent' | 'fixed' } | null>(null);
    const [verifyingCoupon, setVerifyingCoupon] = useState(false);

    const [course, setCourse] = useState<CourseDetail & { id: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolled, setEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [modules, setModules] = useState<any[]>([]);

    const finalPrice = course && discount
        ? (discount.type === 'percent'
            ? course.price * (1 - discount.amount / 100)
            : Math.max(0, course.price - discount.amount))
        : (course?.price || 0);

    useEffect(() => {
        const fetchCourse = async () => {
            // Fetch current user and enrollments first to check
            const { data: { user } } = await supabase.auth.getUser();

            if (!slug) return;

            const { data: courseData, error } = await supabase
                .from('courses')
                .select('*')
                .eq('slug', slug)
                .single();

            if (!error && courseData) {
                setCourse(courseData);

                // Check enrollment status
                if (user) {
                    const { data: enrollment } = await supabase
                        .from('enrollments')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('course_id', courseData.id)
                        .single();

                    if (enrollment) setEnrolled(true);
                }

                // Fetch modules for syllabus preview (including lessons for preview check)
                const { data: modulesData } = await supabase
                    .from('modules')
                    .select('id, title, sort_order, lessons(id, title, is_free_preview, sort_order)')
                    .eq('course_id', courseData.id)
                    .order('sort_order');

                if (modulesData) {
                    // Sort lessons
                    const sorted = modulesData.map((m: any) => ({
                        ...m,
                        lessons: m.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
                    }));
                    setModules(sorted);
                }
            }
            setLoading(false);
        };

        fetchCourse();
    }, [slug]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setVerifyingCoupon(true);
        setDiscount(null);

        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', couponCode.toUpperCase())
            .eq('is_active', true)
            .single();

        if (error || !data) {
            alert('Invalid or expired coupon code');
        } else {
            // Check expiry
            if (data.valid_until && new Date(data.valid_until) < new Date()) {
                alert('Coupon has expired');
            } else if (data.max_uses && data.times_used >= data.max_uses) {
                alert('Coupon usage limit reached');
            } else {
                setDiscount({ amount: data.discount_value, type: data.discount_type as any });
                alert(`Coupon applied! ${data.discount_value}% OFF`);
            }
        }
        setVerifyingCoupon(false);
    };

    const handleEnroll = async () => {
        if (!course) return;

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            navigate('/login');
            return;
        }

        setEnrolling(true);

        // Check if already enrolled (double check)
        if (enrolled) {
            navigate('/student');
            return;
        }

        try {
            // Initiate Payment
            const currencyCode = 'INR';

            await PaymentService.initiatePayment({
                userId: user.id,
                amount: finalPrice,
                currency: currencyCode,
                userEmail: user.email || '',
                userName: user.user_metadata?.full_name || 'Student',
                description: `Enrollment: ${course.title}`,
                metadata: {
                    course_id: course.id,
                    type: 'enrollment'
                }
            });

            // On Successful Payment (Razorpay handler resolves Promise)
            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total_amount: finalPrice,
                    status: 'completed',
                    payment_status: 'completed',
                    payment_provider: 'razorpay',
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Item
            const { error: itemError } = await supabase
                .from('order_items')
                .insert({
                    order_id: order.id,
                    item_type: 'course',
                    item_id: course.id,
                    price: finalPrice
                });

            if (itemError) throw itemError;

            // 3. Create Enrollment
            const { error: enrollError } = await supabase
                .from('enrollments')
                .insert({
                    user_id: user.id,
                    course_id: course.id,
                    progress_percent: 0
                });

            if (enrollError) throw enrollError;

            // Success
            alert('Enrolled successfully!');
            navigate(`/learn/${course.id}`);

        } catch (error: any) {
            console.error('Enrollment/Payment Failed:', error);
            // alert('Failed to enroll: ' + error.message);
            // Don't alert if user just closed the popup
        }
        setEnrolling(false);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
    );

    if (!course) return <div className="min-h-screen flex items-center justify-center text-zinc-500">Course not found</div>;

    return (
        <div className="min-h-screen pb-20">
            <Helmet>
                <title>{course.title} | Astrology Courses</title>
                <meta name="description" content={course.description.substring(0, 160)} />
            </Helmet>
            {/* Hero Header */}
            <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    {course.thumbnail_url && (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-30 blur-sm" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-black/50" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-serif text-white mb-6"
                    >
                        {course.title}
                    </motion.h1>
                    <div className="flex items-center justify-center gap-6 text-zinc-300 mb-8">
                        <span className="flex items-center gap-2"><Users size={16} /> 1.2k Enrolled</span>
                        <span className="flex items-center gap-2"><Star size={16} className="text-yellow-500" /> 4.8/5</span>
                        <span className="flex items-center gap-2"><Clock size={16} /> 12h 30m</span>
                    </div>
                    {enrolled ? (
                        <button
                            onClick={() => navigate(`/learn/${course.id}`)}
                            className="px-8 py-4 bg-green-500/10 text-green-500 border border-green-500/50 rounded-full font-medium text-lg hover:bg-green-500/20 transition-all shadow-lg shadow-green-500/10 flex items-center gap-2 mx-auto"
                        >
                            <PlayCircle size={20} /> Continue Learning
                        </button>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="px-8 py-4 bg-primary text-black rounded-full font-medium text-lg hover:bg-primary/90 transition-transform hover:scale-105 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {enrolling ? 'Enrolling...' : (
                                    <span>
                                        Enroll Now for
                                        {discount ? (
                                            <>
                                                <span className="line-through opacity-50 mx-2">₹{course.price}</span>
                                                ₹{finalPrice.toFixed(2)}
                                            </>
                                        ) : (
                                            ` ₹${course.price}`
                                        )}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">About this Course</h2>
                        <div className="prose prose-invert text-zinc-400 leading-relaxed max-w-none">
                            {course.description || "No description provided."}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">Syllabus Preview</h2>
                        <div className="space-y-4">
                            {modules.length === 0 ? (
                                <p className="text-zinc-500 italic">Curriculum coming soon.</p>
                            ) : (
                                modules.map((m, i) => (
                                    <div key={m.id} className="border border-zinc-800 rounded-xl overflow-hidden">
                                        <div className="bg-zinc-900 p-4 border-b border-zinc-800/50">
                                            <h4 className="text-white font-bold">Module {i + 1}: {m.title}</h4>
                                        </div>
                                        <div className="divide-y divide-zinc-800/50">
                                            {m.lessons.map((lesson: any) => (
                                                <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                                                            <PlayCircle size={16} />
                                                        </div>
                                                        <span className="text-zinc-300">{lesson.title}</span>
                                                    </div>
                                                    {lesson.is_free_preview ? (
                                                        <button
                                                            onClick={() => navigate(`/learn/${course?.id}`)}
                                                            className="text-xs px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-colors"
                                                        >
                                                            Free Preview
                                                        </button>
                                                    ) : (
                                                        <Lock size={16} className="text-zinc-600" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 sticky top-24 backdrop-blur-xl space-y-6">
                        <div>
                            <h3 className="text-xl font-serif text-white mb-6">Features</h3>
                            <ul className="space-y-4 text-zinc-400">
                                {course.duration && (
                                    <li className="flex items-center gap-3"><Clock size={18} className="text-primary" /> {course.duration}</li>
                                )}
                                {course.community_access && (
                                    <li className="flex items-center gap-3"><Users size={18} className="text-primary" /> Community Access</li>
                                )}
                                {course.certificate && (
                                    <li className="flex items-center gap-3"><Star size={18} className="text-primary" /> Certificate of Completion</li>
                                )}
                                <li className="flex items-center gap-3"><PlayCircle size={18} className="text-primary" /> Lifetime Access</li>
                            </ul>
                        </div>

                        {!enrolled && (
                            <div className="pt-6 border-t border-white/5">
                                <h4 className="text-white font-medium mb-3">Have a Coupon?</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter Code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={verifyingCoupon}
                                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {discount && (
                                    <p className="text-green-400 text-xs mt-2">
                                        Coupon Applied! {discount.amount}% Discount.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
