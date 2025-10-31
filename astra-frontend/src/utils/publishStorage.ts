export const getPublishKey = (designId: string, step: string) =>
  `publish_${designId}_${step}`;

export const savePublishData = (designId: string, step: string, data: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(getPublishKey(designId, step), JSON.stringify(data));
  }
};

export const getPublishData = (designId: string, step: string) => {
  if (typeof window !== "undefined") {
    const saved = sessionStorage.getItem(getPublishKey(designId, step));
    return saved ? JSON.parse(saved) : null;
  }
  return null;
};

export const clearPublishData = (designId: string) => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(getPublishKey(designId, "step1"));
    sessionStorage.removeItem(getPublishKey(designId, "step2"));
  }
};
