export default function handler(req, res) {
  return res.status(200).json({
    message: 'Hello from Forward Horizon API',
    timestamp: new Date().toISOString()
  });
}