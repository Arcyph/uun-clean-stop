"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const rf = fs.promises.readFile;
const wf = fs.promises.writeFile;
const mkdir = fs.promises.mkdir;

const DEFAULT_STORAGE_PATH = path.join(__dirname, "storage", "stops.json");

class StopDao {
    constructor(storagePath) {
        this.storagePath = storagePath 
            ? storagePath 
            : DEFAULT_STORAGE_PATH;
    }

    async create(entity) {
        const list = await this._loadAll();

        // based on node version
        entity.id = crypto.randomUUID 
            ? crypto.randomUUID()  
            : crypto.randomBytes(16).toString("hex");

        list.push(entity);

        await this._saveAll(list);
        return entity;
    }

    async get(id) {
        const list = await this._loadAll();
        return list.find((b) => b.id === id) || null;
    }

    async getByCode(code) {
        const list = await this._loadAll();
        const c = Number(code);

        if (!Number.isFinite(c)) return null;

        return list.find((s) => s.code === c) || null;
    }

    async update(entity) {
        const list = await this._loadAll();
        const index = list.findIndex((b) => b.id === entity.id);

        if (index < 0) throw new Error(`Record with given id ${entity.id} does not exist`);

        list[index] = { ...list[index], ...entity };

        await this._saveAll(list);
        return list[index];
    }

    async delete(id) {
        const list = await this._loadAll();
        const index = list.findIndex((b) => b.id === id);

        if (index < 0) return false;

        list.splice(index, 1);
        await this._saveAll(list);
        return true;
    }

    async list() {
        return await this._loadAll();
    }

    async listGeoJsonByBbox(bbox) {
        if (!Array.isArray(bbox) || bbox.length !== 4) throw new Error("bbox must be [minLon, minLat, maxLon, maxLat]");

        const list = await this._loadAll();

        const features = [];
        for (const item of list) {
            const lon = Number(item.longitude);
            const lat = Number(item.latitude);

            if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
            if (!this._isPointInBbox(lon, lat, bbox)) continue;

            features.push({
                type: "Feature",
                id: item.id,
                geometry: { 
                    type: "Point", coordinates: [lon, lat] 
                },
                properties: {
                    id: item.id,
                    code: item.code,
                    name: item.name,
                    note: item.note ?? null
                },
            });
        }

        return { type: "FeatureCollection", features };
    }


    async _loadAll() {
        const filePath = this.storagePath;

        let raw;
        try {
            raw = await rf(filePath, "utf8");
        } catch (e) {
            if (e.code === "ENOENT") {
                console.info("No storage found, initializing new one...");
                return [];
            }

            throw new Error(`Unable to read storage: ${filePath}`);
        }

        try {
            const data = JSON.parse(raw);
            return Array.isArray(data) 
                ? data 
                : [];
        } catch {
            throw new Error(`Invalid JSON format in storage: ${filePath}`);
        }
    }

    async _saveAll(list) {
        const filePath = this.storagePath;
        const dir = path.dirname(filePath);

        await mkdir(dir, { recursive: true });
        await wf(filePath, JSON.stringify(list, null, 2), "utf8");
    }

    _isPointInBbox(lon, lat, bbox) {
        const [minLon, minLat, maxLon, maxLat] = bbox;

        if (lat < minLat || lat > maxLat) return false;
        if (minLon <= maxLon) return lon >= minLon && lon <= maxLon;

        return lon >= minLon || lon <= maxLon;
    }   
}

module.exports = StopDao;