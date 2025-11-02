export const hasValueInTag = (tags: string[], query: string): boolean => {
    const q = query.toLowerCase();

    return tags.some(t => t.toLowerCase().includes(q));
};