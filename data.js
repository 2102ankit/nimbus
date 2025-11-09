import { faker } from "@faker-js/faker";

export function generateData(count = 40) {
  const roles = ["Admin", "User", "Manager", "Editor"];
  const statuses = ["Active", "Inactive", "Pending"];
  return Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(roles),
    status: faker.helpers.arrayElement(statuses),
    age: faker.number.int({ min: 18, max: 65 }),
  }));
}
