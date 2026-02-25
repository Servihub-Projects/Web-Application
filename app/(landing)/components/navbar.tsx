import Link from "next/link";

export default function NavigationBar() {
    const navRoutes: { routeName: string; routeLink: string }[] = [
        { routeName: "Home", routeLink: "" },
        { routeName: "Services", routeLink: "" },
        { routeName: "Find Work", routeLink: "" },
    ];
    return (
        <nav className="mx-auto container flex justify-between items-center h-14">
            <Link href="/">Logo</Link>
            <ul className="flex justify-between w-80 list-none">
                {navRoutes.map((route, index) => (
                    <li key={index}>
                        <Link href={route.routeLink}>{route.routeName}</Link>
                    </li>
                ))}
            </ul>
            <div>
                <button>Sign Up</button>
            </div>
        </nav>
    );
}
