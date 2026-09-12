# Multi-stage / optimized container for RoadSafe India 360
FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt .

# Install PyTorch CPU-only first to keep image lightweight and fast
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code, data, and pre-compiled React frontend
COPY backend/ ./backend/
COPY data/ ./data/
COPY frontend/ ./frontend/
COPY run.py .
COPY Procfile .
COPY .env.example .env

EXPOSE 8000

# Start production server
CMD ["python", "run.py"]
