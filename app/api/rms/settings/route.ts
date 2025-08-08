// File: /pages/api/rms/setting.ts

import { NextApiRequest, NextApiResponse } from 'next';

let settings = {
  apiEndpoint: '',
  apiKey: '',
  username: '',
  password: '',
  autoDelete: false,
  railtelDataSync: false,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(settings);
  }

  if (req.method === 'POST') {
    settings = { ...settings, ...req.body };
    return res.status(200).json({ message: 'Settings saved successfully.' });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

