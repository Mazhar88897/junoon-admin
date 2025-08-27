"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, GraduationCap } from "lucide-react";

const allCategories = [
  {
    key: "/dashboard/track-list/track/subject-list",
    name: "Subject Management",
    subCount: 4,
    description: "Manage subjects and related data in this track.",
    color: "bg-violet-500",
    icon: <BookOpen />,
    code: "GD",
    // tags: [
    //   { label: "Photoshop", color: "bg-indigo-100 text-indigo-700 font-semibold" },
    //   { label: "Adobe Illustrator", color: "bg-red-100 text-red-700 font-semibold" },
    //   { label: "Logo Design", color: "bg-cyan-100 text-cyan-700 font-semibold" },
    //   { label: "Drawing", color: "bg-yellow-100 text-yellow-700 font-semibold" },
    //   { label: "Figma", color: "bg-slate-100 text-slate-700 font-semibold" },
    // ],
  },
  {
    key: "university",
    name: " University Management",
    subCount: 5,
    description: "Manage universities associated with this track",
    color: "bg-yellow-400",
    icon: <GraduationCap />,
    code: "WD",
    // tags: [
    //   { label: "Responsive Design", color: "bg-indigo-100 text-indigo-700 font-semibold" },
    //   { label: "Wordpress Customization", color: "bg-red-100 text-red-700 font-semibold" },
    //   { label: "Theme Development", color: "bg-cyan-100 text-cyan-700 font-semibold" },
    //   { label: "Bootstrap", color: "bg-yellow-100 text-yellow-700 font-semibold" },
    //   { label: "HTML & CSS Grid", color: "bg-slate-100 text-slate-700 font-semibold" },
    // ],
  },
];

export default function TrackCategoryPage() {
  const [categories, setCategories] = useState(allCategories);
  const [track, setTrack] = useState<any | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasUniversity = sessionStorage.getItem("has_university") === "true";
      setCategories(
        hasUniversity
          ? allCategories
          : allCategories.filter((cat) => cat.key !== "university")
      );
      const selectedTrack = sessionStorage.getItem("selected_track");

      if (selectedTrack) {
        try {
          setTrack(JSON.parse(selectedTrack));
        } catch (e) {
          console.warn("Failed to parse selected_track", e);
        }
      }

    }
  }, []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      
      <div className="w-full rounded-2xl shadow-md overflow-hidden bg-white border">
      <div className="flex flex-col md:flex-row">
        {/* Left Image */}
        <div className="w-full md:w-60 h-48 md:h-auto">
          <img
            src={track?.thumbnail}
            alt={track?.name}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Right Content */}
        <div className="p-6 flex flex-col justify-start flex-1">
          <h5 className="text-2xl font-bold text-gray-900">{track?.name}</h5>

          {/* Description */}
          <div
            className={`text-base text-gray-600 mt-3 leading-relaxed transition-all duration-300 ${
              expanded ? "line-clamp-none" : "line-clamp-1"
            }`}
            dangerouslySetInnerHTML={{ __html: track?.description || "" }}
          />

          {/* Toggle Button */}
          {track?.description && (
            <button
              className="text-sm text-blue-600 mt-2 hover:underline self-start"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "See less" : "See more"}
            </button>
          )}
        </div>
      </div>
    </div>

    <br /> <br />




      
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
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold text-lg bg-[#1A4D2E] mr-4 mt-1`}><span className="text-2xl text-white">{cat.icon}</span></div>
                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-lg text-[#1A4D2E] transition leading-tight">{cat.name}</div>
                      {/* <div className="text-sm text-slate-600  mb-2">{cat.subCount} SubCategories</div> */}
                    </div>
                    {/* <div className="ml-2 text-slate-300 text-2xl font-bold leading-none select-none">&#8230;</div> */}
                  </div>
                  <div className="text-slate-700 text-sm mt-2 mb-7 max-w-2xl leading-relaxed">
                    {cat.description}
                  </div>
                  {/* {cat.tags && <div className="flex flex-wrap gap-2 mt-2">
                    {cat.tags.map((tag) => (
                      <span key={tag.label} className={`px-3 py-1 rounded text-xs ${tag.color}`}>{tag.label}</span>
                    ))}
                  </div>} */}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
