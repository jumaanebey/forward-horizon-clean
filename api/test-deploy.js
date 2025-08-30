export default async function handler(req, res) {
  return res.status(200).json({
    message: 'Deployment test successful',
    timestamp: new Date().toISOString(),
    version: 'v2.2.0-deployment-test',
    method: req.method
  });
}