import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Insert event types
  const announceEventType = await prisma.event_types.upsert({
    where: { name: "announce" },
    update: {},
    create: {
      name: "announce",
      announce: true,
    },
  });

  const projectEventType = await prisma.event_types.upsert({
    where: { name: "project" },
    update: {},
    create: {
      name: "project",
      announce: false,
    },
  });

  console.log(`Event Types Seeded: ${announceEventType.name}, ${projectEventType.name}`);

  // Insert an example event about น้องโอม
  const eventAboutOhm = await prisma.events.create({
    data: {
      name: "ช่วยพี่โอมชัก",
      event_type_id: announceEventType.id,
      start_date: new Date("2025-02-10T10:00:00Z"),
      end_date: new Date("2025-02-10T18:00:00Z"),
      announce: true,
      description: "ประกาศเกี่ยวกับน้องโอมและโครงการพิเศษ เพื่อช่วยน้องโอมชักว่าว",
      banner: "https://bsospace.com/images/founders/OHM.png",
      year: 2025,
      file: null,
      published_at: new Date(),
    },
  });

  console.log(`Seeded Event: ${eventAboutOhm.name}`);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
