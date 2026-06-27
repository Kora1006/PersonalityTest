import Taro from "@tarojs/taro";
import { Component, type PropsWithChildren } from "react";
import "./app.scss";

class App extends Component<PropsWithChildren<{}>> {
	componentDidMount() {
		if (process.env.TARO_ENV === "weapp" && typeof Taro.cloud !== "undefined") {
			try {
				Taro.cloud.init({
					traceUser: true,
				});
			} catch (err) {
				console.error("Taro.cloud.init failed:", err);
			}
		}
	}
	componentDidShow() {}
	componentDidHide() {}

	render() {
		return this.props.children;
	}
}

export default App;
