import { useNavigate, useParams } from "react-router";
import { DISC_COLORS } from "@/data/disc-colors";
import { trpcClient } from "@/utils/trpc";
import type { Route } from "./+types/invite.$invitationId";

export function meta(_: Route.MetaArgs) {
	return [{ title: "好友邀请 — DISC 测评" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const { invitationId } = params;
	if (!invitationId) {
		return { inviterName: null, compositeType: null };
	}
	try {
		const data = await trpcClient.invitation.getInvitationPreview.query({
			invitationId,
		});
		return data;
	} catch {
		return { inviterName: null, compositeType: null };
	}
}

const COMPOSITE_LABELS: Record<string, string> = {
	DI: "开拓型",
	DC: "实效型",
	DS: "驱动型",
	ID: "说服型",
	IS: "活力型",
	IC: "创意型",
	SD: "守护型",
	SI: "温暖型",
	SC: "支柱型",
	CD: "精算型",
	CI: "洞察型",
	CS: "执行型",
};

export default function InvitePage({ loaderData }: Route.ComponentProps) {
	const navigate = useNavigate();
	const { invitationId } = useParams();
	const { inviterName, compositeType } = loaderData as {
		inviterName: string | null;
		compositeType: string | null;
	};

	const primaryType = (compositeType?.charAt(0) ?? "D") as
		| "D"
		| "I"
		| "S"
		| "C";
	const color = DISC_COLORS[primaryType];
	const typeLabel = compositeType
		? (COMPOSITE_LABELS[compositeType] ?? compositeType)
		: "";

	const handleStart = () => {
		if (invitationId) {
			sessionStorage.setItem("pendingInvitationId", invitationId);
		}
		navigate("/quiz");
	};

	return (
		<div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center px-5 py-16">
			<div className="w-full rounded-3xl bg-white p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
				{compositeType && (
					<div
						className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl font-extrabold text-3xl text-white ${color.gradientClass}`}
					>
						{compositeType}
					</div>
				)}

				<h1 className="mb-2 font-bold text-2xl text-foreground">
					{inviterName ? `${inviterName} 邀请你来测测` : "你被邀请参与测评"}
				</h1>

				{compositeType && (
					<p
						className="mb-1 font-semibold text-lg"
						style={{ color: color.hex }}
					>
						Ta 是 {typeLabel}
					</p>
				)}

				<p className="mb-8 text-muted-foreground text-sm leading-relaxed">
					完成 DISC 职业性格测评，看看你们的性格配对分析
				</p>

				<button
					className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-white shadow-[0_8px_16px_rgba(0,88,190,0.2)] transition-opacity hover:opacity-90"
					onClick={handleStart}
					type="button"
				>
					<span className="material-symbols-outlined text-xl">play_arrow</span>
					开始测评（约 10 分钟）
				</button>

				<p className="mt-4 text-muted-foreground text-xs">
					完全免费 · 24 道情境题 · 立即查看结果
				</p>
			</div>
		</div>
	);
}
