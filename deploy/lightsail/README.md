# AWS Lightsail deployment

Lightsail uses the same Ubuntu/Debian VPS setup as other providers. Use the
provider-neutral guide and installer:

- [`../vps/README.md`](../vps/README.md)
- [`../vps/setup.sh`](../vps/setup.sh)

For an existing Lightsail checkout, run:

```bash
sudo bash deploy/vps/setup.sh broadband.example.com
```

The VPS installer also normalizes Replit-only package URLs in the frontend
lockfile so package installation works outside Replit.