export default defineAppConfig({
	pages: ["pages/index/index", "pages/history/index", "pages/auth/index"],
	subPackages: [
		{
			root: "pages/quiz",
			pages: ["index"],
		},
		{
			root: "pages/result",
			pages: ["index"],
		},
		{
			root: "pages/detail",
			pages: ["index"],
		},
		{
			root: "pages/comparison",
			pages: ["index"],
		},
		{
			root: "pages/privacy",
			pages: ["index"],
		},
		{
			root: "pages/terms",
			pages: ["index"],
		},
	],
	preloadRule: {
		"pages/index/index": {
			network: "all",
			packages: ["pages/quiz"],
		},
		"pages/quiz/index": {
			network: "all",
			packages: ["pages/result"],
		},
	},
	window: {
		backgroundTextStyle: "light",
		navigationBarBackgroundColor: "#f9f9ff",
		navigationBarTitleText: "DISC 职业性格测评",
		navigationBarTextStyle: "black",
		backgroundColor: "#f9f9ff",
	},
	tabBar: {
		color: "#64748b",
		selectedColor: "#0058be",
		backgroundColor: "#ffffff",
		borderStyle: "white",
		list: [
			{
				pagePath: "pages/index/index",
				text: "首页",
				iconPath: "assets/icons/home.png",
				selectedIconPath: "assets/icons/home-active.png",
			},
			{
				pagePath: "pages/history/index",
				text: "历史",
				iconPath: "assets/icons/history.png",
				selectedIconPath: "assets/icons/history-active.png",
			},
			{
				pagePath: "pages/auth/index",
				text: "我的",
				iconPath: "assets/icons/profile.png",
				selectedIconPath: "assets/icons/profile-active.png",
			},
		],
	},
});
