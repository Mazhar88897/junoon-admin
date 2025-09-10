
"use client";
import Link from "next/link";
// chapter /  recorded lecture  / add note
import { BookOpenCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
const categories = [
  
  {
    key: "/dashboard/track-list/track/university/university-cards/all-tests",
    name: " University Exam",
    subCount: 5,
    description: "Create a university exam for Entire University",
    color: "bg-yellow-400",
    code: "WD",
    icon: <BookOpenCheck />,

  },
 

];
// by  chapter / grand test
export default function TrackCategoryPage() {
  const router = useRouter();
  const [trackName, setTrackName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [universityName, setUniversityName] = useState("");

  useEffect(() => {
    // Only access sessionStorage on the client side
    if (typeof window !== 'undefined') {
      setTrackName(sessionStorage.getItem("track_name") || "");
      setSubjectName(sessionStorage.getItem("subject_name") || "");
      setUniversityName(sessionStorage.getItem("university_name") || "");
    }
  }, []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
          <div className="max-w-sm p-4 rounded-2xl shadow-md bg-white border border-gray-200 mb-6">
        <p className="text-sm font-medium">
          <span className="font-medium text-gray-700">Track:</span>{" "}
            {trackName}
        </p>
        <p className="text-sm mt-2 font-medium">
          <span className="font-medium text-gray-700">University:</span>{" "}
            {universityName}
        </p>
      </div>
      <h1 className="text-xl font-bold mb-6">University Exams</h1>
      {/* <p className="text-gray-500 mb-6 text-sm">You have total {categories.length} Categories</p> */}
      <div className="flex flex-wrap gap-4">
        {categories.map((cat) => (
            <div
            key={cat.key}
            //  href={`${cat.key}`}
            onClick={() => {
              sessionStorage.setItem("is_practice_exam_university", "false");
              console.log("Setting is_practice_exam_university to false");
              console.log("Value after setting:", sessionStorage.getItem("is_practice_exam_university"));
              router.push(cat.key);
            }}
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
          </div>
        ))}
      </div>

      <div className="py-5"></div>
      <h1 className="text-xl font-bold mb-6  mb-1">Practice University Exams</h1>
      {/* <p className="text-gray-500 mb-6 text-sm">You have total {categories.length} Categories</p> */}
      <div className="flex flex-wrap gap-4">
        {categories.map((cat) => (
         <div
         key={cat.key}
         //  href={`${cat.key}`}
         onClick={() => {
          sessionStorage.setItem("is_practice_exam_university", "true");
          console.log("Setting is_practice_exam_university to true");
          console.log("Value after setting:", sessionStorage.getItem("is_practice_exam_university"));
          router.push(cat.key);
        }}
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
       </div>
        ))}
      </div>
    </div>
  );
}
