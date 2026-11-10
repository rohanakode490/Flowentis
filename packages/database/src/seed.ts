import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding available triggers...");

  const triggers = [
    {
      name: "GithubTrigger",
      image:
        "https://res.cloudinary.com/dmextegpu/image/upload/v1741162444/github-logo_drwunv.png",
    },
    {
      name: "LinkedinTrigger",
      image:
        "https://res.cloudinary.com/dmextegpu/image/upload/v1741162444/linkedin-logo_u1ex1f.png",
    },
    {
      name: "IndeedTrigger",
      image:
        "https://res.cloudinary.com/dmextegpu/image/upload/v1741162444/indeed-logo_v1ex1g.png",
    },
  ];

  for (const trigger of triggers) {
    const existing = await prisma.availableTrigger.findFirst({
      where: { name: trigger.name },
    });
    if (!existing) {
      await prisma.availableTrigger.create({
        data: {
          name: trigger.name,
          image: trigger.image,
          show: true,
        },
      });
      console.log(`Created trigger: ${trigger.name}`);
    } else {
      await prisma.availableTrigger.update({
        where: { id: existing.id },
        data: {
          image: trigger.image,
          show: true,
        },
      });
      console.log(`Updated trigger: ${trigger.name}`);
    }
  }

  console.log("Seeding available actions...");
  const actions = [
    {
      name: "Email",
      image:
        "https://res.cloudinary.com/dmextegpu/image/upload/v1741162444/email-logo_axu1f2.png",
    },
    {
      name: "Solana",
      image:
        "https://res.cloudinary.com/dmextegpu/image/upload/v1741162444/solana-sol-logo_fshz8v.png",
    },
    {
      name: "Google Sheets",
      image:
        "https://res.cloudinary.com/dmextegpu/image/upload/v1741162444/google-sheets-logo_kx1f3.png",
    },
    {
      name: "Slack",
      image:
        "https://res.cloudinary.com/dmextegpu/image/upload/v1741162444/slack-logo_bxu1f3.png",
    },
    {
      name: "ICM",
      image:
        "https://res.cloudinary.com/dmextegpu/image/upload/v1741162444/icm-logo_axv3r2.png",
    },
    {
      name: "LLM",
      image:
        "https://res.cloudinary.com/dmextegpu/image/upload/v1741162444/brain-logo.png",
    },
  ];


  for (const action of actions) {
    const existing = await prisma.availableAction.findFirst({
      where: { name: action.name },
    });
    if (!existing) {
      await prisma.availableAction.create({
        data: {
          name: action.name,
          image: action.image,
          show: true,
        },
      });
      console.log(`Created action: ${action.name}`);
    } else {
      await prisma.availableAction.update({
        where: { id: existing.id },
        data: {
          image: action.image,
          show: true,
        },
      });
      console.log(`Updated action: ${action.name}`);
    }
  }

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
