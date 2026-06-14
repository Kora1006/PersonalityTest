import { useCallback, useEffect, useMemo, useState } from "react";

import { MOCK_HISTORY } from "@/data/mock-history";
import type { HistoryRecord } from "@/lib/history";
import { deleteRecord, initMockIfEmpty } from "@/lib/history";

const DISC_LABELS: Record<string, string> = {
	D: "支配型",
	I: "影响型",
	S: "稳健型",
	C: "谨慎型",
};

function matchesSearch(record: HistoryRecord, query: string): boolean {
	const q = query.toLowerCase().trim();
	if (!q) {
		return true;
	}
	return (
		record.dominantType.toLowerCase().includes(q) ||
		(DISC_LABELS[record.dominantType] ?? "").includes(q) ||
		record.date.includes(q) ||
		record.note.toLowerCase().includes(q)
	);
}

export function useHistory() {
	const [records, setRecords] = useState<HistoryRecord[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const data = initMockIfEmpty(MOCK_HISTORY);
		setRecords(data);
	}, []);

	const filteredRecords = useMemo(
		() => records.filter((r) => matchesSearch(r, searchQuery)),
		[records, searchQuery]
	);

	const removeRecord = useCallback((id: string) => {
		const updated = deleteRecord(id);
		setRecords(updated);
	}, []);

	return { filteredRecords, searchQuery, setSearchQuery, removeRecord };
}
