// useEarnings.ts
export const fetcherWithToken = async ([url, token]: [string, string]) => {
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch data");
    }

    return res.json();
};
