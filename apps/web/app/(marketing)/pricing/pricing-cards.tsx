"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "~/lib/auth/client";
import { createCheckoutAction, validateCouponAction } from "~/actions/billing";

const tiers = [
	{
		name: "Free",
		price: "$0",
		description: "Get started and see where you stand.",
		features: [
			"Adaptive skill assessment",
			"Personalised learning roadmap",
			"2 quizzes per day",
		],
		plan: "free" as const,
	},
	{
		name: "Pro",
		price: "$10",
		description: "Unlimited learning and AI features.",
		features: [
			"Includes all free features, plus:",
			"Unlimited quizzes and lessons",
			"Unlimited Ladunni sessions",
			"Advanced Roadmap generation",
			"Mock interviews",
			"Resume builder with AI feedback",
		],
		plan: "pro" as const,
	},
];

function normalizeCoupon(value: string) {
	return value.trim().toUpperCase();
}

function validateCouponFormat(value: string) {
	return /^[A-Z0-9-]{4,24}$/.test(value);
}

export function PricingCards({ initialIsLoggedIn = false }: { initialIsLoggedIn?: boolean }) {
	const { data: session } = useSession();
	const isLoggedIn = !!session?.user || initialIsLoggedIn;
	const [loading, setLoading] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [comingSoonNotice, setComingSoonNotice] = useState(false);
	const [couponInput, setCouponInput] = useState("");
	const [couponNotice, setCouponNotice] = useState<string | null>(null);
	const [couponCode, setCouponCode] = useState<string | null>(null);
	const [couponValidating, setCouponValidating] = useState(false);

	async function applyCoupon() {
		const normalized = normalizeCoupon(couponInput);

		if (!normalized) {
			setCouponCode(null);
			setCouponNotice("Enter a coupon code to apply it.");
			return;
		}

		if (!validateCouponFormat(normalized)) {
			setCouponCode(null);
			setCouponNotice("Invalid coupon format. Use 4–24 letters, numbers, or dashes.");
			return;
		}

		setCouponValidating(true);
		setCouponNotice(null);
		try {
			const result = await validateCouponAction(normalized);
			if (result.valid) {
				setCouponCode(normalized);
				setCouponNotice(result.message);
			} else {
				setCouponCode(null);
				setCouponNotice(result.message);
			}
		} catch {
			setCouponCode(null);
			setCouponNotice("Could not validate coupon. Try again.");
		} finally {
			setCouponValidating(false);
		}
	}

	async function handleUpgrade(plan: "pro") {
		const normalized = normalizeCoupon(couponInput);

		if (normalized && !validateCouponFormat(normalized)) {
			setCouponNotice("Fix your coupon format before checkout.");
			return;
		}

		if (!isLoggedIn) {
			const pricingReturnParams = new URLSearchParams({ plan });
			const params = new URLSearchParams({
				plan,
				from: `/pricing?${pricingReturnParams.toString()}`,
			});
			if (normalized) {
				params.set("coupon", normalized);
				pricingReturnParams.set("coupon", normalized);
				params.set("from", `/pricing?${pricingReturnParams.toString()}`);
			}
			window.location.href = `/sign-up?${params.toString()}`;
			return;
		}

		setLoading(plan);
		setError(null);
		try {
			const result = await createCheckoutAction(plan, couponCode ? normalized : undefined);
			if ("comingSoon" in result) {
				setLoading(null);
				setComingSoonNotice(true);
				setTimeout(() => setComingSoonNotice(false), 5000);
				return;
			}
			window.location.href = result.url;
		} catch (err) {
			setLoading(null);
			setError("Something went wrong. Please try again.");
			console.error("[checkout]", err);
		}
	}

	return (
		<div className="mt-16">
			<div className="mb-6 rounded-xl border bg-muted/20 p-4">
				<p className="text-sm font-medium">Have a discount code?</p>
				<div className="mt-3 flex flex-col gap-2 sm:flex-row">
					<input
						value={couponInput}
						onChange={(e) => {
							setCouponInput(e.target.value);
							setCouponCode(null);
							setCouponNotice(null);
						}}
						placeholder="EARLYACCESS"
						className="w-full rounded-full border bg-background px-4 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
						aria-label="Coupon code"
					/>
					<button
						type="button"
						onClick={() => void applyCoupon()}
						disabled={couponValidating}
						className="inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
					>
						{couponValidating ? "Checking…" : "Apply code"}
					</button>
				</div>
				{couponNotice && (
					<p
						className={`mt-2 text-xs ${
							couponCode ? "text-green-600" : "text-destructive"
						}`}
					>
						{couponNotice}
					</p>
				)}
			</div>

			{comingSoonNotice && (
				<p className="mb-6 rounded-lg bg-muted px-4 py-3 text-sm text-foreground">
					Pro is launching soon — we&apos;ll email you when it&apos;s ready.
				</p>
			)}
			{error && (
				<p className="mb-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
					{error}
				</p>
			)}
			<div className="grid gap-6 sm:grid-cols-2 sm:gap-10 max-w-2xl mx-auto">
				{tiers.map((tier) => (
					<div key={tier.name} className="flex flex-col">
						<h2 className="text-2xl font-semibold">{tier.name}</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							{tier.description}
						</p>

						<div className="mt-6 flex items-baseline gap-1">
							<span className="text-5xl font-bold tracking-tight">
								{tier.price}
							</span>
							{tier.plan !== "free" && (
								<span className="text-sm text-muted-foreground">
									/ month
								</span>
							)}
						</div>

						{tier.plan === "free" ? (
							<Link
								href={isLoggedIn ? "/dashboard" : "/sign-up"}
								className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
							>
								{isLoggedIn ? "Start learning" : "Get started"}
								<ArrowUpRight className="h-4 w-4" />
							</Link>
						) : (
							<button
								onClick={() => handleUpgrade(tier.plan)}
								disabled={loading === tier.plan}
								className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
							>
								{loading === tier.plan
									? "Loading..."
									: `Get ${tier.name}`}
								{loading !== tier.plan && (
									<ArrowUpRight className="h-4 w-4" />
								)}
							</button>
						)}

						<ul className="mt-8 flex flex-col gap-3">
							{tier.features.map((feature, i) => (
								<li
									key={feature}
									className={`flex items-start gap-2.5 text-sm ${
										i === 0 && tier.plan !== "free"
											? "font-semibold text-foreground"
											: "text-muted-foreground"
									}`}
								>
									{!(i === 0 && tier.plan !== "free") && (
										<span className="mt-0.5 shrink-0 text-foreground">
											✓
										</span>
									)}
									{feature}
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
}
