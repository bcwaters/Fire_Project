import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Layout from "./Layout";
import { twMerge } from "tailwind-merge";

function App() {
	const regions = [
		"National",
		"Alaska",
		"Northwest",
		"Rocky Mountain",
		"N. California",
		"Southeast",
		"Great Basin",
	] as const;
	const [selectedRegion, setSelectedRegion] =
		useState<(typeof regions)[number]>("National");

	return (
		<div className="h-screen w-screen bg-amber-100 ">
			<nav className="w-full bg-amber-500 p-4 md:hidden flex justify-center item-center">
				<select
					value={selectedRegion}
					className="border-white outline-none text-xl"
					onChange={(e) =>
						setSelectedRegion(
							e.target.value as (typeof regions)[number]
						)
					}
				>
					{regions.map((r) => (
						<option key={r} value={r}>
							{r}
						</option>
					))}
				</select>
			</nav>
			<div className=" h-full w-full flex flex-col p-3 ">
				<div className="w-full bg-white hidden md:flex rounded-t-2xl overflow-clip">
					<div className="w-full  flex">
						{regions.map((r) => (
							<button
								className={twMerge(
									"w-full text-lg  py-5 cursor-pointer",
									r === selectedRegion
										? "border-b-2  border-amber-500 text-amber-700 "
										: "border-b-2  border-gray-300 text-gray-400"
								)}
								onClick={() => setSelectedRegion(r)}
							>
								{r}
							</button>
						))}
					</div>
				</div>

				<div className="flex flex-col w-full flex-1  ">
					<div className="bg-white flex flex-col xl:flex-row xl:divide-x divide-gray-400 rounded-b-2xl flex-1">
						<div className="w-2xl p-3">
							<h1 className="font-bold text-3xl pb-2">
								{selectedRegion}
							</h1>
							<desc>
								{
									"National Fire Activity: \nFire Activity  and Teams  Assigned  Totals  \nInitial attack activity:  Light (134 fires) \nNew large incidents:  2 \nLarge fires contained:  2 \nUncontained large fires:  30 \nCIMTs committed:  14 \nNIMOs committed:  1 \n Nationally, there are 18 fires being managed under a strategy other than full suppression.  Fifteen fires are in \nAlaska.  Three  fires..."
								}
							</desc>
						</div>
						<div className="h-full w-full p-3">
							<div className="grid grid-cols-2 gap-4 h-full">
								<div className="bg-gray-200 animate-pulse rounded"></div>
								<div className="bg-gray-200 animate-pulse rounded"></div>
								<div className="bg-gray-200 animate-pulse rounded"></div>
								<div className="bg-gray-200 animate-pulse rounded"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
