import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create roles
  const adminRole = await prisma.roles.create({
    data: {
      name: 'Admin',
      description: 'Administrator with full access',
    },
  })

  const userRole = await prisma.roles.create({
    data: {
      name: 'User',
      description: 'Regular user with limited access',
    },
  })

  // Create permissions
  const readPermission = await prisma.permissions.create({
    data: {
      name: 'Read Access',
      description: 'Allows reading data',
    },
  })

  const writePermission = await prisma.permissions.create({
    data: {
      name: 'Write Access',
      description: 'Allows modifying data',
    },
  })

  // Create an event type
  const eventType = await prisma.event_types.create({
    data: {
      name: 'Workshop',
    },
  })

  // Create an event
  const event = await prisma.events.create({
    data: {
      name: 'Prisma Workshop',
      event_type_id: eventType.id,
      start_date: new Date('2024-12-10T09:00:00'),
      end_date: new Date('2024-12-10T17:00:00'),
      year: 2024,
    },
  })

  // Create a user
  const user = await prisma.users.create({
    data: {
      username: 'john_doe',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
    },
  })

  // Assign user role to the user
  await prisma.user_role.create({
    data: {
      user_id: user.id,
      role_id: userRole.id,
    },
  })

  // Assign user permissions
  await prisma.user_permissions.create({
    data: {
      user_id: user.id,
      permission_id: readPermission.id,
    },
  })

  // Create an activity for the event
  const activity = await prisma.activities.create({
    data: {
      name: 'Introduction to Prisma',
      start_at: new Date('2024-12-10T10:00:00'),
      end_at: new Date('2024-12-10T12:00:00'),
      start_check_in: new Date('2024-12-10T09:00:00'),
      end_check_in: new Date('2024-12-10T09:45:00'),
      start_check_out: new Date('2024-12-10T11:45:00'),
      end_check_out: new Date('2024-12-10T12:15:00'),
      token_check_in: 'check_in_token_1',
      token_check_out: 'check_out_token_1',
      event_id: event.id,
    },
  })

  // Add activity location
  await prisma.activity_location.create({
    data: {
      activity_id: activity.id,
      sub_location_id: 'your_sub_location_id',
    },
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
