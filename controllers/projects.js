const models = require('../models');
const fs = require('fs');
const path = require('path');

const projectController = {

  // ================= GET =================
  getProjects: async (req, res) => {
    try {
      const id = req.params.id;
      const lang = req.query.lang || 'ru';

      // включаем переводы
      const translationInclude = {
        model: models.ProjectTranslation,
        as: 'translations',
        attributes: { exclude: ['createdAt', 'updatedAt', 'language_id'] },
        include: [{
          model: models.Language,
          as: 'language',
          attributes: ['code']
        }],
        required: false
      };

      const projects = await models.Project.findAll({
        where: id ? { id } : {},
        include: [
          translationInclude,
          { model: models.ProjectImages, as: 'images' }
        ],
        order: [['sort_order', 'ASC']]
      });

      if (id && !projects.length) return res.status(404).json({ message: 'Project not found' });

      const result = projects.map(p => {
        const baseData = {
          id: p.id,
          sort_order: p.sort_order,
          is_active: p.is_active,
          client_name: p.client_name,
          address: p.address,
          completed: p.completed,
          tags: p.tags,
          images: p.images.map(img => ({
            id: img.id,
            sort_order: img.sort_order,
            image_url: img.image_url,
            alt_text: img.alt_text
          }))
        };

        if (id) {
          // для одного проекта — возвращаем все переводы
          const translations = {};
          p.translations.forEach(t => {
            const code = t.language?.code || 'unknown';
            translations[code] = {
              title: t.title,
              short_desc: t.short_desc,
              full_desc: t.full_desc
            };
          });
          return { ...baseData, translations };
        }

        // для списка — только один язык
        const t = p.translations.find(tr => tr.language?.code === lang);
        return {
          ...baseData,
          title: t?.title || null,
          short_desc: t?.short_desc || null
        };
      });

      res.status(result.length ? 200 : 404).json(id ? result[0] : result);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // ================= ADD =================
  addProject: async (req, res) => {
    try {
      if (!req.body.data) return res.status(400).json({ message: "Missing 'data' JSON field" });
      const data = JSON.parse(req.body.data);
      const files = req.files || {};

      // 1. Создаем проект
      const project = await models.Project.create({
        sort_order: data.sort_order,
        is_active: data.is_active ?? true,
        client_name: data.client_name,
        address: data.address,
        completed: data.completed,
        tags: data.tags
      });

      // 2. Сохраняем переводы
      if (data.translations) {
        for (let langCode of Object.keys(data.translations)) {
          const langRow = await models.Language.findOne({ where: { code: langCode } });
          const tr = data.translations[langCode];

          await models.ProjectTranslation.create({
            project_id: project.id,
            language_id: langRow.id,
            title: tr.title,
            short_desc: tr.short_desc,
            full_desc: tr.full_desc
          });
        }
      }

      // 3. Сохраняем изображения
      if (files.images) {
        for (const file of files.images) {
          const newPath = path.join(__dirname, '../uploads/projects', file.filename);
          fs.renameSync(file.path, newPath);

          await models.ProjectImages.create({
            project_id: project.id,
            image_url: `/projects/${file.filename}`,
            sort_order: 0,
            alt_text: ''
          });
        }
      }

      res.json({ message: 'Project created', id: project.id });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // ================= UPDATE =================
  updateProject: async (req, res) => {
    try {
      const projectId = req.params.id;
      if (!req.body.data) return res.status(400).json({ message: "Missing 'data' JSON field" });

      const data = JSON.parse(req.body.data);
      const files = req.files || {};

      const project = await models.Project.findByPk(projectId, {
        include: [
          { model: models.ProjectTranslation, as: 'translations' },
          { model: models.ProjectImages, as: 'images' }
        ]
      });
      if (!project) return res.status(404).json({ message: 'Project not found' });

      // 1. Обновляем проект
      await project.update({
        sort_order: data.sort_order,
        is_active: data.is_active,
        client_name: data.client_name,
        address: data.address,
        completed: data.completed,
        tags: data.tags
      });

      // 2. Обновляем переводы
      if (data.translations) {
        for (let langCode of Object.keys(data.translations)) {
          const langRow = await models.Language.findOne({ where: { code: langCode } });
          const tr = data.translations[langCode];

          let translation = project.translations.find(t => t.language_id === langRow.id);
          if (!translation) {
            translation = await models.ProjectTranslation.create({
              project_id: project.id,
              language_id: langRow.id,
              title: tr.title,
              short_desc: tr.short_desc,
              full_desc: tr.full_desc
            });
          } else {
            await translation.update({
              title: tr.title,
              short_desc: tr.short_desc,
              full_desc: tr.full_desc
            });
          }
        }
      }

      // 3. Добавляем новые изображения
      if (files.images) {
        for (const file of files.images) {
          const newPath = path.join(__dirname, '../uploads/projects', file.filename);
          fs.renameSync(file.path, newPath);

          await models.ProjectImages.create({
            project_id: project.id,
            image_url: `/projects/${file.filename}`,
            sort_order: 0,
            alt_text: ''
          });
        }
      }

      res.json({ message: 'Project updated' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // ================= STATUS =================
  updateProjectStatus: async (req, res) => {
    try {
      const projectId = req.params.id;
      const is_active = req.query.status === 'true';

      const project = await models.Project.findByPk(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });

      await project.update({ is_active });
      res.json({ message: 'Project status updated' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // ================= DELETE =================
  deleteProject: async (req, res) => {
    try {
      const projectId = req.params.id;

      const project = await models.Project.findByPk(projectId, {
        include: [
          { model: models.ProjectTranslation, as: 'translations' },
          { model: models.ProjectImages, as: 'images' }
        ]
      });

      if (!project) return res.status(404).json({ message: 'Project not found' });

      // удаляем картинки
      for (const img of project.images) {
        const filePath = path.join(__dirname, '../uploads', img.image_url);
        const cleanPath = filePath.replace('/uploads/', '');
        if (fs.existsSync(cleanPath)) fs.unlinkSync(cleanPath);
      }

      await project.destroy(); // cascade удалит переводы и изображения

      res.json({ message: 'Project deleted' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }

};

module.exports = projectController;
