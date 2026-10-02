const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const DB_URI = process.env.CONNECTION_STRING;
const MODEL_ROOT = path.join(__dirname, "..", "src", "models");

if (!DB_URI) {
  throw new Error("Missing CONNECTION_STRING in environment");
}

function walkJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkJsFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".js")) files.push(full);
  }
  return files;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate() {
  return new Date(Date.now() - randomInt(1, 900) * 24 * 60 * 60 * 1000);
}

function fakeString(field, index) {
  const f = field.toLowerCase();
  if (f.includes("email")) return `seed.${field}.${index}@prologic.local`;
  if (f.includes("phone")) return `+2162${String(index).padStart(7, "0")}`;
  if (f.includes("password")) return "$2a$10$T5R6sTQzQh7n8DUY2h7n8e9Q7jHhQw3uS9wD1s1q3O4k5R6t7Y8mW";
  if (f.includes("url")) return `https://example.local/${field}/${index}`;
  if (f.includes("name")) return `${field}_${index}`;
  if (f.includes("status")) return "Active";
  if (f.includes("title")) return `Title ${index}`;
  if (f.includes("code")) return `${field.toUpperCase()}-${1000 + index}`;
  return `${field}_${index}`;
}

function pickRefId(refModel, idPool) {
  const ids = idPool.get(refModel) || [];
  if (ids.length) return ids[randomInt(0, ids.length - 1)];
  return new mongoose.Types.ObjectId();
}

function genValue(fieldName, schemaType, index, idPool) {
  const { instance, options } = schemaType;
  if (options && Array.isArray(options.enum) && options.enum.length > 0) {
    return options.enum[randomInt(0, options.enum.length - 1)];
  }
  if (options && options.ref) return pickRefId(options.ref, idPool);

  switch (instance) {
    case "String":
      return fakeString(fieldName, index);
    case "Number":
      return randomInt(1, 100);
    case "Boolean":
      return index % 2 === 0;
    case "Date":
      return randomDate();
    case "ObjectID":
      return new mongoose.Types.ObjectId();
    case "Array": {
      const caster = schemaType.caster;
      if (!caster) return [];
      if (Array.isArray(caster.enumValues) && caster.enumValues.length > 0) {
        return [caster.enumValues[randomInt(0, caster.enumValues.length - 1)]];
      }
      if (caster.options && caster.options.ref) {
        return [pickRefId(caster.options.ref, idPool)];
      }
      if (caster.instance === "String") return [fakeString(fieldName, index)];
      if (caster.instance === "Number") return [randomInt(1, 20), randomInt(21, 40)];
      if (caster.instance === "Boolean") return [true, false];
      if (caster.instance === "Date") return [randomDate()];
      if (caster.instance === "ObjectID") return [new mongoose.Types.ObjectId()];
      return [];
    }
    case "Embedded":
      return {};
    case "Mixed":
      return { value: fakeString(fieldName, index) };
    default:
      return fakeString(fieldName, index);
  }
}

function buildDoc(model, index, idPool) {
  const doc = {};
  model.schema.eachPath((fieldName, schemaType) => {
    if (["_id", "__v", "createdAt", "updatedAt"].includes(fieldName)) return;
    if (fieldName.includes(".")) return;
    doc[fieldName] = genValue(fieldName, schemaType, index, idPool);
  });
  return doc;
}

async function main() {
  const modelFiles = walkJsFiles(MODEL_ROOT);
  for (const file of modelFiles) {
    try {
      const exported = require(file);
      if (!exported) continue;
      if (exported.modelName) continue;
    } catch (e) {
      // ignore non-model helper files
    }
  }

  await mongoose.connect(DB_URI);
  await mongoose.connection.dropDatabase();

  const models = Object.values(mongoose.models).filter((m) => m && m.modelName);
  const idPool = new Map();

  models.sort((a, b) => {
    const ap = a.modelName.toLowerCase().includes("user") ? 0 : 1;
    const bp = b.modelName.toLowerCase().includes("user") ? 0 : 1;
    return ap - bp;
  });

  for (const model of models) {
    const count = model.modelName.toLowerCase().includes("user") ? 12 : 8;
    const createdIds = [];
    for (let i = 0; i < count; i++) {
      let saved = null;
      for (let attempt = 0; attempt < 4 && !saved; attempt++) {
        const payload = buildDoc(model, i + attempt * 100, idPool);
        try {
          const doc = new model(payload);
          await doc.save();
          saved = doc;
        } catch (err) {
          // retry with a different payload
        }
      }
      if (saved) createdIds.push(saved._id);
    }
    idPool.set(model.modelName, createdIds);
    console.log(`${model.modelName}: inserted ${createdIds.length}`);
  }

  console.log("PTE reseed complete.");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Seeding failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
