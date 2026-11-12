import { Router } from "express";
import { ObjectId } from "mongodb";
import { listingsCollection, usersCollection } from "../db";
import type { Filter } from "mongodb";
import type { Listing } from "../types";

const router = Router();

// Lo que se enseña de cada anuncio en un listado
const LIST_FIELDS = { title: 1, price: 1, category: 1, city: 1, status: 1 };

// ¿Es un texto que no está vacío?
function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim() !== "";
}

// ---------- GET /api/listings (listado con filtros) ----------
router.get("/", async (req, res) => {
    const filter: Filter<Listing> = {};

    if (typeof req.query.category === "string") {
        filter.category = req.query.category;
    }
    if (typeof req.query.city === "string") {
        filter.city = req.query.city;
    }

    if (req.query.maxPrice !== undefined) {
        const maxPrice = Number(req.query.maxPrice);

        if (typeof req.query.maxPrice !== "string" || Number.isNaN(maxPrice)) {
            res.status(400).json({ error: "maxPrice debe ser un número" });
            return;
        }

        filter.price = { $lte: maxPrice };
    }


    const listings = await listingsCollection()
        .find(filter)
        .project(LIST_FIELDS)
        .sort({ publishedAt: -1 })
        .toArray();

    res.json(listings);
});

// ---------- GET /api/listings/:id (ficha) ----------
router.get("/:id", async (req, res) => {
    // 1. ¿El id tiene forma de ObjectId? Si no → 400
    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json({ error: "El ID no tiene un formato válido" });
        return;
    }

    // 2. Suma 1 a las visitas y devuelve el anuncio ya actualizado
    const listing = await listingsCollection().findOneAndUpdate(
        { _id: new ObjectId(req.params.id) }, // cuál
        { $inc: { views: 1 } },               // suma 1 a views
        { returnDocument: "after" }           // devuélvelo ya con la visita sumada
    );

    // 3. Si no existe → 404
    if (!listing) {
        res.status(404).json({ error: "Anuncio no encontrado" });
        return;
    }

    // 4. Todo bien → 200 con el anuncio completo
    res.json(listing);
});


// ---------- POST /api/listings (publicar un anuncio) ----------
router.post("/", async (req, res) => {
    const body = req.body ?? {};
    const { title, description, price, category, city, sellerId, attributes } = body;

    // 1. Los textos obligatorios
    if (!isNonEmptyString(title)) {
        res.status(400).json({ error: "title es obligatorio y debe ser un texto" });
        return;
    }
    if (!isNonEmptyString(description)) {
        res.status(400).json({ error: "description es obligatorio y debe ser un texto" });
        return;
    }
    if (!isNonEmptyString(category)) {
        res.status(400).json({ error: "category es obligatorio y debe ser un texto" });
        return;
    }
    if (!isNonEmptyString(city)) {
        res.status(400).json({ error: "city es obligatorio y debe ser un texto" });
        return;
    }

    // 2. El precio: número y mayor o igual que 0
    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
        res.status(400).json({ error: "price debe ser un número mayor o igual que 0" });
        return;
    }

    // 3. Los atributos: opcionales, pero si llegan tienen que ser un objeto
    if (
        attributes !== undefined &&
        (typeof attributes !== "object" || attributes === null || Array.isArray(attributes))
    ) {
        res.status(400).json({ error: "attributes debe ser un objeto" });
        return;
    }

    // 4. El vendedor: formato de ObjectId...
    if (typeof sellerId !== "string" || !ObjectId.isValid(sellerId)) {
        res.status(400).json({ error: "sellerId no tiene un formato válido" });
        return;
    }

    // ...y tiene que existir. MongoDB no lo comprueba: lo hacemos nosotros
    const seller = await usersCollection().findOne({ _id: new ObjectId(sellerId) });
    if (!seller) {
        res.status(400).json({ error: "No existe ningún usuario con ese sellerId" });
        return;
    }

    // 5. Construimos el anuncio campo a campo (nunca req.body tal cual)
    const newListing: Listing = {
        title: title.trim(),
        description: description.trim(),
        price,
        category: category.trim(),
        status: "AVAILABLE",                         // siempre disponible al publicar
        city: city.trim(),
        publishedAt: new Date(),                     // la fecha de ahora
        views: 0,                                    // nadie lo ha visto todavía
        seller: { id: seller._id, name: seller.name }, // el nombre se copia del usuario
        photos: [],                                  // sin fotos al principio
        attributes: attributes ?? {}                 // si no llegan, objeto vacío
    };

    // 6. Lo guardamos y respondemos 201 con el _id que ha creado MongoDB
    const result = await listingsCollection().insertOne(newListing);
    res.status(201).json({ _id: result.insertedId, ...newListing });
});


export default router;