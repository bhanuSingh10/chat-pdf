import sys
import json
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")  # Free model

text = sys.argv[1]
embedding = model.encode([text])[0].tolist()

print(json.dumps(embedding))  # Send JSON output to Node.js
