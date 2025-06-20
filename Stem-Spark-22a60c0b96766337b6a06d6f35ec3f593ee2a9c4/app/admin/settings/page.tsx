"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Globe, 
  Users, 
  Key,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../layout';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Novakinetix Academy',
    siteDescription: 'Empowering the next generation of innovators',
    contactEmail: 'admin@novakinetix.com',
    timezone: 'UTC',
    
    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireEmailVerification: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    applicationAlerts: true,
    
    // Appearance Settings
    theme: 'light',
    primaryColor: '#3B82F6',
    accentColor: '#8B5CF6',
    
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSaveStatus('success');
    setIsLoading(false);
    
    // Reset success status after 3 seconds
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const SettingSection = ({ title, description, icon: Icon, children }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
              <CardDescription className="text-gray-600">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );

  const SettingItem = ({ label, description, children }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <Label className="text-sm font-medium text-gray-900">{label}</Label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <motion.div 
        className="space-y-8 p-2 sm:p-4 lg:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-[var(--novakinetix-dark)]">
                Settings & Configuration
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Manage system settings, security preferences, and platform configuration.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Reset
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isLoading}
                className="bg-[var(--novakinetix-primary)] hover:bg-[var(--novakinetix-accent)]"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Save Status */}
          <AnimatePresence>
            {saveStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">Settings saved successfully!</span>
              </motion.div>
            )}
            {saveStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-medium">Failed to save settings. Please try again.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <SettingSection
            title="General Settings"
            description="Basic platform configuration and branding"
            icon={Globe}
          >
            <SettingItem label="Site Name" description="Display name for your platform">
              <Input
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                className="w-64"
              />
            </SettingItem>
            
            <SettingItem label="Site Description" description="Brief description of your platform">
              <Input
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                className="w-64"
              />
            </SettingItem>
            
            <SettingItem label="Contact Email" description="Primary contact email for administrators">
              <Input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                className="w-64"
              />
            </SettingItem>
            
            <SettingItem label="Timezone" description="Default timezone for the platform">
              <select
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="GMT">GMT</option>
              </select>
            </SettingItem>
          </SettingSection>

          {/* Security Settings */}
          <SettingSection
            title="Security Settings"
            description="Authentication and security preferences"
            icon={Shield}
          >
            <SettingItem label="Two-Factor Authentication" description="Require 2FA for all users">
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
              />
            </SettingItem>
            
            <SettingItem label="Session Timeout" description="Minutes before automatic logout">
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                className="w-20"
                min="5"
                max="120"
              />
            </SettingItem>
            
            <SettingItem label="Minimum Password Length" description="Required password length">
              <Input
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                className="w-20"
                min="6"
                max="20"
              />
            </SettingItem>
            
            <SettingItem label="Email Verification" description="Require email verification for new accounts">
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
              />
            </SettingItem>
          </SettingSection>

          {/* Notification Settings */}
          <SettingSection
            title="Notification Settings"
            description="Email and push notification preferences"
            icon={Bell}
          >
            <SettingItem label="Email Notifications" description="Send notifications via email">
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </SettingItem>
            
            <SettingItem label="Push Notifications" description="Send browser push notifications">
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </SettingItem>
            
            <SettingItem label="Weekly Reports" description="Send weekly activity reports">
              <Switch
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
              />
            </SettingItem>
            
            <SettingItem label="Application Alerts" description="Notify on new internship applications">
              <Switch
                checked={settings.applicationAlerts}
                onCheckedChange={(checked) => handleSettingChange('applicationAlerts', checked)}
              />
            </SettingItem>
          </SettingSection>

          {/* Appearance Settings */}
          <SettingSection
            title="Appearance Settings"
            description="Theme and visual customization"
            icon={Palette}
          >
            <SettingItem label="Theme" description="Choose your preferred theme">
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </SettingItem>
            
            <SettingItem label="Primary Color" description="Main brand color">
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <span className="text-sm text-gray-500">{settings.primaryColor}</span>
              </div>
            </SettingItem>
            
            <SettingItem label="Accent Color" description="Secondary brand color">
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <span className="text-sm text-gray-500">{settings.accentColor}</span>
              </div>
            </SettingItem>
          </SettingSection>

          {/* System Settings */}
          <SettingSection
            title="System Settings"
            description="Advanced system configuration"
            icon={Database}
          >
            <SettingItem label="Maintenance Mode" description="Put the platform in maintenance mode">
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              />
            </SettingItem>
            
            <SettingItem label="Debug Mode" description="Enable debug logging">
              <Switch
                checked={settings.debugMode}
                onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
              />
            </SettingItem>
            
            <SettingItem label="Auto Backup" description="Automatically backup database">
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
              />
            </SettingItem>
            
            <SettingItem label="Backup Frequency" description="How often to create backups">
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </SettingItem>
          </SettingSection>

          {/* User Management */}
          <SettingSection
            title="User Management"
            description="User account and permission settings"
            icon={Users}
          >
            <SettingItem label="Default User Role" description="Role assigned to new users">
              <select
                defaultValue="student"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
                <option value="admin">Admin</option>
              </select>
            </SettingItem>
            
            <SettingItem label="Account Approval" description="Require admin approval for new accounts">
              <Switch defaultChecked />
            </SettingItem>
            
            <SettingItem label="Profile Privacy" description="Default privacy settings for user profiles">
              <select
                defaultValue="public"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </SettingItem>
            
            <SettingItem label="Account Deletion" description="Allow users to delete their accounts">
              <Switch defaultChecked />
            </SettingItem>
          </SettingSection>
        </div>

        {/* API Keys Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SettingSection
            title="API Configuration"
            description="External service integrations and API keys"
            icon={Key}
          >
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Supabase Configuration</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Project URL:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      https://qnuevynptgkoivekuzer.supabase.co
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Key Status:</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Email Service</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Provider:</span>
                    <Badge variant="outline">Resend</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                </div>
              </div>
            </div>
          </SettingSection>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
