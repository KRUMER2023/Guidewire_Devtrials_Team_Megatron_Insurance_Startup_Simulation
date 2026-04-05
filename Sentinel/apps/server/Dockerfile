FROM python:3.12-slim

WORKDIR /app

# Install wget required by the Dev Containers extension
RUN apt-get update && apt-get install -y wget curl git && rm -rf /var/lib/apt/lists/*


COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
