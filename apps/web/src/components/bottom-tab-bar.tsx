import { Link, useLocation } from "react-router";

const TABS = [
	{ path: "/", icon: "quiz", label: "测试" },
	{ path: "/history", icon: "history", label: "历史" },
	{ path: "/profile", icon: "person", label: "我的" },
] as const;

export function BottomTabBar() {
	const location = useLocation();

	if (location.pathname === "/quiz") {
		return null;
	}

	return (
		<nav className="fixed right-0 bottom-0 left-0 z-50 border-border border-t bg-white">
			<div className="mx-auto flex h-16 max-w-lg items-center justify-around">
				{TABS.map((tab) => {
					const isActive = location.pathname === tab.path;
					return (
						<Link
							className={`flex flex-col items-center gap-0.5 px-6 py-2 transition-colors ${
								isActive ? "text-primary" : "text-muted-foreground"
							}`}
							key={tab.path}
							to={tab.path}
						>
							<span
								className="material-symbols-outlined text-2xl leading-none"
								style={{
									fontVariationSettings: isActive
										? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24'
										: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24',
								}}
							>
								{tab.icon}
							</span>
							<span className="font-medium text-xs">{tab.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
