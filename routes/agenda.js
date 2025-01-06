import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";

const route = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, "../");
const dataFilePath = path.join(projectRoot, "data.json");

/**
 * @swagger
 * tags:
 *   - name: Agenda
 *     description: Agenda management
 */

/**
 * @swagger
 * /agenda:
 *   post:
 *     tags: [Agenda]
 *     summary: Create a new agenda
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Agenda created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date
 *                 status:
 *                   type: string
 *                 file:
 *                   type: string
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /agenda:
 *   get:
 *     tags: [Agenda]
 *     summary: Retrieve all agendas
 *     responses:
 *       200:
 *         description: A list of agendas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   status:
 *                     type: string
 *                   file:
 *                     type: string
 */

/**
 * @swagger
 * /agenda/{id}:
 *   get:
 *     tags: [Agenda]
 *     summary: Retrieve a single agenda by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the agenda to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agenda found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date
 *                 status:
 *                   type: string
 *                 file:
 *                   type: string
 *       404:
 *         description: Agenda not found
 */

/**
 * @swagger
 * /agenda/{id}:
 *   put:
 *     tags: [Agenda]
 *     summary: Update an agenda by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the agenda to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Agenda updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date
 *                 status:
 *                   type: string
 *                 file:
 *                   type: string
 *       404:
 *         description: Agenda not found
 */

/**
 * @swagger
 * /agenda/{id}:
 *   delete:
 *     tags: [Agenda]
 *     summary: Delete an agenda by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the agenda to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Agenda deleted successfully
 *       404:
 *         description: Agenda not found
 */

const generateShortId = () => {
    return Math.random().toString(36).substr(2, 8); // Generates 8 character long string
};

const getUniqueId = () => {
    let newId;
    do {
        newId = generateShortId();
    } while (readDataFromFile().some(agenda => agenda.id === newId)); // Check for collisions
    return newId;
};

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the uploads directory
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Get the file extension
        const name = path.basename(file.originalname, ext); // Get the original filename without extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Create a unique suffix
        // Retain the original file extension
        cb(null, `${name}-${uniqueSuffix}${ext}`); // e.g., filename-123456789.txt
    }
});

// Set up multer for file uploads
const upload = multer({storage}); // Files will be stored in the "uploads" directory

// Utility function to read data from the JSON file
const readDataFromFile = () => {
    const data = fs.readFileSync(dataFilePath);
    console.log(dataFilePath)
    return JSON.parse(data);
};

// Utility function to write data to the JSON file
const writeDataToFile = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Create a new agenda
route.post("/", upload.single("file"), (req, res) => {
    const { title, description, date, status } = req.body;
    const agendas = readDataFromFile();
    const newAgenda = {
        id: getUniqueId(),
        title,
        description,
        date,
        status: status || "Pending", // Default status
        file: req.file ? req.file.path : undefined
    };
    agendas.push(newAgenda);
    writeDataToFile(agendas);
    res.status(201).json(newAgenda);
});

// Read all agendas
route.get("/", (req, res) => {
    const agendas = readDataFromFile();
    res.json(agendas);
});

// Read a single agenda by ID
route.get("/:id", (req, res) => {
    const agendaId = req.params.id;
    const agendas = readDataFromFile();
    const agenda = agendas.find(a => a.id === agendaId);
    if (!agenda) {
        return res.status(404).json({ message: "Agenda not found" });
    }
    res.json(agenda);
});

// Update an agenda by ID
route.put("/:id", upload.single("file"), (req, res) => {
    const agendaId = req.params.id;
    let agendas = readDataFromFile();
    const index = agendas.findIndex(a => a.id === agendaId);
    if (index === -1) {
        return res.status(404).json({ message: "Agenda not found" });
    }
    const { title, description, date, status } = req.body;
    agendas[index] = {
        id: agendaId,
        title,
        description,
        date,
        status: status || agendas[index].status, // Update status if provided
        file: req.file ? req.file.path : agendas[index].file, // Update file path if a new file is uploaded
    };
    writeDataToFile(agendas);
    res.json(agendas[index]);
});

// Delete an agenda by ID
route.delete("/:id", (req, res) => {
    const agendaId = req.params.id;
    let agendas = readDataFromFile();
    const index = agendas.findIndex(a => a.id === agendaId);
    if (index === -1) {
        return res.status(404).json({ message: "Agenda not found" });
    }
    agendas.splice(index, 1);
    writeDataToFile(agendas);
    res.status(204).send(agendas);
});

export default route;