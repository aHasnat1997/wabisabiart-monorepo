export const formatDate = (dateString: string) => {
  if (!dateString) return "No date";
  
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date); 
  // Output: "3 Apr 2026"
};