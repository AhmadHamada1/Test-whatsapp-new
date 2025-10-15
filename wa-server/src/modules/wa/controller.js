const addConnection = async (req, res) => {
    res.json({ success: true, message: "WIP: It will send a QR in response" });
};

const getConnectionStatus = async (req, res) => {
    res.json({ message: "WIP: It will send a status in response" });
};

const updateConnectionStatus = async (req, res) => {
    res.json({ message: "WIP: It will send a status in response" });
};

const disconnectConnection = async (req, res) => {
    res.json({ message: "WIP: It will send a status in response" });
};

const sendMessage = async (req, res) => {
    res.json({ message: "WIP: It will send a message in response" });
};

module.exports = {
    addConnection,
    sendMessage,
    getConnectionStatus,
    updateConnectionStatus,
    disconnectConnection,
};