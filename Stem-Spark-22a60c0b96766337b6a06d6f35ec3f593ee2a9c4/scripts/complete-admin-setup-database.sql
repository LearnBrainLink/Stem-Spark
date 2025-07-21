-- Complete Admin Setup Database Script
-- This script creates all necessary tables, functions, and configurations for the admin setup page

-- 1. CREATE SYSTEM_CONFIG TABLE
-- This table stores system-wide configuration settings
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (only admins can access system config)
DROP POLICY IF EXISTS "system_config_admin_only" ON public.system_config;
CREATE POLICY "system_config_admin_only" ON public.system_config 
FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- 2. CREATE EMAIL_TEMPLATES TABLE
-- This table stores email templates for the system
-- First, drop the table if it exists to ensure correct schema
DROP TABLE IF EXISTS public.email_templates CASCADE;

CREATE TABLE public.email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "email_templates_admin_only" ON public.email_templates;
CREATE POLICY "email_templates_admin_only" ON public.email_templates 
FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- 3. CREATE SETUP_LOGS TABLE
-- This table logs all setup activities
CREATE TABLE IF NOT EXISTS public.setup_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setup_type TEXT NOT NULL, -- 'database', 'email', 'admin', 'system'
    action TEXT NOT NULL, -- 'configure', 'test', 'verify', 'export'
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'warning')),
    message TEXT,
    details JSONB DEFAULT '{}',
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.setup_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "setup_logs_admin_only" ON public.setup_logs;
CREATE POLICY "setup_logs_admin_only" ON public.setup_logs 
FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_setup_logs_type_status ON public.setup_logs(setup_type, status);
CREATE INDEX IF NOT EXISTS idx_setup_logs_created_at ON public.setup_logs(created_at);

-- 4. CREATE HELPER FUNCTIONS
-- Function to get table list (for database connection testing)
CREATE OR REPLACE FUNCTION get_table_list()
RETURNS TABLE(table_name TEXT, table_type TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT t.table_name::TEXT, t.table_type::TEXT
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check setup status
CREATE OR REPLACE FUNCTION check_setup_status()
RETURNS JSONB AS $$
DECLARE
    admin_count INTEGER;
    config_count INTEGER;
    database_status BOOLEAN := true;
    email_configured BOOLEAN := false;
    result JSONB;
BEGIN
    -- Check admin accounts
    SELECT COUNT(*) INTO admin_count
    FROM public.profiles
    WHERE role = 'admin';

    -- Check system configurations
    SELECT COUNT(*) INTO config_count
    FROM public.system_config;

    -- Check email configuration
    SELECT EXISTS(
        SELECT 1 FROM public.system_config
        WHERE key = 'email_setup'
        AND value->>'smtp_configured' = 'true'
    ) INTO email_configured;

    -- Build result
    result := jsonb_build_object(
        'database_connected', database_status,
        'admin_accounts', admin_count,
        'email_configured', email_configured,
        'system_configs', config_count,
        'setup_complete', (admin_count > 0 AND database_status),
        'checked_at', NOW()
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log setup activities
CREATE OR REPLACE FUNCTION log_setup_activity(
    p_setup_type TEXT,
    p_action TEXT,
    p_status TEXT,
    p_message TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::JSONB,
    p_performed_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.setup_logs (
        setup_type,
        action,
        status,
        message,
        details,
        performed_by
    ) VALUES (
        p_setup_type,
        p_action,
        p_status,
        p_message,
        p_details,
        COALESCE(p_performed_by, auth.uid())
    ) RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. INSERT DEFAULT CONFIGURATIONS
-- Insert default system configurations
INSERT INTO public.system_config (key, value, description) VALUES
('app_name', '{"value": "Novakinetix Academy"}', 'Application name'),
('app_version', '{"value": "1.0.0"}', 'Application version'),
('maintenance_mode', '{"enabled": false}', 'Maintenance mode status'),
('registration_enabled', '{"enabled": true}', 'User registration status'),
('email_verification_required', '{"required": true}', 'Email verification requirement')
ON CONFLICT (key) DO NOTHING;

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, body_html, body_text, variables) VALUES
('welcome', 'Welcome to Novakinetix Academy', 
 '<h1>Welcome {{full_name}}!</h1><p>Thank you for joining Novakinetix Academy.</p>',
 'Welcome {{full_name}}! Thank you for joining Novakinetix Academy.',
 '["full_name", "email"]'),
('admin_created', 'Admin Account Created', 
 '<h1>Admin Account Created</h1><p>An admin account has been created for {{email}}.</p>',
 'Admin Account Created. An admin account has been created for {{email}}.',
 '["email", "full_name"]'),
('setup_complete', 'System Setup Complete', 
 '<h1>Setup Complete</h1><p>The Novakinetix Academy system has been successfully configured.</p>',
 'Setup Complete. The Novakinetix Academy system has been successfully configured.',
 '[]');

-- 6. CREATE INDEXES FOR PERFORMANCE
-- Additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_config_key ON public.system_config(key);
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON public.email_templates(name);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.email_templates(is_active);

-- 7. UPDATE EXISTING TABLES IF NEEDED
-- Add missing columns to profiles table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_login' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added last_login column to profiles table.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'login_count' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN login_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added login_count column to profiles table.';
    END IF;
END $$;

-- 8. GRANT NECESSARY PERMISSIONS
-- Grant permissions for functions to authenticated users
GRANT EXECUTE ON FUNCTION get_table_list() TO authenticated;
GRANT EXECUTE ON FUNCTION check_setup_status() TO authenticated;
GRANT EXECUTE ON FUNCTION log_setup_activity(TEXT, TEXT, TEXT, TEXT, JSONB, UUID) TO authenticated;

-- 9. CREATE TRIGGERS FOR UPDATED_AT COLUMNS
-- Create trigger function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables that have updated_at columns
DROP TRIGGER IF EXISTS update_system_config_updated_at ON public.system_config;
CREATE TRIGGER update_system_config_updated_at
    BEFORE UPDATE ON public.system_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON public.email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. LOG SETUP COMPLETION
SELECT log_setup_activity(
    'system',
    'database_setup',
    'success',
    'Complete admin setup database configuration completed successfully',
    jsonb_build_object(
        'tables_created', ARRAY['system_config', 'email_templates', 'setup_logs'],
        'functions_created', ARRAY['get_table_list', 'check_setup_status', 'log_setup_activity'],
        'setup_timestamp', NOW()
    )
);

-- Display setup status
SELECT 'Setup Status' as info, check_setup_status() as status;

-- Display created tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('system_config', 'email_templates', 'setup_logs', 'profiles', 'user_activities')
ORDER BY table_name;

-- Display system configurations
SELECT key, value, description, created_at 
FROM public.system_config 
ORDER BY key; 