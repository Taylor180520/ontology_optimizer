import type { Expert } from './mockData';

const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Daniel', 'Lisa', 'Matthew', 'Nancy',
  'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley',
  'Paul', 'Dorothy', 'Andrew', 'Kimberly', 'Joshua', 'Emily', 'Kenneth', 'Donna',
  'Kevin', 'Michelle', 'Brian', 'Carol', 'George', 'Amanda', 'Timothy', 'Melissa',
  'Ronald', 'Deborah',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts',
];

const departments = ['Logistics', 'Logistics', 'Logistics', 'Supply Chain', 'Supply Chain', 'Operations', 'Warehouse', 'Warehouse'];
const domainOptions = [
  ['Logistics Pricing'], ['Logistics Dispatch'], ['Warehouse Mgmt'], ['Supply Chain Ops'],
  ['Logistics Pricing', 'Warehouse Mgmt'], ['Logistics Dispatch', 'Supply Chain Ops'],
  ['Fleet Management'], ['Route Optimization'], ['Inventory Control'],
  ['Logistics Pricing', 'Fleet Management'], ['Warehouse Mgmt', 'Inventory Control'],
];

export function generateImportedExperts(): Expert[] {
  return Array.from({ length: 50 }, (_, i) => {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[i % lastNames.length];
    const name = `${first} ${last}`;
    const initials = `${first[0]}${last[0]}`;
    const dept = departments[i % departments.length];
    const domains = domainOptions[i % domainOptions.length];
    const online = Math.random() > 0.35;
    const dailyLimit = Math.floor(Math.random() * 4) + 3;
    const dailyCompleted = Math.floor(Math.random() * (dailyLimit + 1));
    const totalAnswers = Math.floor(Math.random() * 180) + 20;
    const correctionRate = Math.round((Math.random() * 15 + 80) * 10) / 10;

    return {
      id: `imp-${i + 1}`,
      name,
      avatar: initials,
      domains,
      department: dept,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      online,
      taskMode: Math.random() > 0.5 ? 'hard_limit' : 'soft_limit',
      dailyLimit,
      dailyCompleted,
      totalContributions: Math.floor(totalAnswers * 0.7),
      totalAnswers,
      correctionRate,
    };
  });
}
