import Link from "next/link";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center px-6 py-12">
				<div className="space-y-6">
					<Link href="/" className="text-3xl font-black text-teal-dark">
						BUNON<span className="text-saffron">.</span>
					</Link>
					<h1 className="text-4xl md:text-5xl font-black text-gray-900">
						Work from home. Earn with dignity.
					</h1>
					<p className="text-gray-600 text-lg">
						Join Bunon to access training, verified tasks, and secure payments. Build
						your future with flexible, remote work.
					</p>
					<div className="grid sm:grid-cols-2 gap-4">
						<div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
							<p className="text-sm text-gray-500">Training modules</p>
							<p className="text-2xl font-bold text-teal-dark">3+</p>
						</div>
						<div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
							<p className="text-sm text-gray-500">Verified employers</p>
							<p className="text-2xl font-bold text-teal-dark">40+</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10">
					{children}
				</div>
			</div>
		</div>
	);
}
