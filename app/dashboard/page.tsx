"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, TrendingDown, Star, Mail, Phone, BookOpen, UserCircle, PieChart } from "lucide-react";
import Image from "next/image";

// --- DATA LISTS ---

const studentsEnrollment = {
  thisMonth: { value: 5490, change: -16.93 },
  thisWeek: { value: 1480, change: 4.26 },
  chart: [8, 6, 7, 5, 9, 6, 8, 7, 6, 8, 10, 7, 8, 9],
};

const topCategories = [
  { name: "Web Development", color: "bg-orange-500", light: "bg-orange-100", value: 40, rest: 60, info: "Most popular, 1200 sales" },
  { name: "Mobile Application", color: "bg-blue-500", light: "bg-blue-100", value: 35, rest: 65, info: "800 sales" },
  { name: "Graphics Design", color: "bg-green-400", light: "bg-green-100", value: 50, rest: 50, info: "950 sales" },
  { name: "Database", color: "bg-indigo-700", light: "bg-indigo-200", value: 70, rest: 30, info: "1500 sales" },
  { name: "Marketing", color: "bg-teal-400", light: "bg-teal-100", value: 35, rest: 65, info: "700 sales" },
  { name: "Machine Learning", color: "bg-pink-400", light: "bg-pink-100", value: 30, rest: 70, info: "600 sales" },
  { name: "Data Science", color: "bg-violet-700", light: "bg-violet-300", value: 30, rest: 70, info: "650 sales" },
];

const salesStats = {
  total: { value: 9495.2, change: 4.63 },
  week: { value: 2995.81, change: 7.13 },
};

const topCourses = [
  { code: "UI/X", name: "UI/UX Design with Adobe XD", price: 85, sales: 25, revenue: 2125 },
  { code: "AD", name: "Android App Development", price: 95, sales: 10, revenue: 1710 },
  { code: "WD", name: "Wordpress Development", price: 70, sales: 15, revenue: 1050 },
  { code: "ML", name: "Machine Learning", price: 110, sales: 10, revenue: 990 },
  { code: "RD", name: "Responsive Design", price: 80, sales: 12, revenue: 960 },
];

const topInstructors = [
  { name: "Abu Bin Ishtiyak", email: "info@softnio.com", reviews: 25, rating: 5 },
  { name: "Ashley Lawson", email: "ashley@softnio.com", reviews: 22, rating: 4.5 },
  { name: "Jane Montgomery", email: "jane84@example.com", reviews: 19, rating: 4.5 },
  { name: "Larry Henry", email: "larry108@example.com", reviews: 24, rating: 4 },
];

const supportRequests = [
  { name: "Vincent Lopez", message: "Thanks for contact us with your issues...", time: "6 min ago", avatar: "/public/avatar1.png" },
  { name: "Daniel Moore", message: "Thanks for contact us with your issues...", time: "2 Hours ago", avatar: null },
  { name: "Larry Henry", message: "Thanks for contact us with your issues...", time: "3 Hours ago", avatar: "/public/avatar2.png" },
];

const activeStudents = {
  monthly: { value: 9280, change: 4.63 },
  weekly: { value: 2690, change: -1.92 },
  daily: { value: 940, change: 3.45 },
  chart: [8, 9, 7, 6, 8, 7, 5, 8, 9, 10, 8, 7, 9, 8, 7, 8, 9, 10, 8, 7, 9, 8, 7, 8, 9, 10, 8, 7, 9, 8],
};

const trafficSources = [
  { name: "Organic Search", value: 4305, color: "bg-blue-400" },
  { name: "Referrals", value: 482, color: "bg-pink-300" },
  { name: "Social Media", value: 859, color: "bg-purple-300" },
  { name: "Others", value: 138, color: "bg-yellow-300" },
];

// --- DASHBOARD PAGE ---

export default function DashboardPage() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-gray-500 mb-6">Welcome to Learning Management Dashboard.</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Students Enrollment */}
          <Card className="col-span-2">
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">Students Enrolment</CardTitle>
                <CardDescription className="text-sm">In last 30 days enrolment of students</CardDescription>
              </div>
              <div className="text-gray-300"><svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" opacity=".3"/></svg></div>
            </CardHeader>
            <CardContent className="flex flex-row items-end justify-between pt-0 pb-4">
              {/* Stats */}
              <div className="flex flex-row gap-12 items-end">
                <div className="flex flex-col items-start">
                  <div className="text-3xl font-bold">{studentsEnrollment.thisMonth.value}</div>
                  <div className="text-sm flex items-center gap-1 text-red-500 font-semibold">
                    ↓ {studentsEnrollment.thisMonth.change}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">This Month</div>
                </div>
                <div className="flex flex-col items-start">
                  <div className="text-2xl font-bold">{studentsEnrollment.thisWeek.value}</div>
                  <div className="text-sm flex items-center gap-1 text-green-500 font-semibold">
                    ↑ {studentsEnrollment.thisWeek.change}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">This Week</div>
                </div>
              </div>
              {/* Bar Chart */}
              <div className="flex-1 flex items-end justify-end h-24 ml-8">
                <div className="flex items-end gap-2 w-full max-w-[320px]">
                  {studentsEnrollment.chart.map((v, i, arr) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-4 rounded-t ${i === arr.length - 1 ? 'bg-blue-500' : 'bg-blue-200'} transition-all`}
                          style={{ height: `${v * 17}px` }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>Day {i + 1}: {v * 10} students</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Top Categories */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
              <CardDescription>In last 15 days buy and sells overview.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Bars */}
                <div className="flex-1 space-y-4 w-full max-w-md">
                  {topCategories.map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex w-full h-3 rounded overflow-hidden cursor-pointer">
                            <div className={`${cat.color}`} style={{ width: `${cat.value}%` }} />
                            <div className={`${cat.light}`} style={{ width: `${cat.rest}%` }} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{cat.info}</TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>
                {/* Legend */}
                <div className="flex flex-col gap-3 min-w-[160px]">
                  {topCategories.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded ${cat.color}`} />
                      <span className="text-xs text-gray-700">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Sales Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Sales</CardTitle>
              <CardDescription>vs. last month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${salesStats.total.value.toLocaleString()}</div>
              <div className="text-sm text-green-500 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> {salesStats.total.change}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>This week so far</CardTitle>
              <CardDescription>vs. last week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${salesStats.week.value.toLocaleString()}</div>
              <div className="text-sm text-green-500 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> {salesStats.week.change}%
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Courses, Instructors, Support Requests */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Top Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Top Courses</CardTitle>
              <CardDescription>Weekly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCourses.map((course) => (
                  <div key={course.code} className="flex items-center justify-between">
                    <Badge className="mr-2">{course.code}</Badge>
                    <div className="flex-1">
                      <div className="font-medium">{course.name}</div>
                      <div className="text-xs text-gray-400">${course.price.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${course.revenue.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{course.sales} Sold</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Top Instructors */}
          <Card>
            <CardHeader className="flex-row justify-between items-center">
              <CardTitle>Top Instructors</CardTitle>
              <Button variant="link" className="ml-auto text-xs p-0 h-auto">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topInstructors.map((inst) => (
                  <div key={inst.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                      {inst.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{inst.name}</div>
                      <div className="text-xs text-gray-400">{inst.email}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(Math.floor(inst.rating))].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                      {inst.rating % 1 !== 0 && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50" />}
                    </div>
                    <div className="text-xs text-gray-400">{inst.reviews} Reviews</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Support Requests */}
          <Card>
            <CardHeader className="flex-row justify-between items-center">
              <CardTitle>Support Requests</CardTitle>
              <Button variant="link" className="ml-auto text-xs p-0 h-auto">All Requests</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {supportRequests.map((req, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {req.avatar ? (
                      <Image src={req.avatar} alt={req.name} width={32} height={32} className="rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                        {req.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{req.name}</div>
                      <div className="text-xs text-gray-400">{req.message}</div>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">{req.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Active Students & Traffic Sources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Students */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Active Students</CardTitle>
              <CardDescription>How do your students visited in the time.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-8 mb-4">
                <div>
                  <div className="text-2xl font-bold">{(activeStudents.monthly.value/1000).toFixed(2)}K</div>
                  <div className="text-sm flex items-center gap-1 text-green-500">
                    <TrendingUp className="w-4 h-4" /> {activeStudents.monthly.change}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Monthly</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{(activeStudents.weekly.value/1000).toFixed(2)}K</div>
                  <div className="text-sm flex items-center gap-1 text-red-500">
                    <TrendingDown className="w-4 h-4" /> {activeStudents.weekly.change}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Weekly</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{(activeStudents.daily.value/1000).toFixed(2)}K</div>
                  <div className="text-sm flex items-center gap-1 text-green-500">
                    <TrendingUp className="w-4 h-4" /> {activeStudents.daily.change}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Daily (Avg)</div>
                </div>
              </div>
              {/* Bar Chart */}
              <div className="flex items-end h-24 gap-1">
                {activeStudents.chart.map((v, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div className="w-2 rounded bg-blue-200 hover:bg-blue-400 transition-all" style={{ height: `${v * 6}px` }} />
                    </TooltipTrigger>
                    <TooltipContent>{`Day ${i + 1}: ${v * 100} students`}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>01 Jan, 2020</span>
                <span>30 Jan, 2020</span>
              </div>
            </CardContent>
          </Card>
          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>30 Days</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Pie Chart (simple ring) */}
              <div className="flex items-center gap-4">
                <div className="relative w-28 h-28">
                  {/* Pie chart segments as colored rings */}
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    {(() => {
                      let total = trafficSources.reduce((sum, s) => sum + s.value, 0);
                      let acc = 0;
                      return trafficSources.map((src, i) => {
                        const val = (src.value / total) * 100;
                        const dash = `${val} ${100 - val}`;
                        const offset = acc;
                        acc += val;
                        return (
                          <Tooltip key={src.name}>
                            <TooltipTrigger asChild>
                              <circle
                                cx="18" cy="18" r="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="6"
                                strokeDasharray={dash}
                                strokeDashoffset={100 - offset}
                                className={src.color}
                                style={{ color: "currentColor" }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>{src.name}: {src.value}</TooltipContent>
                          </Tooltip>
                        );
                      });
                    })()}
                  </svg>
                </div>
                <div className="flex-1 space-y-2">
                  {trafficSources.map((src) => (
                    <div key={src.name} className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full inline-block ${src.color}`} />
                      <span className="text-xs text-gray-700 flex-1">{src.name}</span>
                      <span className="font-semibold text-xs">{src.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2">Traffic channels have beed generating the most traffics over past days.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
