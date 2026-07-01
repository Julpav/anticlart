const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'bot-stats.json');

class LocalDB {
    constructor() {
        this.filePath = DB_PATH;
        this.data = {};
        this._load();
    }

    _load() {
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            if (fs.existsSync(this.filePath)) {
                this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
            }
        } catch (err) {
            console.error('[DB] Failed to load:', err.message);
        }
    }

    _save() {
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
        } catch (err) {
            console.error('[DB] Failed to save:', err.message);
        }
    }

    increment(key, amount = 1) {
        this.data[key] = (this.data[key] || 0) + amount;
        this._save();
        return this.data[key];
    }

    get(key) {
        return this.data[key] ?? 0;
    }

    getAll() {
        return { ...this.data };
    }

    set(key, value) {
        this.data[key] = value;
        this._save();
    }
}

module.exports = new LocalDB();
