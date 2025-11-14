const { Partner } = require("../models");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

class PartnerController {
  static async getAll(req, res) {
    try {
      const partners = await Partner.findAll({
        where: { parentId: null },
        include: [{ model: Partner, as: "branches" }],
        order: [
          ["id", "ASC"],
          [{ model: Partner, as: "branches" }, "id", "ASC"],
        ],
      });
      res.status(200).json(partners);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Gagal mengambil data mitra" });
    }
  }

  static async create(req, res) {
    try {
      const { name, parentId } = req.body;
      const isMain = !parentId;
      let logoUrl = null;
      if (req.file && req.file.filename) {
        // store relative path to be served from /uploads
        logoUrl = `/uploads/partners/${req.file.filename}`;
      }

      const partner = await Partner.create({
        name,
        logoUrl,
        isMain,
        parentId: parentId || null,
      });
      res.status(201).json(partner);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Gagal membuat mitra" });
    }
  }

  static async update(req, res) {
    try {
      const id = Number(req.params.id);
      const partner = await Partner.findByPk(id);
      if (!partner)
        return res.status(404).json({ message: "Mitra tidak ditemukan" });

      const { name, parentId } = req.body;
      if (name) partner.name = name;
      partner.parentId = parentId || null;
      partner.isMain = !partner.parentId;

      if (req.file && req.file.filename) {
        // delete old file if exists
        if (partner.logoUrl) {
          const rel = partner.logoUrl.replace(/^\//, ""); // remove leading /
          const p = path.join(process.cwd(), rel);
          try {
            if (fs.existsSync(p)) fs.unlinkSync(p);
          } catch (e) {
            console.warn("Gagal menghapus file lama:", p, e.message);
          }
        }
        partner.logoUrl = `/uploads/partners/${req.file.filename}`;
      }

      await partner.save();
      res.status(200).json(partner);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Gagal memperbarui mitra" });
    }
  }

  static async remove(req, res) {
    try {
      const id = Number(req.params.id);
      const found = await Partner.findByPk(id);
      if (!found)
        return res.status(404).json({ message: "Mitra tidak ditemukan" });
      // find this partner and any branches that belong to it
      const toDelete = await Partner.findAll({
        where: {
          [Op.or]: [{ id }, { parentId: id }],
        },
      });

      // remove logo files for each
      for (const item of toDelete) {
        if (item.logoUrl) {
          const rel = item.logoUrl.replace(/^\//, "");
          const p = path.join(process.cwd(), rel);
          try {
            if (fs.existsSync(p)) fs.unlinkSync(p);
          } catch (e) {
            console.warn("Gagal menghapus file saat delete:", p, e.message);
          }
        }
      }

      // delete partner and its branches in one query
      await Partner.destroy({
        where: {
          [Op.or]: [{ id }, { parentId: id }],
        },
      });

      res.status(200).json({ message: "Mitra dan cabang terkait dihapus" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Gagal menghapus mitra" });
    }
  }
}

module.exports = PartnerController;
