"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Payment = {
	id: string;
	amount: number;
	status: string;
	paid_at: string | null;
	created_at: string;
};

export default function WorkerEarnings() {
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPayments = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			if (!session?.user?.id) {
				setLoading(false);
				return;
			}

			const { data } = await supabase
				.from("payments")
				.select("id, amount, status, paid_at, created_at")
				.eq("worker_id", session.user.id)
				.order("created_at", { ascending: false });

			if (data) setPayments(data as Payment[]);
			setLoading(false);
		};

		fetchPayments();
	}, []);

	const totals = useMemo(() => {
		const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
		const pending = payments.filter((p) => p.status !== "completed").reduce((sum, p) => sum + (p.amount || 0), 0);
		return { total, pending };
	}, [payments]);

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-5xl mx-auto space-y-8">
				<header className="space-y-2">
					<h1 className="text-3xl font-bold text-teal-dark">Earnings</h1>
					<p className="text-gray-600">Track your approved and pending payments.</p>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-white p-6 rounded-2xl border border-gray-100">
						<p className="text-sm text-gray-500">Total earned</p>
						<p className="text-2xl font-bold text-gray-900">BDT {totals.total.toLocaleString()}</p>
					</div>
					<div className="bg-white p-6 rounded-2xl border border-gray-100">
						<p className="text-sm text-gray-500">Pending</p>
						<p className="text-2xl font-bold text-gray-900">BDT {totals.pending.toLocaleString()}</p>
					</div>
					<div className="bg-white p-6 rounded-2xl border border-gray-100">
						<p className="text-sm text-gray-500">Payments</p>
						<p className="text-2xl font-bold text-gray-900">{payments.length}</p>
					</div>
				</div>

				<div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
					<div className="grid grid-cols-4 gap-4 px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-semibold bg-gray-50">
						<span>Payment</span>
						<span>Amount</span>
						<span>Status</span>
						<span>Date</span>
					</div>
					<div className="divide-y">
						{loading ? (
							<div className="px-6 py-6 text-sm text-gray-500">Loading payments...</div>
						) : payments.length === 0 ? (
							<div className="px-6 py-6 text-sm text-gray-500">No payments yet.</div>
						) : (
							payments.map((payment) => (
								<div key={payment.id} className="grid grid-cols-4 gap-4 px-6 py-4 text-sm items-center">
									<span className="font-semibold text-gray-900">{payment.id}</span>
									<span className="text-gray-600">BDT {payment.amount.toLocaleString()}</span>
									<span className="text-teal-dark font-semibold">{payment.status}</span>
									<span className="text-gray-600">
										{new Date(payment.paid_at ?? payment.created_at).toLocaleDateString()}
									</span>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
