// ============ GENERATE SAMPLE DATA ============
export const generateSampleData = (count = 100) => {
  const statuses = ["Active", "Inactive", "Pending", "Suspended"];
  const roles = ["Admin", "User", "Manager", "Guest"];
  const departments = ["Engineering", "Sales", "Marketing", "Support", "HR"];
  const firstNames = [
    "John", "Jane", "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", 
    "Grace", "Henry", "Isabel", "Jack", "Kelly", "Liam", "Maria", "Nathan",
    "Olivia", "Peter", "Quinn", "Rachel"
  ];
  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", 
    "Davis", "Martinez", "Lopez", "Wilson", "Anderson", "Taylor", "Thomas",
    "Moore", "Jackson", "Martin", "Lee", "Walker", "Hall"
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `usr_${String(i + 1).padStart(5, "0")}`,
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
      lastNames[Math.floor(Math.random() * lastNames.length)]
    }`,
    email: `user${i + 1}@example.com`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 100000) + 40000,
    joinDate: new Date(
      2020 + Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28)
    )
      .toISOString()
      .split("T")[0],
    performance: Math.floor(Math.random() * 100),
  }));
};