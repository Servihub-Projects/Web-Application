"use client";

import { SearchIcon } from "lucide-react";
import { useRef } from "react";
import FilterSuggestions from "./filterSuggestions";

export default function SearchBar() {
    const searchBarRef = useRef<HTMLInputElement | null>(null);
    const handleClick = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(searchBarRef.current?.value);
    };
    return (
        <form
            action=""
            className="max-w-300 w-full mx-auto bg-white h-20 mt-10 rounded-lg flex items-center focus-within:outline-2 focus-within:outline-blue-400 focus-within:outline-offset-2 relative">
            <input ref={searchBarRef} type="search" name="search" placeholder="Search for any service" className="w-full h-full px-4 outline-none" />
            <button onClick={handleClick} className="w-16 mx-2 h-16 rounded-full grid place-items-center bg-[var(--primary-color)]">
                <SearchIcon className="w-10 h-10 text-white" />
            </button>
            <FilterSuggestions />
        </form>
    );
}
