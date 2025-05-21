const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findOrCreateContact = async (email, phoneNumber) => {
  const allMatchingContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { email },
        { phoneNumber },
      ]
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const primaryContact = allMatchingContacts.find(c => c.linkPrecedence === 'primary') || allMatchingContacts[0];

  const allContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: primaryContact?.id },
        { linkedId: primaryContact?.id }
      ]
    }
  });

  const alreadyPresent = allContacts.some(c => c.email === email && c.phoneNumber === phoneNumber);

  if (!alreadyPresent) {
    await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'secondary',
        linkedId: primaryContact?.id ?? null
      }
    });
  }

  const updatedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { email },
        { phoneNumber }
      ]
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const primary = updatedContacts.find(c => c.linkPrecedence === 'primary') || updatedContacts[0];

  const allRelated = await prisma.contact.findMany({
    where: {
      OR: [
        { id: primary.id },
        { linkedId: primary.id }
      ]
    }
  });

  return {
    primaryContatctId: primary.id,
    emails: [...new Set(allRelated.map(c => c.email).filter(Boolean))],
    phoneNumbers: [...new Set(allRelated.map(c => c.phoneNumber).filter(Boolean))],
    secondaryContactIds: allRelated.filter(c => c.linkPrecedence === 'secondary').map(c => c.id)
  };
};

module.exports = { findOrCreateContact };
