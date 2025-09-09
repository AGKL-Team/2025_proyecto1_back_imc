import { createApp } from 'bootstrap';

let server: any;

export default async function handler(req, res) {
  if (!server) {
    server = await createApp();
  }
  return server(req, res);
}
