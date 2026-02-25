import FilterSuggestions from "./components/filterSuggestions";
import QuickFilters from "./components/quickfilters";
import SearchBar from "./components/searchbar";

export default function LandingPage() {
    return (
        <main className="mx-auto container mt-10">
            <div className="min-h-160 bg-gray-200 rounded-xl">
                <h1 className="text-8xl ml-10 pt-20">
                    Hire Smarter, <br /> Work better
                </h1>
                <SearchBar />

                <QuickFilters />
            </div>
        </main>
    );
}
