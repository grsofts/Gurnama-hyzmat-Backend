const models = require('../models');

const contactController = {
    getContacts: async (req, res) => {
        try {
        const contacts = await models.Contacts.findAll({ order: [['order', 'ASC']] });
        res.json(contacts);
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
        }
    },
    addContact: async (req, res) => {
        try {
            if (!req.body.data) {
                return res.status(400).json({ message: "Missing 'data' JSON field" });
            }
            const data = JSON.parse(req.body.data);
            if (!req.file) {
                return res.status(400).json({ message: 'Icon are required' });
            }
            const icon = req.file;

            const contact = await models.Contacts.create({
                title: data.title,
                key: data.key,
                value: data.value,
                type: data.type,
                link: data.link,
                order: data.order,
                icon: `/contacts/${icon.filename}`,
            });
            res.status(201).json({ message: 'Contact created', id: contact.id });
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
        }
    },
    updateContact: async (req, res) => {
        try {
            const contactId = req.params.id;
            if (!req.body.data) {
               return res.status(400).json({ message: "Missing 'data' JSON field" });
            }
            
            const contact = await models.Contacts.findOne({ where: { id: contactId } });
            if (!contact) return res.status(404).json({ message: 'Contact not found' });
            const iconName = req.file?.filename;
       
            const data = JSON.parse(req.body.data);
    
            const about = await models.About.findOne();
            if (!about) {
            return res.status(404).json({ message: 'About not found' });
            }

            await contact.update({
                title: data.title,
                key: data.key,
                value: data.value,
                type: data.type,
                link: data.link,
                order: data.order,
                icon: iconName ? `/contacts/${iconName}` : contact.icon,
            });
            res.json({ message: 'Contact updated', id: contact.id });
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
        }
    },
    deleteContact: async (req, res) => {
        try {
        const contactId = req.params.id;
        const contact = await models.Contacts.findByPk(contactId);
        if (!contact) return res.status(404).json({ message: 'Contact not found' });
        await contact.destroy();
        res.json({ message: 'Contact deleted' });
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
        }
    }
}

module.exports = contactController;
