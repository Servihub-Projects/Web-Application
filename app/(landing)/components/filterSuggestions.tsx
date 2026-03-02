import Link from "next/link";

export default function FilterSuggestions() {
    return (
        <ul className="absolute w-full flex flex-col gap-2 rounded-md bg-white left-0 top-24 p-4 max-h-80 overflow-auto">
            <li className="w-full">
                <Link className="w-full block p-2 bg-gray-100 rounded-sm" href="">
                    Item
                </Link>
            </li>
            <li className="w-full">
                <Link className="w-full block p-2 bg-gray-100 rounded-sm" href="">
                    Item
                </Link>
            </li>
        </ul>
    );
}
