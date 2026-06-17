import type { UserConfigExport } from "@tarojs/cli";

const config: UserConfigExport = {
	projectName: "disc-personality-test",
	date: "2026-06-15",
	designWidth: 750,
	deviceRatio: {
		640: 2.34 / 2,
		750: 1,
		828: 1.81 / 2,
	},
	sourceRoot: "src",
	outputRoot: "dist",
	plugins: ["@tarojs/plugin-framework-react"],
	alias: {
		// biome-ignore lint/correctness/noGlobalDirnameFilename: CommonJS
		"@": require("path").resolve(__dirname, "..", "src"),
		// biome-ignore lint/correctness/noGlobalDirnameFilename: CommonJS
		"react/jsx-runtime": require("path").resolve(
			__dirname,
			"..",
			"node_modules",
			"react",
			"jsx-runtime.js"
		),
		// biome-ignore lint/correctness/noGlobalDirnameFilename: CommonJS
		"react/jsx-dev-runtime": require("path").resolve(
			__dirname,
			"..",
			"node_modules",
			"react",
			"jsx-dev-runtime.js"
		),
		// biome-ignore lint/correctness/noGlobalDirnameFilename: CommonJS
		react: require("path").resolve(__dirname, "..", "node_modules", "react"),
		"react-dom": "@tarojs/react",
	},
	defineConstants: {
		"process.env.TARO_APP_SERVER_URL": JSON.stringify(
			process.env.TARO_APP_SERVER_URL ?? "http://127.0.0.1:3000"
		),
		"process.env.TARO_APP_SUBSCRIBE_TEMPLATE_ID": JSON.stringify(
			process.env.TARO_APP_SUBSCRIBE_TEMPLATE_ID ?? ""
		),
	},
	copy: {
		patterns: [{ from: "src/assets", to: "dist/assets" }],
		options: {},
	},
	framework: "react",
	compiler: {
		type: "webpack5",
		prebundle: {
			enable: false,
		},
	},
	cache: {
		enable: false,
	},
	mini: {
		compile: {
			include: [
				// biome-ignore lint/correctness/noGlobalDirnameFilename: CommonJS
				require("path").resolve(__dirname, "..", "..", "..", "packages", "api"),
			],
		},
		webpackChain(chain) {
			chain.module.rule("script").include.add(
				// biome-ignore lint/correctness/noGlobalDirnameFilename: CommonJS
				require("path").resolve(__dirname, "..", "..", "..", "packages", "api")
			);
		},
		postcss: {
			pxtransform: {
				enable: true,
				config: {},
			},
			url: {
				enable: true,
				config: {
					limit: 1024,
				},
			},
			cssModules: {
				enable: false,
				config: {
					namingPattern: "module",
					generateScopedName: "[name]__[local]___[hash:base64:5]",
				},
			},
		},
	},
	h5: {
		publicPath: "/",
		staticDirectory: "static",
		postcss: {
			autoprefixer: {
				enable: true,
				config: {},
			},
			cssModules: {
				enable: false,
				config: {
					namingPattern: "module",
					generateScopedName: "[name]__[local]___[hash:base64:5]",
				},
			},
		},
	},
};

export default config;
