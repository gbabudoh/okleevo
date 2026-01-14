"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  Calendar,
  CheckSquare,
  Sparkles,
  BarChart3,
  UserCheck,
  Shield,
  Receipt,
  Target,
} from "lucide-react";

const dashboardModules = [
  { icon: Receipt, label: "Invoicing", color: "from-emerald-400 to-emerald-600", iconColor: "text-emerald-600" },
  { icon: BarChart3, label: "Analytics", color: "from-blue-400 to-blue-600", iconColor: "text-blue-600" },
  { icon: Users, label: "CRM", color: "from-purple-400 to-purple-600", iconColor: "text-purple-600" },
  { icon: Calendar, label: "Booking", color: "from-orange-400 to-orange-600", iconColor: "text-orange-600" },
  { icon: Sparkles, label: "AI Tools", color: "from-pink-400 to-pink-600", iconColor: "text-pink-600" },
  { icon: Target, label: "Tasks", color: "from-indigo-400 to-indigo-600", iconColor: "text-indigo-600" },
];

export function HeroAnimation() {
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
      {/* Left Side - Computer */}
      <div className="relative h-[500px]">
        {/* Computer Mockup */}
        <motion.div
          className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
        {/* Laptop Base */}
        <div className="relative">
          {/* Screen */}
          <div className="w-[600px] h-[380px] bg-gray-900 rounded-t-2xl border-8 border-gray-800 shadow-2xl overflow-hidden">
            {/* Screen Content */}
            <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-3">
                {/* Header with Activity */}
                <motion.div
                  className="h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center px-3 gap-2"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, delay: 0.2, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, delay: 0.4, repeat: Infinity }}
                  />
                </motion.div>

                {/* Module Cards with Icons */}
                <div className="grid grid-cols-3 gap-3">
                  {dashboardModules.map((module, i) => (
                    <motion.div
                      key={i}
                      className="h-20 bg-white rounded-lg shadow-md border border-gray-100 p-2 relative overflow-hidden"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {/* Background gradient */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-5`}
                        animate={{ opacity: [0.05, 0.15, 0.05] }}
                        transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
                      />
                      
                      <div className="relative flex items-center gap-2 h-full">
                        <motion.div 
                          className={`w-10 h-10 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center shadow-sm`}
                          animate={{ rotate: [0, 5, 0, -5, 0] }}
                          transition={{ duration: 4, delay: i * 0.2, repeat: Infinity }}
                        >
                          <module.icon className="w-5 h-5 text-white" />
                        </motion.div>
                        <div className="flex-1 space-y-1">
                          <div className={`h-2 ${module.iconColor.replace('text', 'bg')} bg-opacity-30 rounded`}></div>
                          <div className="h-2 bg-gray-100 rounded w-2/3"></div>
                        </div>
                      </div>

                      {/* Activity pulse */}
                      <motion.div
                        className={`absolute top-1 right-1 w-2 h-2 ${module.iconColor.replace('text', 'bg')} rounded-full`}
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Animated People - Agents and Customers */}
                <motion.div
                  className="h-32 bg-white rounded-lg shadow-md border border-gray-100 p-4 relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.5 }}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="grid grid-cols-8 h-full">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="border-r border-gray-300"></div>
                      ))}
                    </div>
                  </div>

                  {/* Moving Avatars */}
                  <div className="relative h-full">
                    {/* Agent 1 */}
                    <motion.div
                      className="absolute"
                      initial={{ left: "5%", top: "20%" }}
                      animate={{ 
                        left: ["5%", "30%", "50%", "30%", "5%"],
                        top: ["20%", "40%", "20%", "60%", "20%"]
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg border-2 border-white">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                    </motion.div>

                    {/* Customer 1 */}
                    <motion.div
                      className="absolute"
                      initial={{ left: "70%", top: "30%" }}
                      animate={{ 
                        left: ["70%", "50%", "30%", "50%", "70%"],
                        top: ["30%", "50%", "30%", "10%", "30%"]
                      }}
                      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg border-2 border-white">
                        <UserCheck className="w-5 h-5 text-white" />
                      </div>
                    </motion.div>

                    {/* Agent 2 */}
                    <motion.div
                      className="absolute"
                      initial={{ left: "85%", top: "50%" }}
                      animate={{ 
                        left: ["85%", "65%", "45%", "65%", "85%"],
                        top: ["50%", "30%", "60%", "40%", "50%"]
                      }}
                      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg border-2 border-white">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                    </motion.div>

                    {/* Customer 2 */}
                    <motion.div
                      className="absolute"
                      initial={{ left: "20%", top: "60%" }}
                      animate={{ 
                        left: ["20%", "40%", "60%", "40%", "20%"],
                        top: ["60%", "20%", "50%", "70%", "60%"]
                      }}
                      transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg border-2 border-white">
                        <UserCheck className="w-5 h-5 text-white" />
                      </div>
                    </motion.div>

                    {/* Agent 3 */}
                    <motion.div
                      className="absolute"
                      initial={{ left: "50%", top: "10%" }}
                      animate={{ 
                        left: ["50%", "70%", "50%", "30%", "50%"],
                        top: ["10%", "40%", "70%", "40%", "10%"]
                      }}
                      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg border-2 border-white">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                    </motion.div>

                    {/* Connection lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                      <motion.line
                        x1="10%" y1="30%" x2="70%" y2="40%"
                        stroke="url(#gradient1)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: [0, 1, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Laptop Bottom */}
          <div className="w-[600px] h-4 bg-gray-300 rounded-b-xl -mt-1 shadow-lg"></div>
          <div className="w-[610px] h-2 bg-gray-400 rounded-b-2xl shadow-xl mx-auto"></div>
        </div>
      </motion.div>
      </div>

      {/* Right Side - USP Messaging */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Run Your Entire Business<br />from One Dashboard
            </h2>
          </motion.div>
          
          <motion.p
            className="text-xl text-gray-600 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            One platform, zero headaches. All the tools you need to manage and grow your business, without the juggling act.
          </motion.p>
        </div>

        {/* USP Features */}
        <div className="space-y-4">
          {[
            { icon: CheckSquare, text: "20 Integrated Modules", color: "text-emerald-500", bg: "bg-emerald-50" },
            { icon: DollarSign, text: "Just £19.99/month - No Hidden Fees", color: "text-blue-500", bg: "bg-blue-50" },
            { icon: Sparkles, text: "AI-Powered Tools Included", color: "text-purple-500", bg: "bg-purple-50" },
            { icon: Shield, text: "UK-Based & GDPR Compliant", color: "text-orange-500", bg: "bg-orange-50" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`p-3 ${feature.bg} rounded-lg`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <span className="text-lg font-medium text-gray-800">{feature.text}</span>
            </motion.div>
          ))}
        </div>


      </motion.div>
    </div>
  );
}
