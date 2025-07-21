"use client"

import React, { useState, useEffect } from 'react';
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
  EyeOff,
  Loader2,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEnhancedSettingsData, updateEnhancedSettingsData } from '../enhanced-actions';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    backupFrequency: 'daily',
    passwordPolicy: true,
    logLevel: 'info',
    apiRateLimit: 100
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const result = await getEnhancedSettingsData();
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else if (result.settings) {
      setSettings({
        ...result.settings,
        theme: result.settings.theme || 'light',
        primaryColor: result.settings.primaryColor || '#3B82F6',
        accentColor: result.settings.accentColor || '#10B981'
      });
    }
    setIsLoading(false);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    const result = await updateEnhancedSettingsData(settings);
    if (!result.error) {
      setSaveStatus('success');
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } else {
      setSaveStatus('error');
      setMessage({ type: 'error', text: 'Error saving settings. Please try again.' });
    }
    setIsLoading(false);
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
    <div className="admin-page-content space-y-6 p-0 m-0">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Configure system settings and preferences.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={fetchSettings}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              className="bg-[hsl(var(--novakinetix-primary))] text-white hover:bg-[hsl(var(--novakinetix-dark))]"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Message Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => handleSettingChange('siteName', e.target.value)}
                      placeholder="Novakinetix Academy"
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.siteDescription}
                      onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                      placeholder="Empowering students through STEM education"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                      placeholder="contact@novakinetix.com"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                    />
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="1440"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="twoFactorAuth"
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                    />
                    <Label htmlFor="twoFactorAuth">Require Two-Factor Authentication</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="passwordPolicy"
                      checked={settings.passwordPolicy}
                      onCheckedChange={(checked) => handleSettingChange('passwordPolicy', checked)}
                    />
                    <Label htmlFor="passwordPolicy">Enforce Strong Password Policy</Label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="notifications" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pushNotifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="adminAlerts"
                      checked={settings.applicationAlerts}
                      onCheckedChange={(checked) => handleSettingChange('applicationAlerts', checked)}
                    />
                    <Label htmlFor="adminAlerts">Admin Alert Notifications</Label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="logLevel">Log Level</Label>
                    <Select value={settings.logLevel} onValueChange={(value) => handleSettingChange('logLevel', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="debugMode"
                      checked={settings.debugMode}
                      onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                    />
                    <Label htmlFor="debugMode">Debug Mode</Label>
                  </div>
                  <div>
                    <Label htmlFor="apiRateLimit">API Rate Limit (requests per minute)</Label>
                    <Input
                      id="apiRateLimit"
                      type="number"
                      value={settings.apiRateLimit}
                      onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
                      min="10"
                      max="1000"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


