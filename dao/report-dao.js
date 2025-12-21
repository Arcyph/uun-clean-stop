"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const rf = fs.promises.readFile;
const wf = fs.promises.writeFile;
const mkdir = fs.promises.mkdir;

const DEFAULT_STORAGE_PATH = path.join(__dirname, "storage", "reports.json");

class ReportDao {
    constructor(storagePath) {
        this.storagePath = storagePath 
            ? storagePath 
            : DEFAULT_STORAGE_PATH;
    }

    async create(entity) {
        const list = await this._loadAll();

        entity.id = crypto.randomUUID 
            ? crypto.randomUUID()  
            : crypto.randomBytes(16).toString("hex");
        
        const nowIso = new Date().toISOString();
        entity.createdAt = nowIso;
        entity.updatedAt = nowIso;

        if (!entity.trackingCode) {
            let code;
            do {
                code = this._generateTrackingCode();
            } while (list.some((r) => r.trackingCode === code));
            entity.trackingCode = code;
        }

        list.push(entity);
        await this._saveAll(list);

        return entity;
    }

    async get(id) {
        const list = await this._loadAll();
        return list.find((b) => b.id === id) || null;
    }

    async getByTrackingCode(trackingCode) {
        const list = await this._loadAll();
        const code = String(trackingCode ?? "").trim();
        if (!code) return null;

        return list.find((b) => b.trackingCode === code) || null;
    }

    async listByStopId(stopId) {
        const list = await this._loadAll();
        const id = String(stopId ?? "").trim();
        if (!id) return [];

        const result = [];
        for (const r of list) {
            if (r.stopId === id) result.push(r);
        }
        return result;
    }

    async update(entity) {
        const list = await this._loadAll();
        const index = list.findIndex((b) => b.id === entity.id);

        if (index < 0) throw new Error(`Record with given id ${entity.id} does not exist`);

        const merged = { ...list[index], ...entity };
        merged.updatedAt = new Date().toISOString();

        list[index] = merged;

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

    _generateTrackingCode() {
        const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        return `${this._randomFromAlphabet(alphabet, 6)}`;
    }

    _randomFromAlphabet(alphabet, len) {
        const bytes = crypto.randomBytes(len);
        let out = "";
        for (let i = 0; i < len; i++) {
            out += alphabet[bytes[i] % alphabet.length];
        }
        return out;
    }
}

module.exports = ReportDao;
