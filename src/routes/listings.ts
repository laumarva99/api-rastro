import { Router } from "express";
import { ObjectId } from "mongodb";
import { listingsCollection } from "../db";
import type { Filter } from "mongodb";
import type { Listing } from "../types";

const router = Router();

// Lo que se enseña de cada anuncio en un listado
const LIST_FIELDS = { title: 1, price: 1, category: 1, city: 1, status: 1 };

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

export default router;