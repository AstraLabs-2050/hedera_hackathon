import axios from "axios";

export async function POST(req: Request) {
    try {
        console.log("🚀 Paystack route triggered");

        const body = await req.json();
        console.log("📥 Incoming body:", body);

        const { email, amount, currency } = body;

        if (!email || !amount || !currency) {
            console.log("❌ Missing parameters:", { email, amount, currency });
            return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
        }

        console.log("🔑 PAYSTACK_SECRET_KEY found?", !!process.env.PAYSTACK_SECRET_KEY);

        const amountInKobo = Math.round(Number(amount) * 100);
        const channels = currency.toUpperCase() === "NGN" ? ["bank_transfer", "card"] : ["card"];

        console.log("💰 Preparing Paystack call:", { email, amountInKobo, currency, channels });

        const res = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email,
                amount: amountInKobo,
                currency: currency.toUpperCase(),
                channels,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("✅ Paystack responded:", res.data);

        return new Response(JSON.stringify(res.data), { status: 200 });
    } catch (err: any) {
        console.error("❌ Route failed:", err?.response?.data || err.message || err);
        return new Response(
            JSON.stringify({
                error: err?.response?.data || err.message || "Initialization failed",
            }),
            { status: 500 }
        );
    }
}
