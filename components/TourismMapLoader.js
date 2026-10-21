"use client";

import dynamic from "next/dynamic";

const TourismMap = dynamic(() => import("@/components/TourismMap"), {
  ssr: false,
  loading: () => <p>Loading tourism map...</p>,
});

export default function TourismMapLoader() {
  return <TourismMap />;
}
