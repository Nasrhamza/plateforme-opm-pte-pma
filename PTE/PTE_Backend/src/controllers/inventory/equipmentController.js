const { ObjectId } = require("mongodb");
const Equipment = require("../../models/inventory/equiipment_type");
const Accessory = require("../../models/inventory/accessory_type");
const User = require("../../models/user");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const archiver = require("archiver");
require("dotenv").config();
const logo = process.env.IMAGES_PATH
module.exports.addEquipment = async function (req, res, next) {
    const body = req.body.name
    try {
        // if(body ===''){
        //     return res.status(400).json({message: "Name is required"});
        // }
        const equipment_type = await Equipment.create({
            name: req.body.name,
            brand: req.body.brand,
            model: req.body.model,
            serial_number: req.body.serial_number,
            user: req.body.user
        });
        res.status(201).json({
            message: "Equipment added successfully",
            data: equipment_type
        });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.getAllEquipments = async function (req, res, next) {
    try {
        const equipment_types = await Equipment.find({})
        res.status(200).json({
            message: "Equipments fetched successfully",
            data: equipment_types
        });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.getEquipmentById = async function (req, res, next) {
    const ID = req.params.id
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
        const equipment_type = await Equipment.findById(ID);
        res.status(200).json({
            message: "Equipment fetched successfully",
            data: equipment_type
        });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.getUserEquipments = async function (req, res, next) {
    const userID = req.params.id
    if (!ObjectId.isValid(userID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
        const equipments = await Equipment.find({ user: userID })
            .populate({
                path: 'user',
                select: '-password -salt'
            })
        res.status(200).json({
            message: "Equipments fetched successfully",
            data: equipments
        });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.deleteEquipment = async function (req, res, next) {
    const ID = req.params.id
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
        const equipment_type = await Equipment.findByIdAndDelete(ID);
        res.status(200).json({
            message: "Equipment deleted successfully",
            data: equipment_type
        });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.forwardEquipment = async function (req, res, next) {
    const ID = req.params.id
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
        await Equipment.findByIdAndUpdate(ID, { user: req.body.user }, { new: true });
        const updatedEquipment = await Equipment.findById(ID)
            .populate({
                path: 'user',
                select: '-password -salt'
            })
        res.status(200).json({
            message: "Equipment forwarded successfully",
            data: updatedEquipment
        });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.editEquipment = async function (req, res, next) {
    const ID = req.params.id
    const body = {...req.body}
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
        await Equipment.findByIdAndUpdate(ID, body, { new: true });
        const updatedEquipment = await Equipment.findById(ID)
            .populate({
                path: 'user',
                select: '-password -salt'
            })
        res.status(200).json({
            message: "Equipment updated successfully",
            data: updatedEquipment
        });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.downloadUserItems = async function (req, res, next) {
    const userID = req.params.id;
    if (!ObjectId.isValid(userID)) {
        return res.status(404).json("ID is not valid");
    }

    try {
        // Fetch data
        const equipments = await Equipment.find({ user: userID });
        const accessories = await Accessory.find({ user: userID });
        const user = await User.findById(userID);

        if (!user) {
            return res.status(404).json("User not found");
        }

        // Initialize PDF
        const doc = new PDFDocument({ size: "A4", margins: { top: 10, bottom: 10, left: 10, right: 10 } });

        const fileName = `fiche_materiel_${user.firstName}_${user.lastName}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        doc.pipe(res);

        // Header
        const headerX = 10;
        const headerY = 10;

        doc.image(logo + 'logo.png', headerX-20, headerY-10, { width: 200 })
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(`Le ${new Date().toLocaleDateString('fr-FR')}`, 500, headerY + 40);

        // Title (Centered)
        const titleY = headerY + 80;
        doc.fontSize(16)
            .font('Helvetica-Bold')
            .text('Fiche de récupération Materiels', 40, titleY, { align: 'center' });

        // User Details
        const detailsY = titleY + 40;
        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Matricule:', 50, detailsY, { continued: true }) // Bold "Matricule"
            .font('Helvetica')
            .text(` ${user.matricule || "N/A"}`) // Normal for the value
            .moveDown(0.5)
            .font('Helvetica-Bold')
            .text('Salarié:', 50, detailsY + 20, { continued: true }) // Bold "Salarié"
            .font('Helvetica')
            .text(` ${user.firstName} ${user.lastName}`); // Normal for the value

        // Equipments Table
        const equipmentTableY = detailsY + 60;
        doc.fontSize(14).font('Helvetica-Bold').text('Equippements', 50, equipmentTableY);
        createTableWithPositions(doc, 50, equipmentTableY + 20, [
            ['Nom', 'Marque', 'Model', 'Serial Number'], // Table headers
            ...equipments.map(equipment => [
                equipment.name || "N/A",
                equipment.brand || "N/A",
                equipment.model || "N/A",
                equipment.serial_number || "N/A",
            ]),
        ]);

        // Accessories Table
        const accessoryTableY = doc.y + 40;
        doc.fontSize(14).font('Helvetica-Bold').text('Accessoires', 50, accessoryTableY);
        createTableWithPositions(doc, 50, accessoryTableY + 20, [
            ['Nom', 'Marque', 'Model', 'Serial Number'], // Table headers
            ...accessories.map(accessory => [
                accessory.name || "N/A",
                accessory.brand || "N/A",
                accessory.model || "N/A",
                accessory.serial_number || "N/A",
            ]),
        ]);
        const phraseY = doc.y +20
        const signatureY = doc.y + 80; 
        const signatureXLeft = 50;
        const signatureXRight = 350;
        const signatureWidth = 200;

        doc.fontSize(12).font('Helvetica-Bold').text('Je, soussigné(e), atteste avoir réceptionné l`ensemble des équipements et accessoires en parfait état de fonctionnement.',  signatureXLeft, phraseY);

        doc.fontSize(12).font('Helvetica-Bold').text('Signature du salarié',  signatureXLeft, signatureY);
        doc.fontSize(10).font('Helvetica').text(`Tunis le ${new Date().toLocaleDateString('fr-FR')}`,  signatureXLeft+10, signatureY + 20);
        doc.fontSize(10).font('Helvetica').text(`.......................`,  signatureXLeft+20, signatureY + 40);

        doc.fontSize(12).font('Helvetica-Bold').text('Signature du récupérateur', signatureXRight, signatureY);
        doc.fontSize(10).font('Helvetica').text(`Tunis le .................................`,  signatureXRight+10, signatureY + 20);
        doc.end();
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createTableWithPositions = (doc, startX, startY, rows) => {
    const rowHeight = 20;
    const columnWidths = [120, 120, 120, 120]; // Adjust column widths as needed
    const pageHeight = doc.page.height - doc.page.margins.bottom;
    let currentY = startY;

    rows.forEach((row, rowIndex) => {
        // Check if the next row will fit on the current page
        if (currentY + rowHeight > pageHeight) {
            doc.addPage();
            currentY = doc.page.margins.top; // Reset Y position to the top margin

            // Redraw the header row on the new page
            // const headerRow = rows[0];
            // headerRow.forEach((cell, cellIndex) => {
            //     const x = startX + columnWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0);

            //     // Draw cell borders
            //     doc.rect(x, currentY, columnWidths[cellIndex], rowHeight).stroke();

            //     // Add text inside cells with padding
            //     doc.font('Helvetica-Bold').fontSize(10).text(cell, x + 5, currentY + 5, {
            //         width: columnWidths[cellIndex] - 10,
            //         align: 'center',
            //     });
            // });

            currentY += rowHeight; // Move Y position for the next row
        }

        // Render the current row
        row.forEach((cell, cellIndex) => {
            const x = startX + columnWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0);

            // Draw cell borders
            doc.rect(x, currentY, columnWidths[cellIndex], rowHeight).stroke();

            // Add text inside cells with padding
            doc.font(rowIndex === 0 ? 'Helvetica-Bold' : 'Helvetica') // Bold for header row
                .fontSize(10)
                .text(cell, x + 5, currentY + 5, {
                    width: columnWidths[cellIndex] - 10,
                    align: 'center',
                });
        });

        currentY += rowHeight; // Move Y position for the next row
    });

    // Update the Y position for the next content after the table
    doc.y = currentY + 10; // Add spacing after the table
};

module.exports.downloadAllItems = async function (req, res, next) {
    try {
        const equipments = await Equipment.find().populate({
            path: 'user',
            select: '-password -salt',
        });
        const accessories = await Accessory.find().populate({
            path: 'user',
            select: '-password -salt',
        });

        // Initialize PDF
        const doc = new PDFDocument({ size: 'A4', margins: { top: 10, bottom: 10, left: 10, right: 10 } });

        const fileName = `fiche_inventaire.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        doc.pipe(res);

        // Header
        const headerX = 0;
        const headerY = 0;

        doc.image(logo + 'logo.png', headerX-20, headerY-10, { width: 200 })
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(`le ${new Date().toLocaleDateString('fr-FR')}`, 500, headerY + 40);

        // Title (Centered)
        const titleY = headerY + 80;
        doc.fontSize(16)
            .font('Helvetica-Bold')
            .text('Fiche inventaire', 40, titleY, { align: 'center' });


        // Equipments Table
        const equipmentTableY = titleY + 40;
        doc.fontSize(14).font('Helvetica-Bold').text('Équipements', 30, equipmentTableY);
        createTable(doc, 30, equipmentTableY + 20, [
            ['Matricule', 'Salarié', 'Nom', 'Marque', 'Modèle', 'Serial Number'], // Table headers
            ...equipments.map((equipment) => [
                equipment.user?.matricule || 'N/A',
                `${equipment.user?.firstName || 'N/A'} ${equipment.user?.lastName || ''}`.trim(),
                equipment.name || 'N/A',
                equipment.brand || 'N/A',
                equipment.model || 'N/A',
                equipment.serial_number || 'N/A',
            ]),
        ]);

        // Accessories Table
        const accessoryTableY = doc.y + 40;
        doc.fontSize(14).font('Helvetica-Bold').text('Accessoires', 30, accessoryTableY);
        createTable(doc, 30, accessoryTableY + 20, [
            ['Matricule', 'Salarié', 'Nom', 'Marque', 'Modèle', 'Serial Number'], // Table headers
            ...accessories.map((accessory) => [
                accessory.user?.matricule || 'N/A',
                `${accessory.user?.firstName || 'N/A'} ${accessory.user?.lastName || ''}`.trim(),
                accessory.name || 'N/A',
                accessory.brand || 'N/A',
                accessory.model || 'N/A',
                accessory.serial_number || 'N/A',
            ]),
        ]);

        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Error generating PDF' });
    }
};

const createTable = (doc, startX, startY, rows) => {
    const rowHeight = 30;
    const columnWidths = [60, 140, 80, 80, 80, 85];
    const pageHeight = doc.page.height - doc.page.margins.bottom;
    let currentY = startY;

    rows.forEach((row, rowIndex) => {
        // Check if the current row fits on the page; if not, create a new page
        if (currentY + rowHeight > pageHeight) {
            doc.addPage();
            currentY = doc.page.margins.top; // Reset Y position to the top margin

            // Redraw the header row on the new page
            // const headerRow = rows[0];
            // headerRow.forEach((cell, cellIndex) => {
            //     const x = startX + columnWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0);

            //     // Draw cell borders
            //     doc.rect(x, currentY, columnWidths[cellIndex], rowHeight).stroke();

            //     // Add text inside cells with padding
            //     doc.font('Helvetica-Bold').fontSize(8).text(cell, x + 5, currentY + 5, {
            //         width: columnWidths[cellIndex] - 10,
            //         align: 'center',
            //     });
            // });

            currentY += rowHeight; // Move Y position for the next row
        }

        // Render the current row
        row.forEach((cell, cellIndex) => {
            const x = startX + columnWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0);

            // Draw cell borders
            doc.rect(x, currentY, columnWidths[cellIndex], rowHeight).stroke();

            // Add text inside cells with padding
            doc.font(rowIndex === 0 ? 'Helvetica-Bold' : 'Helvetica') // Bold for header row
                .fontSize(8)
                .text(cell, x + 5, currentY + 5, {
                    width: columnWidths[cellIndex] - 10,
                    align: 'center',
                });
        });

        currentY += rowHeight; // Move Y position for the next row
    });

    // Update the Y position for the next content after the table
    doc.y = currentY + 10; // Add spacing after the table
};
// module.exports.downloadUserItems2 = async function (req, res, next) {
//     try {
//         const accessories = await Accessory.find({ name: "PORTABLE" }).populate({
//             path: "user",
//             select: "matricule firstName lastName",
//         });

//         if (accessories.length === 0) {
//             return res.status(404).json({ message: "No users with accessory PORTABLE found" });
//         }

//         // Create a zip archive
//         const zipFileName = `users_portable_pdfs.zip`;
//         res.setHeader("Content-Type", "application/zip");
//         res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`);
        
//         const archive = archiver("zip", { zlib: { level: 9 } });
//         archive.pipe(res);

//         // Generate PDFs for each user
//         for (let i = 0; i < accessories.length; i++) {
//             const user = accessories[i].user;
//             if (!user) continue;

//             // Create PDF buffer
//             const doc = new PDFDocument({ size: "A4", margins: { top: 10, bottom: 10, left: 10, right: 10 } });
//             const fileName = `fiche_materiel_${user.firstName}_${user.lastName}.pdf`;

//             const pdfBuffer = await new Promise((resolve) => {
//                 const buffers = [];
//                 doc.on("data", buffers.push.bind(buffers));
//                 doc.on("end", () => resolve(Buffer.concat(buffers)));

//                 // Header
//                 const headerX = 10;
//                 const headerY = 10;
//                 doc.image(logo + "logo.png", headerX - 20, headerY - 10, { width: 200 })
//                     .fontSize(10)
//                     .font("Helvetica-Bold")
//                     .text(`Le ${new Date().toLocaleDateString("fr-FR")}`, 500, headerY + 40);

//                 // Title
//                 const titleY = headerY + 80;
//                 doc.fontSize(16)
//                     .font("Helvetica-Bold")
//                     .text("Fiche de récupération Materiels", 40, titleY, { align: "center" });

//                 // User Details
//                 const detailsY = titleY + 40;
//                 doc.fontSize(12)
//                     .font("Helvetica-Bold")
//                     .text("Matricule:", 50, detailsY, { continued: true })
//                     .font("Helvetica")
//                     .text(` ${user.matricule || "N/A"}`)
//                     .moveDown(0.5)
//                     .font("Helvetica-Bold")
//                     .text("Salarié:", 50, detailsY + 20, { continued: true })
//                     .font("Helvetica")
//                     .text(` ${user.firstName} ${user.lastName}`);

//                 // Accessory Table
//                 const accessoryTableY = detailsY + 60;
//                 doc.fontSize(14).font("Helvetica-Bold").text("Accessoires", 50, accessoryTableY);
//                 createTableWithPositions2(doc, 50, accessoryTableY + 20, [
//                     ["Nom", "Marque", "Model", "Serial Number"],
//                     [
//                         accessories[i].name || "N/A",
//                         accessories[i].brand || "N/A",
//                         accessories[i].model || "N/A",
//                         accessories[i].serial_number || "N/A",
//                     ],
//                 ]);
//                 // Signature Sections
//                 const phraseY = doc.y + 20;
//                 const signatureY = doc.y + 80;
//                 const signatureXLeft = 50;
//                 const signatureXRight = 350;
//                 const signatureWidth = 200;
//                 doc.fontSize(12)
//                     .font("Helvetica-Bold")
//                     .text(
//                         "Je, soussigné(e), atteste avoir réceptionné l`ensemble des équipements et accessoires en parfait état de fonctionnement.",
//                         signatureXLeft,
//                         phraseY
//                     );

//                 doc.fontSize(12).font("Helvetica-Bold").text("Signature du salarié", signatureXLeft, signatureY);
//                 doc.fontSize(10).font("Helvetica").text(`Tunis le ${new Date().toLocaleDateString("fr-FR")}`, signatureXLeft + 10, signatureY + 20);
//                 doc.fontSize(10).font("Helvetica").text(`.......................`, signatureXLeft + 20, signatureY + 40);

//                 doc.fontSize(12).font("Helvetica-Bold").text("Signature du récupérateur", signatureXRight, signatureY);
//                 doc.fontSize(10).font("Helvetica").text(`Tunis le .................................`, signatureXRight + 10, signatureY + 20);

//                 doc.end();
//             });

//             // Add PDF to ZIP
//             archive.append(pdfBuffer, { name: fileName });
//         }

//         archive.finalize(); // Finish and send ZIP
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(error);
//     }
// };

// // Updated Table Function
// const createTableWithPositions2 = (doc, startX, startY, rows) => {
//     const rowHeight = 20;
//     const columnWidths = [120, 120, 120, 120];
//     const pageHeight = doc.page.height - doc.page.margins.bottom;
//     let currentY = startY;

//     rows.forEach((row, rowIndex) => {
//         if (currentY + rowHeight > pageHeight) {
//             doc.addPage();
//             currentY = doc.page.margins.top;
//         }

//         row.forEach((cell, cellIndex) => {
//             const x = startX + columnWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0);
//             doc.rect(x, currentY, columnWidths[cellIndex], rowHeight).stroke();
//             doc.font(rowIndex === 0 ? "Helvetica-Bold" : "Helvetica")
//                 .fontSize(10)
//                 .text(cell, x + 5, currentY + 5, { width: columnWidths[cellIndex] - 10, align: "center" });
//         });

//         currentY += rowHeight;
//     });

//     doc.y = currentY + 10;
// };

