// backend/api/ai.js
import * as aiController from '../controllers/ai.controller.js';

module.exports = (req, res) => {
  if (req.method === 'GET' && req.url === '/api/get-result') {
    aiController.getResult(req, res);  // Call the AI controller
  } else {
    res.status(404).send({ message: 'Not Found' });
  }
};
