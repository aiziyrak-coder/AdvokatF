# Adolat AI - Advokatlar uchun Intellektual Platforma

Adolat AI - bu O'zbekiston advokatlari uchun maxsus ishlab chiqilgan, sun'iy intellekt (AI) asosidagi yordamchi platforma. U huquqiy tahlil, strategiya ishlab chiqish va hujjatlar bilan ishlash jarayonlarini avtomatlashtiradi.

## Asosiy Xususiyatlar

- **AI Tahlilchi**: Ish hujjatlarini tahlil qiladi va huquqiy strategiya taklif qiladi.
- **Sud Zali Simulyatori**: Sud jarayonini simulyatsiya qilib, advokatni tayyorlaydi (barcha bosqichlar uchun).
- **Hujjatlar Generatori**: Da'vo arizalari va boshqa protsessual hujjatlarni avtomatik yaratadi.
- **Bilimlar Bazasi**: Ish bo'yicha barcha ma'lumotlarni tizimli saqlaydi.
- **Backend Integratsiyasi**: Ma'lumotlarni xavfsiz saqlash va foydalanuvchilarni boshqarish (Django).

## O'rnatish va Ishga Tushirish

### Talablar

- Node.js (v18+)
- Python (v3.10+)
- Google Gemini API kaliti

### 1. Loyihani yuklab olish

```bash
git clone https://github.com/yourusername/adolat-ai.git
cd adolat-ai
```

### 2. Frontendni sozlash

```bash
cd frontend
npm install
```

`.env.local` faylini yarating va API kalitingizni kiriting:

```
VITE_GEMINI_API_KEY=sizning_api_kalitingiz
```

### 3. Backendni sozlash

Yangi terminalda:

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
# Agar requirements.txt yo'q bo'lsa:
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt google-generativeai python-dotenv

python manage.py migrate
python manage.py runserver
```

Backend http://localhost:8000 da ishga tushadi.

### 4. Dasturni ishga tushirish

Frontend terminalida:

```bash
npm run dev
```

Brauzerda http://localhost:3000 manzilini oching.

## Texnologiyalar Stacki

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Django, Django REST Framework
- **AI**: Google Gemini Pro 1.5
- **Ma'lumotlar Bazasi**: SQLite (Default), PostgreSQL (tavsiya etiladi)

## Litsenziya

MIT
