import { Router } from "express";
import { ObjectId } from "mongodb";
import { listingsCollection, offersCollection, usersCollection } from "../db";
import type { Offer } from "../types";

const router = Router();

// ---------- POST /api/offers (hacer una oferta) ----------
router.post("/", async (req, res) => {
  const { listingId, buyerId, amount } = req.body ?? {};

  // 1. Los dos ids tienen que tener formato de ObjectId
  if (
    typeof listingId !== "string" || !ObjectId.isValid(listingId) ||
    typeof buyerId !== "string" || !ObjectId.isValid(buyerId)
  ) {
    res.status(400).json({ error: "listingId y buyerId deben tener un formato válido" });
    return;
  }

  // 2. El importe tiene que ser un número mayor que 0
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ error: "amount debe ser un número mayor que 0" });
    return;
  }

  // 3. El anuncio tiene que existir
  const listing = await listingsCollection().findOne({ _id: new ObjectId(listingId) });
  if (!listing) {
    res.status(400).json({ error: "No existe ningún anuncio con ese listingId" });
    return;
  }

  // 4. El comprador tiene que existir
  const buyer = await usersCollection().findOne({ _id: new ObjectId(buyerId) });
  if (!buyer) {
    res.status(400).json({ error: "No existe ningún usuario con ese buyerId" });
    return;
  }

  // 5. El anuncio tiene que estar disponible
  if (listing.status !== "AVAILABLE") {
    res.status(409).json({ error: "El anuncio no está disponible" });
    return;
  }

  // 6. Construimos la oferta con las copias del anuncio y del comprador
  const newOffer: Offer = {
    amount,
    status: "PENDING",                                                    // siempre pendiente al crearla
    createdAt: new Date(),                                                // la fecha de ahora
    listing: { id: listing._id, title: listing.title, price: listing.price }, // copia del anuncio
    buyer: { id: buyer._id, name: buyer.name }                            // copia del comprador
  };

  const result = await offersCollection().insertOne(newOffer);
  res.status(201).json({ _id: result.insertedId, ...newOffer });
});

export default router;