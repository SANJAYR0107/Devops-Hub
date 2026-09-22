class SSEService {
    constructor() {
        // Map of jobId -> Array of response objects (clients)
        this.clients = new Map();
    }

    /**
     * Adds a new client connection for a specific job
     * @param {string} jobId 
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     */
    addClient(jobId, req, res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Send an initial heartbeat/connection success
        res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

        if (!this.clients.has(jobId)) {
            this.clients.set(jobId, []);
        }
        this.clients.get(jobId).push(res);

        // Handle client disconnect
        req.on('close', () => {
            this.removeClient(jobId, res);
        });
    }

    /**
     * Removes a client connection
     * @param {string} jobId 
     * @param {object} res 
     */
    removeClient(jobId, res) {
        if (this.clients.has(jobId)) {
            const updatedClients = this.clients.get(jobId).filter(client => client !== res);
            if (updatedClients.length === 0) {
                this.clients.delete(jobId);
            } else {
                this.clients.set(jobId, updatedClients);
            }
        }
    }

    /**
     * Broadcasts a message to all clients connected to a specific jobId
     * @param {string} jobId 
     * @param {object} data 
     */
    broadcast(jobId, data) {
        if (this.clients.has(jobId)) {
            const serializedData = `data: ${JSON.stringify(data)}\n\n`;
            this.clients.get(jobId).forEach(client => {
                client.write(serializedData);
            });
        }
    }

    /**
     * Broadcasts a message and closes the connection for a specific jobId
     * @param {string} jobId 
     * @param {object} data 
     */
    close(jobId, data = null) {
        if (this.clients.has(jobId)) {
            if (data) {
                const serializedData = `data: ${JSON.stringify(data)}\n\n`;
                this.clients.get(jobId).forEach(client => client.write(serializedData));
            }
            this.clients.get(jobId).forEach(client => client.end());
            this.clients.delete(jobId);
        }
    }
}

// Export a singleton instance
module.exports = new SSEService();
