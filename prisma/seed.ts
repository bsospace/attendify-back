import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding process...');

  try {
    // Seed permissions
    await seedPermissions();

    // Seed roles
    const adminRole = await seedRoles();

    // Assign all permissions to Admin Role
    await assignPermissionsToRole(adminRole.id);

    // Seed admin user
    const adminUser = await seedAdminUser();

    // Assign Admin Role to Admin User
    await assignRoleToUser(adminUser.id, adminRole.id);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedPermissions() {
  console.log('Seeding permissions...');
  const tables = [
    'activities',
    'activity_location',
    'events',
    'event_types',
    'sub_locations',
    'locations',
    'target_groups',
    'groups',
    'user_activity',
    'users',
    'user_group',
    'user_permissions',
    'user_role',
    'permissions',
    'roles',
    'role_permissions',
    'hour_types',
    'join_types',
  ];

  const operations = ['create', 'read', 'update', 'delete'];
  const permissions: { name: string; description: string }[] = [];

  for (const table of tables) {
    for (const operation of operations) {
      permissions.push({
        name: `${operation}:${table}`,
        description: `Permission to ${operation} ${table} records`,
      });
    }
  }

  await prisma.permissions.createMany({
    data: permissions,
    skipDuplicates: true, // Prevent re-inserting existing records
  });

  console.log('Permissions seeded successfully.');
}

async function seedRoles() {
  console.log('Seeding roles...');
  const adminRole = await prisma.roles.upsert({
    where: { name: 'Admin' },
    update: {}, // Do nothing if it already exists
    create: {
      name: 'Admin',
      description: 'Administrator with full access to all resources',
    },
  });

  console.log('Roles seeded successfully.');
  return adminRole;
}

async function assignPermissionsToRole(roleId: string) {
  console.log(`Assigning permissions to role with ID: ${roleId}...`);
  const allPermissions = await prisma.permissions.findMany();
  const rolePermissions = allPermissions.map((permission) => ({
    role_id: roleId,
    permission_id: permission.id,
  }));

  await prisma.role_permissions.createMany({
    data: rolePermissions,
    skipDuplicates: true, // Prevent re-inserting existing records
  });

  console.log('Permissions assigned to role successfully.');
}

async function seedAdminUser() {
  console.log('Seeding admin user...');
  const adminUser = await prisma.users.upsert({
    where: { email: 'admin@example.com' },
    update: {}, // Do nothing if it already exists
    create: {
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
    },
  });

  console.log('Admin user seeded successfully.');
  return adminUser;
}

async function assignRoleToUser(userId: string, roleId: string) {
  console.log(`Assigning role with ID: ${roleId} to user with ID: ${userId}...`);
  await prisma.user_role.upsert({
    where: {
      id: `${userId}_${roleId}`,
    },
    update: {}, // Do nothing if it already exists
    create: {
      user_id: userId,
      role_id: roleId,
    },
  });

  console.log('Role assigned to user successfully.');
}

main();
