import type { UserConfigExport } from "@tarojs/cli";
import path from "path";

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
		"@": path.resolve("src"),
		"react/jsx-runtime": path.resolve(
			"node_modules",
			"react",
			"jsx-runtime.js"
		),
		"react/jsx-dev-runtime": path.resolve(
			"node_modules",
			"react",
			"jsx-dev-runtime.js"
		),
		react: path.resolve("node_modules", "react"),
		"react-dom": "@tarojs/react",
	},
	defineConstants: {
		"process.env.TARO_APP_SERVER_URL": JSON.stringify(
			process.env.TARO_APP_SERVER_URL ?? "https://disc-server-271756-8-1444533815.sh.run.tcloudbase.com"
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
			include: [path.resolve("..", "..", "packages", "api")],
		},
		webpackChain(chain) {
			chain.module
				.rule("script")
				.include.add(path.resolve("..", "..", "packages", "api"));
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
