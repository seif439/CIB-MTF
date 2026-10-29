const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const SECRET_KEY = "10773641093";

app.use(express.json());
app.use(express.static(path.join(__dirname)));

let liveServerData = {
    universeId: "",
    lastSeen: null,
    players: []
};
let pendingCommands = [];

app.post('/api/roblox/bridge', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader !== SECRET_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { universeId, players } = req.body;
    liveServerData.universeId = universeId || liveServerData.universeId;
    liveServerData.players = players || [];
    liveServerData.lastSeen = new Date();

    const commandsToSend = [...pendingCommands];
    pendingCommands = [];

    res.json({ success: true, commands: commandsToSend });
});

app.post('/api/admin/command', (req, res) => {
    const { action, username, reason } = req.body;
    
    if (!action || !username) {
        return res.status(400).json({ error: "بيانات ناقصة" });
    }

    pendingCommands.push({
        action,
        username,
        reason: reason || "إجراء إداري"
    });

    res.json({ success: true, message: "تم تسجيل الأمر بنجاح" });
});

app.get('/api/admin/status', (req, res) => {
    res.json(liveServerData);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});