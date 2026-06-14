import { useQuery } from "@tanstack/react-query";
import { redirect, useNavigate } from "react-router";

import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export async function clientLoader({ request }: { request: Request }) {
	const session = await authClient.getSession();
	if (!session.data) {
		const url = new URL(request.url);
		throw redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
	}
	return null;
}

export default function Dashboard() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();

	const privateData = useQuery(
		trpc.privateData.queryOptions({
			enabled: !!session,
		})
	);

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<span className="material-symbols-rounded animate-spin text-4xl text-blue-500">
					progress_activity
				</span>
			</div>
		);
	}

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome {session?.user.name}</p>
			<p>API: {privateData.data?.message}</p>
		</div>
	);
}
