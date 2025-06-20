'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

// Define the type for approvals
interface Approval {
  id: string;
  intern_name: string;
  internship_title: string;
  email: string;
  applied_at: string;
  status: string;
}

const approvals: Approval[] = [];

export default function InternApprovalsPage() {
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Intern Approvals</h1>
            <p className="text-gray-600">Review and approve intern applications.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
              Refresh
            </Button>
          </div>
        </div>
      </motion.header>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {approvals.map((approval) => (
          <Card key={approval.id} className="border-0 shadow-md rounded-lg bg-white">
            <CardHeader className="pb-1">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold mb-0 truncate">{approval.intern_name}</CardTitle>
                  <Badge className={approval.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{approval.status}</Badge>
                </div>
                <CardDescription className="text-xs text-gray-500 truncate">
                  {approval.internship_title}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span>{approval.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span>Applied on {formatDate(approval.applied_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}


