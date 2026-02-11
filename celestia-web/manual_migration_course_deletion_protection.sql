-- Course Deletion Protection Trigger
-- Prevents deleting a course if any student has >50% progress.

CREATE OR REPLACE FUNCTION check_course_deletion_safety()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for any enrollment with > 50% progress
    IF EXISTS (
        SELECT 1 
        FROM public.enrollments 
        WHERE course_id = OLD.id 
        AND progress_percent > 50
    ) THEN
        RAISE EXCEPTION 'Cannot delete course. Some students have completed >50%% of the content.';
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to allow idempotency
DROP TRIGGER IF EXISTS trg_check_course_delete ON public.courses;

-- Create Trigger
CREATE TRIGGER trg_check_course_delete
BEFORE DELETE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION check_course_deletion_safety();
