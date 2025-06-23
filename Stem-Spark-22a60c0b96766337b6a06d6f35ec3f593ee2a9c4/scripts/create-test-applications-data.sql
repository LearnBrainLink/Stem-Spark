-- Create Test Data for Applications
-- Run this AFTER running the relationship fix script

DO $$
BEGIN
    RAISE NOTICE 'Creating test data for applications...';

    -- Create test profiles (students) if they don't exist
    INSERT INTO public.profiles (email, full_name, role, grade, school_name)
    SELECT * FROM (VALUES
        ('alice.student@test.com', 'Alice Johnson', 'student', 8, 'Roosevelt Middle School'),
        ('bob.student@test.com', 'Bob Smith', 'student', 7, 'Lincoln Middle School'),
        ('carol.student@test.com', 'Carol Davis', 'student', 8, 'Washington Middle School'),
        ('david.student@test.com', 'David Wilson', 'student', 7, 'Jefferson Middle School')
    ) AS test_data(email, full_name, role, grade, school_name)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE email = test_data.email
    );

    -- Create test internships if they don't exist
    INSERT INTO public.internships (title, company, description, requirements, location, duration, application_deadline, start_date, end_date, status)
    SELECT * FROM (VALUES
        ('Web Development Intern', 'TechCorp Solutions', 'Learn HTML, CSS, JavaScript and build real websites', 'Basic computer skills, enthusiasm to learn', 'Remote', '4 weeks', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '45 days', CURRENT_DATE + INTERVAL '75 days', 'active'),
        ('Data Science Explorer', 'DataTech Inc', 'Introduction to data analysis and visualization using Python', 'Math skills, curiosity about data', 'San Francisco, CA', '6 weeks', CURRENT_DATE + INTERVAL '25 days', CURRENT_DATE + INTERVAL '40 days', CURRENT_DATE + INTERVAL '85 days', 'active'),
        ('Mobile App Development', 'AppStudio', 'Create mobile apps for iOS and Android platforms', 'Basic programming knowledge helpful', 'New York, NY', '8 weeks', CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '35 days', CURRENT_DATE + INTERVAL '95 days', 'active'),
        ('Cybersecurity Basics', 'SecureNet Corp', 'Learn about network security and ethical hacking', 'Interest in computer security', 'Austin, TX', '5 weeks', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '65 days', 'active')
    ) AS test_data(title, company, description, requirements, location, duration, application_deadline, start_date, end_date, status)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.internships WHERE title = test_data.title AND company = test_data.company
    );

    -- Create test applications
    INSERT INTO public.internship_applications (internship_id, student_id, application_text, status, applied_at)
    SELECT 
        i.id,
        p.id,
        CASE 
            WHEN p.full_name = 'Alice Johnson' THEN 'I am very excited about web development and have been learning HTML and CSS on my own. I would love to gain real-world experience and contribute to meaningful projects.'
            WHEN p.full_name = 'Bob Smith' THEN 'Data science fascinates me, especially how we can find patterns in large datasets. I have strong math skills and am eager to learn Python for data analysis.'
            WHEN p.full_name = 'Carol Davis' THEN 'I use mobile apps every day and have always wondered how they are made. This internship would be a perfect opportunity to learn app development and create something useful.'
            ELSE 'I am interested in technology and eager to learn new skills. This internship aligns perfectly with my career goals and I am committed to making the most of this opportunity.'
        END,
        CASE 
            WHEN RANDOM() < 0.3 THEN 'approved'
            WHEN RANDOM() < 0.6 THEN 'pending'
            WHEN RANDOM() < 0.8 THEN 'rejected'
            ELSE 'withdrawn'
        END,
        CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days')
    FROM public.internships i
    CROSS JOIN public.profiles p
    WHERE p.role = 'student'
    AND NOT EXISTS (
        SELECT 1 FROM public.internship_applications ia 
        WHERE ia.internship_id = i.id AND ia.student_id = p.id
    )
    AND RANDOM() < 0.7; -- Only create applications for 70% of combinations

    -- Update some applications with review information
    UPDATE public.internship_applications 
    SET 
        reviewed_at = applied_at + (RANDOM() * INTERVAL '7 days'),
        reviewed_by = (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
    WHERE status IN ('approved', 'rejected') 
    AND reviewed_at IS NULL;

    -- Get counts
    DECLARE
        profile_count INTEGER;
        internship_count INTEGER;
        application_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO profile_count FROM public.profiles WHERE role = 'student';
        SELECT COUNT(*) INTO internship_count FROM public.internships WHERE status = 'active';
        SELECT COUNT(*) INTO application_count FROM public.internship_applications;
        
        RAISE NOTICE 'Test data created successfully!';
        RAISE NOTICE 'Student profiles: %', profile_count;
        RAISE NOTICE 'Active internships: %', internship_count;
        RAISE NOTICE 'Applications: %', application_count;
    END;

END $$;

-- Display summary of test data
SELECT 
    'Summary of Test Data' as info,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'student') as student_count,
    (SELECT COUNT(*) FROM public.internships WHERE status = 'active') as active_internships,
    (SELECT COUNT(*) FROM public.internship_applications) as total_applications,
    (SELECT COUNT(*) FROM public.internship_applications WHERE status = 'pending') as pending_applications,
    (SELECT COUNT(*) FROM public.internship_applications WHERE status = 'approved') as approved_applications;

-- Show sample applications with relationships
SELECT 
    ia.id,
    p.full_name as student_name,
    p.email as student_email,
    i.title as internship_title,
    i.company,
    ia.status,
    ia.applied_at
FROM public.internship_applications ia
JOIN public.profiles p ON ia.student_id = p.id
JOIN public.internships i ON ia.internship_id = i.id
ORDER BY ia.applied_at DESC
LIMIT 5; 