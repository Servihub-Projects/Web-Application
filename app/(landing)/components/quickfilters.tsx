import { ArrowRight } from "lucide-react";

export default function QuickFilters() {
    const filterOptions: string[] = ["Graphic & Design", "Music & Audio", "Video & Animation"];
    return (
        <ul className="list-none w-full max-w-180 mx-auto mt-10 flex justify-center gap-6">
            {filterOptions.map((option, index) => (
                <li key={index} className="border-2 border-gray-500 px-6 py-2 rounded-full flex items-center gap-2">
                    {option} <ArrowRight />
                </li>
            ))}
        </ul>
    );
}
