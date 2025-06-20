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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">System Settings</h1>
            <p className="text-gray-600">Configure system settings and preferences.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="bg-[hsl(var(--novakinetix-primary))] text-white hover:bg-[hsl(var(--novakinetix-dark))]"
            >
              {saveStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saveStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <SettingSection
          title="General Settings"
          description="Basic site configuration and information"
          icon={Settings}
        >
          <SettingItem 
            label="Site Name" 
            description="The name of your platform"
          >
            <Input 
              value={settings.siteName}
              onChange={(e) => handleSettingChange('siteName', e.target.value)}
              className="w-48"
            />
          </SettingItem>
          <SettingItem 
            label="Site Description" 
            description="Brief description of your platform"
          >
            <Input 
              value={settings.siteDescription}
              onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
              className="w-48"
            />
          </SettingItem>
          <SettingItem 
            label="Contact Email" 
            description="Primary contact email address"
          >
            <Input 
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
              className="w-48"
            />
          </SettingItem>
          <SettingItem 
            label="Timezone" 
            description="Default timezone for the platform"
          >
            <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EST">Eastern Time</SelectItem>
                <SelectItem value="PST">Pacific Time</SelectItem>
                <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
              </SelectContent>
            </Select>
          </SettingItem>
        </SettingSection>

        {/* Security Settings */}
        <SettingSection
          title="Security Settings"
          description="Authentication and security configuration"
          icon={Shield}
        >
          <SettingItem 
            label="Two-Factor Authentication" 
            description="Require 2FA for admin accounts"
          >
            <Switch 
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
            />
          </SettingItem>
          <SettingItem 
            label="Email Verification Required" 
            description="Require email verification for new accounts"
          >
            <Switch 
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
            />
          </SettingItem>
          <SettingItem 
            label="Session Timeout (minutes)" 
            description="Automatic logout after inactivity"
          >
            <Input 
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              className="w-24"
            />
          </SettingItem>
          <SettingItem 
            label="Minimum Password Length" 
            description="Required minimum password length"
          >
            <Input 
              type="number"
              value={settings.passwordMinLength}
              onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
              className="w-24"
            />
          </SettingItem>
        </SettingSection>

        {/* Notification Settings */}
        <SettingSection
          title="Notification Settings"
          description="Configure notification preferences"
          icon={Bell}
        >
          <SettingItem 
            label="Email Notifications" 
            description="Send email notifications to users"
          >
            <Switch 
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </SettingItem>
          <SettingItem 
            label="Push Notifications" 
            description="Send push notifications to mobile apps"
          >
            <Switch 
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
            />
          </SettingItem>
          <SettingItem 
            label="Weekly Reports" 
            description="Send weekly activity reports"
          >
            <Switch 
              checked={settings.weeklyReports}
              onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
            />
          </SettingItem>
          <SettingItem 
            label="Application Alerts" 
            description="Notify when new applications are submitted"
          >
            <Switch 
              checked={settings.applicationAlerts}
              onCheckedChange={(checked) => handleSettingChange('applicationAlerts', checked)}
            />
          </SettingItem>
        </SettingSection>

        {/* System Settings */}
        <SettingSection
          title="System Settings"
          description="Advanced system configuration"
          icon={Database}
        >
          <SettingItem 
            label="Maintenance Mode" 
            description="Put the site in maintenance mode"
          >
            <div className="flex items-center gap-2">
              <Switch 
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              />
              {settings.maintenanceMode && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </SettingItem>
          <SettingItem 
            label="Debug Mode" 
            description="Enable debug logging (development only)"
          >
            <Switch 
              checked={settings.debugMode}
              onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
            />
          </SettingItem>
          <SettingItem 
            label="Automatic Backup" 
            description="Enable automatic database backups"
          >
            <Switch 
              checked={settings.autoBackup}
              onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
            />
          </SettingItem>
          <SettingItem 
            label="Backup Frequency" 
            description="How often to create backups"
          >
            <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange('backupFrequency', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </SettingItem>
        </SettingSection>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {saveStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium mb-1">Settings Saved Successfully</p>
                <p className="text-green-700 text-sm">
                  All configuration changes have been applied and saved.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {saveStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium mb-1">Error Saving Settings</p>
                <p className="text-red-700 text-sm">
                  There was an error saving your settings. Please try again.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


