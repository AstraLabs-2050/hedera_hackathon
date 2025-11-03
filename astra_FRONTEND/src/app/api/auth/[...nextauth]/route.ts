// import NextAuth, { type AuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";

// async function findUserByEmail(email: string) {
//     const base = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
//     const res = await fetch(`${base}/users/by-email?email=${encodeURIComponent(email)}`);
//     if (!res.ok) return null;
//     return res.json();
// }

// export const authOptions: AuthOptions = {
//     providers: [
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID!,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//         }),
//     ],
//     secret: process.env.NEXTAUTH_SECRET,
//     debug: true,
//     pages: {
//         signIn: "/makers/onboarding",
//     },
//     session: {
//         strategy: "jwt",
//     },
//     callbacks: {
//         async signIn({ user, account, profile }) {
//             if (!user?.email) return false;

//             // Your existing backend signup logic
//             const providerId = account?.providerAccountId ?? (profile as any)?.sub ?? "";
//             const base = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

//             const query = new URLSearchParams({
//                 email: user.email,
//                 fullName: user.name ?? "",
//                 role: "maker",
//                 provider: account?.provider ?? "google",
//                 providerId,
//             }).toString();

//             const res = await fetch(`${base}/auth/signup/google?${query}`, 
//                 { method: "GET" });

//             if (!res.ok) {
//                 const txt = await res.text();
//                 if (!txt.toLowerCase().includes("already exists") && !txt.toLowerCase().includes("user exists")) {
//                     return false;
//                 }
//             }

//             const data = await res.json();
//             (user as any).backendUserId = data.user?._id ?? data.user?.id;
//             (user as any).token = data.token ?? data.accessToken ?? null;

//             // Check if verified (without sending OTP here)
//             const dbUser = await findUserByEmail(user.email);
//             (user as any).needsOtpVerification = !dbUser?.isVerified;

//             return true;
//         },

//         async jwt({ token, user }) {
//             if (user) {
//                 token.backendUserId = (user as any).backendUserId ?? token.backendUserId;
//                 token.backendToken = (user as any).token ?? token.backendToken;
//                 token.needsOtpVerification = (user as any).needsOtpVerification ?? false;
//             }
//             return token;
//         },

//         async session({ session, token }) {
//             (session.user as any).backendUserId = token.backendUserId;
//             (session.user as any).backendToken = token.backendToken;
//             (session.user as any).needsOtpVerification = token.needsOtpVerification;
//             return session;
//         },

//         async redirect({ url, baseUrl }) {
//             if (url?.includes("callback") && baseUrl) {
//                 return `${baseUrl}/makers/onboarding?step=2`;
//             }
//             return `${baseUrl}/makers/onboarding`;
//         },
//     },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
