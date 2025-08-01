function Summary() {
	return (
		<div>
			<div id="accordion-collapse" data-accordion="collapse">
				<h2 id="accordion-collapse-heading-1">
					<button
						type="button"
						className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-800 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
						data-accordion-target="#accordion-collapse-body-1"
						aria-expanded="true"
						aria-controls="accordion-collapse-body-1"
					>
						<span>Summary</span>
						<svg
							data-accordion-icon
							className="w-3 h-3 rotate-180 shrink-0"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 10 6"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5 5 1 1 5"
							/>
						</svg>
					</button>
				</h2>

				<span className="px-6">
					National Fire Activity: \nFire Activity and Teams Assigned
					Totals \nInitial attack activity: Light (168 fires) \nNew
					large incidents: 4 \nLarge fires contained: 1 \nUncontained
					large fires: 33 \nCIMTs committed: 9 \nNIMOs committed: 1 \n
					Nationally, there are eighteen fires being managed under a
					strategy other than full suppression. Fifteen fires \nare in
					Alaska. Three fires are in the Lower 48. \n \nFires not
					managed under a full suppression strategy or fires managed
					under a full suppression strategy but \nutilizing a
					combination of tactics \u2013 such as monitoring,
					confinement or point zone protection \u2013 achieve specific
					\nfire management objectives while balancing the most
					effective utilization of resource s. Fires m anaged as
					\ndescribed above are identified in the situational report
					as Comp fires. Additional information including
					\ndefinitions can be found in the NWCG glossary or here. \n
					\nUnderstanding the IMSR \n \nIMSR Map \n \nOn July 27, a
					firefighter from the Murdo Volunteer Fire Department was
					fatally injured in a vehicle accident \nwhile responding to
					the War Creek fire in Jones County , South Dakota . The
					firefighting community expresses \nits condolences to the
					family and friends of the deceased. \n \nTwo MAFFS C -130
					airtankers and support personnel have been deployed to
					Klamath Falls, OR to support \nwildland fire operations
					nationally . Respective units are from the 302nd Air Wing (
					Peterson Space Force Base , \nCO) and 146th Airlift Wing (CA
					Air National Guard).
				</span>
			</div>
		</div>
	);
}

export default Summary;
