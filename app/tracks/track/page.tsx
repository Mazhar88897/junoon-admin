"use client"
import React from "react";

const Page = () => {
  const handleClick = () => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      const track_name = sessionStorage.getItem("track_name");
      const id_track = sessionStorage.getItem("id_track");
      console.log("track_name:", track_name);
      console.log("id_track:", id_track);
    }
  };

  return (
    <button onClick={handleClick} className="p-2 bg-blue-500 text-white rounded">
      Click Me
    </button>
  );
};

export default Page;
