import { redirect, useNavigate } from "react-router";
import { toast } from "sonner";
import { DISC_COLORS } from "@/data/disc-colors";
import { authClient } from "@/lib/auth-client";
import { getHistory } from "@/lib/history";

export async function clientLoader({ request }: { request: Request }) {
	const session = await authClient.getSession();
	if (!session.data) {
		const url = new URL(request.url);
		throw redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
	}
	return null;
}

export default function Profile() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<span className="material-symbols-rounded animate-spin text-4xl text-blue-500">
					progress_activity
				</span>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
				<div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
					<span className="material-symbols-rounded text-5xl text-gray-400">
						person
					</span>
				</div>
				<div className="text-center">
					<h2 className="mb-2 font-bold text-gray-900 text-xl">
						登录后查看个人中心
					</h2>
					<p className="text-gray-500 text-sm">
						保存测评记录，解锁云端同步功能
					</p>
				</div>
				<button
					className="w-full max-w-xs rounded-xl bg-blue-600 py-4 font-semibold text-white"
					onClick={() => navigate("/login")}
					type="button"
				>
					立即登录
				</button>
				<button
					className="text-gray-500 text-sm hover:underline"
					onClick={() => navigate("/register")}
					type="button"
				>
					还没有账号？注册
				</button>
			</div>
		);
	}

	const history = getHistory();
	const lastRecord = history[0] ?? null;
	const totalTests = history.length;

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					toast.success("已退出登录");
					navigate("/");
				},
			},
		});
	};

	return (
		<div className="min-h-screen bg-gray-50 pb-24">
			<div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 pt-12 pb-10 text-white">
				<div className="flex items-center gap-4">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 font-bold text-3xl">
						{session.user.name?.[0]?.toUpperCase() ?? "U"}
					</div>
					<div>
						<h1 className="font-bold text-xl">{session.user.name}</h1>
						<p className="text-blue-100 text-sm">{session.user.email}</p>
					</div>
				</div>
			</div>

			<div className="-mt-5 rounded-t-3xl bg-gray-50 px-4 pt-6">
				<div className="mb-4 grid grid-cols-3 gap-3">
					<div className="rounded-2xl bg-white p-4 text-center shadow-sm">
						<p className="font-bold text-2xl text-blue-600">{totalTests}</p>
						<p className="text-gray-500 text-xs">完成测评</p>
					</div>
					<div className="rounded-2xl bg-white p-4 text-center shadow-sm">
						<p className="font-bold text-2xl text-blue-600">
							{lastRecord ? lastRecord.dominantType : "—"}
						</p>
						<p className="text-gray-500 text-xs">最近类型</p>
					</div>
					<div className="rounded-2xl bg-white p-4 text-center shadow-sm">
						<p className="font-bold text-2xl text-blue-600">
							{lastRecord ? lastRecord.scores[lastRecord.dominantType] : "—"}
						</p>
						<p className="text-gray-500 text-xs">最高得分</p>
					</div>
				</div>

				{lastRecord && (
					<div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
						<h3 className="mb-3 font-semibold text-gray-700 text-sm">
							最近测评
						</h3>
						<div className="flex items-center gap-3">
							<div
								className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
								style={{
									background: DISC_COLORS[lastRecord.dominantType].gradient,
								}}
							>
								<span className="font-bold">{lastRecord.dominantType}</span>
							</div>
							<div>
								<p className="font-medium text-gray-900 text-sm">
									{DISC_COLORS[lastRecord.dominantType].label}
								</p>
								<p className="text-gray-400 text-xs">{lastRecord.date}</p>
							</div>
						</div>
					</div>
				)}

				<div className="rounded-2xl bg-white shadow-sm">
					{[
						{
							icon: "history",
							label: "测评历史",
							onClick: () => navigate("/history"),
						},
						{
							icon: "help",
							label: "关于 DISC",
							onClick: () => navigate("/"),
						},
					].map(({ icon, label, onClick }) => (
						<button
							className="flex w-full items-center gap-3 border-gray-100 border-b px-4 py-4 last:border-0 hover:bg-gray-50"
							key={label}
							onClick={onClick}
							type="button"
						>
							<span className="material-symbols-rounded text-gray-400">
								{icon}
							</span>
							<span className="flex-1 text-left text-gray-700 text-sm">
								{label}
							</span>
							<span className="material-symbols-rounded text-gray-300">
								chevron_right
							</span>
						</button>
					))}
				</div>

				<button
					className="mt-4 w-full rounded-2xl border border-red-100 bg-white py-4 font-medium text-red-500 text-sm shadow-sm hover:bg-red-50"
					onClick={handleSignOut}
					type="button"
				>
					退出登录
				</button>
			</div>
		</div>
	);
}
