# 🚀 Free Web Deployment Guide | RoadSafe India 360

This repository is pre-configured for **100% free hosting** on the public web with zero server costs. You can choose any of the options below.

---

## 🌟 Option 1: Render.com (Recommended — 2 Minutes, Easiest)

Render offers a generous **Free Tier Web Service** with automatic deployment on every GitHub push, free custom domains, and automatic SSL.

### Steps:
1. **Sign In**: Go to [https://dashboard.render.com/](https://dashboard.render.com/) and sign in with your GitHub account (`aryan0416`).
2. **Deploy Blueprint**:
   - Click **"New +"** in the top right corner.
   - Choose **"Blueprint"**.
   - Select your repository: **`aryan0416/014_3`**.
   - Render will automatically read [`render.yaml`](file:///C:/Users/Asus/.gemini/antigravity-ide/scratch/roadsafe-india-360/render.yaml) from this repository and configure:
     - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
     - **Start Command**: `python run.py`
     - **Environment Variables**: `CARTO_API_KEY`, `VITE_CARTO_API_KEY`
3. **Click "Apply"**:
   - Render will build and deploy the unified app.
   - Within ~2 minutes, your project will be live at:
     ```
     https://roadsafe-india-360.onrender.com
     ```

---

## ⚡ Option 2: Hugging Face Spaces (Best for AI/ML — 16GB RAM Free)

Hugging Face Spaces offers **16GB RAM, 2 vCPUs, and 50GB storage 100% FREE**, making it ideal for PyTorch and XGBoost workloads.

### Steps:
1. Go to [https://huggingface.co/new-space](https://huggingface.co/new-space).
2. Set Space Name: `roadsafe-india-360`.
3. License: `MIT`.
4. Space SDK: Select **`Docker`** -> **`Blank`**.
5. Space hardware: **Free (2 vCPU · 16 GB RAM)**.
6. Privacy: **Public**.
7. Connect your GitHub repository:
   - In Settings -> **"Repository Mirroring"**, add `https://github.com/aryan0416/014_3.git`.
   - OR push directly to the Hugging Face Git remote:
     ```bash
     git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/roadsafe-india-360
     git push hf main
     ```
8. The Space will automatically build our [`Dockerfile`](file:///C:/Users/Asus/.gemini/antigravity-ide/scratch/roadsafe-india-360/Dockerfile) and launch live with a permanent public link:
   ```
   https://YOUR_USERNAME-roadsafe-india-360.hf.space
   ```

---

## 🌐 Option 3: Koyeb (Fast Serverless Container)

1. Sign up at [https://app.koyeb.com/](https://app.koyeb.com/).
2. Click **"Create Service"** -> Choose **"GitHub"**.
3. Select repo **`aryan0416/014_3`**.
4. Koyeb detects the `Dockerfile` and deploys automatically to global edge locations with free SSL.

---

## 🔐 Environment Variables for Production

In your host dashboard (Render, Hugging Face, or Koyeb), you can optionally add or customize:

| Key | Default / Recommended Value | Description |
| :--- | :--- | :--- |
| `CARTO_API_KEY` | `cb1_3i9m_1_1864956ea990f7a63a0ee363` | CARTO dark matter basemap tile key |
| `VITE_CARTO_API_KEY` | `cb1_3i9m_1_1864956ea990f7a63a0ee363` | Frontend Vite basemap key |
| `ENVIRONMENT` | `production` | Production runtime flag |
| `PORT` | `8000` (auto-assigned by host) | Cloud port listener |
| `IBM_WATSON_API_KEY` | `mock-watson-api-key-2026` | Watson ML service key |
| `IBM_COS_API_KEY` | `mock-cos-api-key` | Cloud Object Storage key |
