import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  try {
    // Seed Permissions
    await seedPermissions();

    // Seed Roles
    const adminRole = await seedRoles();

    // Assign all permissions to Admin Role
    await assignPermissionsToRole(adminRole.id);

    // Seed Admin User
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
    'activities', 'activity_location', 'events', 'event_types', 'sub_locations',
    'locations', 'target_groups', 'groups', 'user_activity', 'users',
    'user_group', 'user_permissions', 'user_role', 'permissions', 'roles',
    'role_permissions', 'hour_types', 'join_types'
  ];
  const operations = ['create', 'read', 'update', 'delete'];

  const permissions = tables.flatMap(table =>
    operations.map(operation => ({
      name: `${operation}:${table}`,
      description: `Permission to ${operation} ${table} records`,
    }))
  );

  await prisma.permissions.createMany({
    data: permissions,
    skipDuplicates: true,
  });

  console.log('Permissions seeded successfully.');
}

async function seedRoles() {
  console.log('Seeding roles...');
  const adminRole = await prisma.roles.create({
    data: {
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
  const rolePermissions = allPermissions.map(permission => ({
    role_id: roleId,
    permission_id: permission.id,
  }));

  await prisma.role_permissions.createMany({
    data: rolePermissions,
    skipDuplicates: true,
  });

  console.log('Permissions assigned to role successfully.');
}

async function seedAdminUser() {
  console.log('Seeding admin user...');
  const adminUser = await prisma.users.create({
    data: {
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      email: 'ohm@bsospace.com',
    },
  });
  console.log('Admin user seeded successfully.');
  return adminUser;
}

async function assignRoleToUser(userId: string, roleId: string) {
  console.log(`Assigning role with ID: ${roleId} to user with ID: ${userId}...`);
  await prisma.user_role.create({
    data: {
      user_id: userId,
      role_id: roleId,
    },
  });

  console.log('Role assigned to user successfully.');
}

main();