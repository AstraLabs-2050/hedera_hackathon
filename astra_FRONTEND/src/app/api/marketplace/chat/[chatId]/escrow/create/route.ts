import axios from "axios";

export async function POST(req) {
  try {
    const { email, amount, currency } = await req.json();

    if (!email || !amount || !currency) {
       console.error("❌ Missing parameters:", { email, amount, currency });
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
      });
    }

    const amountInKobo = Math.round(Number(amount) * 100);

    // Rule: Only Nigerians (NGN) use bank_transfer; everyone else = card
    const channels =
      currency.toUpperCase() === "NGN" ? ["bank_transfer", "card"] : ["card"];

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

    return new Response(JSON.stringify(res.data), { status: 200 });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return new Response(JSON.stringify({ error: "Initialization failed" }), {
      status: 500,
    });
  }
}