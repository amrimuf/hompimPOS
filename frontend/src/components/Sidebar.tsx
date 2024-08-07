import { NavLink } from "react-router-dom";

const Sidebar = () => {
	return (
		<aside className="w-64 bg-gray-800 text-white">
			<nav className="p-6">
				<ul>
					<li>
						<NavLink
							to="/"
							className="block py-2 px-4 hover:bg-gray-700"
						>
							Home
						</NavLink>
					</li>
					<li>
						<NavLink
							to="/about"
							className="block py-2 px-4 hover:bg-gray-700"
						>
							About
						</NavLink>
					</li>
				</ul>
			</nav>
		</aside>
	);
};

export default Sidebar;
