import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./styles/App.css";
import { useState, useEffect } from "react";
import fireGraphIcon from "./assets/fire_graph_icon.png";
import { regions } from "./RegionContext";
import cn from "./utils/classNames";

function Layout() {
	// Use a known working date instead of today's date
	const today = "20250728"; // Hardcoded for testing
	// const { regionNames, loading: regionNamesLoading } = useRegionNames();

	// Dynamically generate regions array from regionNames keys

	const location = useLocation();
	const navigate = useNavigate();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Determine selected region from the current path
	const match = location.pathname.match(/^\/region\/(\d+)/);
	const selectedRegion = match ? match[1] : "";

	console.log({ selectedRegion });

	// Check if we're on the home page
	const isHomePage = location.pathname === "/";

	const handleRegionChange = (e) => {
		const region = e.target.value;
		if (region) {
			navigate(`/region/${region}`);
		}
	};

	const handleMobileMenuOpen = () => setIsMobileMenuOpen(true);
	const handleMobileMenuClose = () => setIsMobileMenuOpen(false);
	const handleMobileRegionSelect = (regionId) => {
		navigate(`/region/${regionId}`);
		setIsMobileMenuOpen(false);
	};

	return (
		<div className="h-screen w-screen   overflow-auto bg-amber-100">
			<div className="absolute right-0 bottom-0 bg-white py-1 px-2 border-t border-l">
				Updated Daily at 7:30am MDT
			</div>
			<nav className="flex justify-between items-center flex-row ">
				<div className="px-1 ">
					<img
						src={fireGraphIcon}
						alt="Logo"
						className="h-12"
						onClick={() => navigate("/")}
					/>
				</div>
				<select
					onChange={handleRegionChange}
					value={selectedRegion}
					className="block md:hidden"
				>
					<option value="" disabled>
						Region
					</option>
					{regions.map((region) => (
						<option
							key={region}
							value={region}
							className="region-dropdown-option"
						>
							{region}
						</option>
					))}
				</select>
			</nav>
			{/* Mobile modal */}
			{isMobileMenuOpen && (
				<div
					className="region-modal-overlay"
					onClick={handleMobileMenuClose}
				>
					<div
						className="region-modal"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="region-modal-header">
							<span>Select Region</span>
							<button
								className="region-modal-close"
								onClick={handleMobileMenuClose}
								aria-label="Close"
							>
								&times;
							</button>
						</div>
						<ul className="region-modal-list">
							{regions.map((region) => (
								<li key={region}>
									<button
										className="region-modal-option"
										onClick={() =>
											handleMobileRegionSelect(region)
										}
									>
										{region}
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
			<main className="flex flex-col p-3">
				<nav className="bg-white rounded-t-xl">
					<div className=" hidden md:block w-full">
						<ul className="flex flex-row justify-evenly">
							{regions.map((region, idx) => (
								<li
									key={region}
									className={cn(
										"px-3 py-5 border-b-2 text-center font-semibold cursor-pointer w-full",
										idx === parseInt(selectedRegion)
											? "border-amber-700 text-amber-900 bg-amber-300"
											: "border-amber-400 text-amber-900 opacity-75"
									)}
									onClick={() =>
										handleMobileRegionSelect(idx)
									}
								>
									{region}
								</li>
							))}
						</ul>
					</div>
				</nav>
				<Outlet />
			</main>
		</div>
	);
}

export default Layout;
