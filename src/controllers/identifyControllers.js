const { findOrCreateContact } = require('../services/contactService');

const identifyContact = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    const result = await findOrCreateContact(email, phoneNumber);
    res.status(200).json({ contact: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { identifyContact };
