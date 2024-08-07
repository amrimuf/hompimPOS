import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<div className="flex flex-1">
				<Sidebar />
				<main className="flex-1 p-6 bg-gray-100">{children}</main>
			</div>
		</div>
	);
};
export default Layout;
