"use client";
import Link from "next/link";
// chapter /  recorded lecture  / add note
const categories = [
  {
    key: "/dashboard/track-list/track/subject-list/subject/exam",
    name: "Chapter Management",
    subCount: 4,
    description: "Website Design & Develop the website with web applications ",
    color: "bg-violet-500",
    code: "GD",
    tags: [
      { label: "Photoshop", color: "bg-indigo-100 text-indigo-700 font-semibold" },
      { label: "Adobe Illustrator", color: "bg-red-100 text-red-700 font-semibold" },
      { label: "Logo Design", color: "bg-cyan-100 text-cyan-700 font-semibold" },
      { label: "Drawing", color: "bg-yellow-100 text-yellow-700 font-semibold" },
      { label: "Figma", color: "bg-slate-100 text-slate-700 font-semibold" },
    ],
  },
  {
    key: "",
    name: " Recorded lecture",
    subCount: 5,
    description: "Website Design & Develop the website with Design",
    color: "bg-yellow-400",
    code: "WD",
    tags: [
      { label: "Responsive Design", color: "bg-indigo-100 text-indigo-700 font-semibold" },
      { label: "Wordpress Customization", color: "bg-red-100 text-red-700 font-semibold" },
      { label: "Theme Development", color: "bg-cyan-100 text-cyan-700 font-semibold" },
      { label: "Bootstrap", color: "bg-yellow-100 text-yellow-700 font-semibold" },
      { label: "HTML & CSS Grid", color: "bg-slate-100 text-slate-700 font-semibold" },
    ],
  },
  {
    key: "",
    name: "Add Notes",
    subCount: 4,
    description: "Website Design & Develop the website with web applications ",
    color: "bg-red-300",
    code: "GD",
    tags: [
      { label: "Photoshop", color: "bg-indigo-100 text-indigo-700 font-semibold" },
      { label: "Adobe Illustrator", color: "bg-red-100 text-red-700 font-semibold" },
      { label: "Logo Design", color: "bg-cyan-100 text-cyan-700 font-semibold" },
      { label: "Drawing", color: "bg-yellow-100 text-yellow-700 font-semibold" },
      { label: "Figma", color: "bg-slate-100 text-slate-700 font-semibold" },
    ],
  },

];

export default function TrackCategoryPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-xl font-bold mb-1">Subject Category</h1>
      <p className="text-gray-500 mb-6 text-sm">You have total {categories.length} Categories</p>
      <div className="flex flex-wrap gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            href={`${cat.key}`}
            className="block w-[500px] group cursor-pointer"
          >
            <div className="flex flex-col h-full">
              <div className="flex flex-row items-start bg-white   border border-slate-200 shadow-sm  transition p-6 h-full">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold text-lg ${cat.color} mr-4 mt-1`}>{cat.code}</div>
                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-lg text-slate-800 group-hover:text-blue-700 transition leading-tight">{cat.name}</div>
                      <div className="text-sm text-slate-600  mb-2">{cat.subCount} SubCategories</div>
                    </div>
                    <div className="ml-2 text-slate-300 text-2xl font-bold leading-none select-none">&#8230;</div>
                  </div>
                  <div className="text-slate-700 text-sm mt-2 mb-7 max-w-2xl leading-relaxed">
                    {cat.description}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {cat.tags.map((tag) => (
                      <span key={tag.label} className={`px-3 py-1 rounded text-xs ${tag.color}`}>{tag.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
