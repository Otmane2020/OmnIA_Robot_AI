export const getRetailerStorageKey = (key: string, currentUser?: any): string => {
  if (!currentUser?.email) return key;
  const emailHash = btoa(currentUser.email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
  return `${key}_${emailHash}`;
};