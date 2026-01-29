# Har safar pushdan keyin — serverni yangilang

GitHubga push qilgach, serverda (SSH bilan kirib) quyidagi buyruqlarni ishlating:

```bash
cd /opt/backend && git pull && source venv/bin/activate && pip install -r requirements.txt 2>/dev/null || pip install django djangorestframework djangorestframework-simplejwt django-cors-headers gunicorn && python manage.py migrate && sudo systemctl restart advokat-backend

cd /opt/frontend && git pull && npm ci && npm run build

sudo systemctl reload nginx
```

**Kirish:** `ssh root@167.71.53.238`

**Saytlar:** https://advokat.cdcgroup.uz | https://advokatapi.cdcgroup.uz
