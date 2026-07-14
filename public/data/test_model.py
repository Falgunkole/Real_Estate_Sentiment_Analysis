import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import BertTokenizer, BertModel

# (Paste your RealEstatePropTechModel class here from ai_server.py)
# Ensure it matches the architecture you used to save the weights.

# --- 20 DIVERSE TEST SAMPLES ---
test_reviews = [
    "The apartment is overpriced for such a small size.", # Price: Negative
    "Great location, walking distance to the metro.",     # Location: Positive
    "Water supply is inconsistent and the building is old.", # Infrastructure: Negative
    "The landlord is responsive and friendly.",           # Service: Positive
    "Average facilities, nothing special for the price.", # Neutral
    "Noise levels are high due to construction nearby.",  # Infrastructure: Negative
    "Excellent amenities, loved the pool and gym.",      # Amenities: Positive
    "The parking situation is a nightmare here.",         # Infrastructure: Negative
    "Good value for money in a safe neighborhood.",      # Price/Location: Positive
    "Electricity bills are way too high every summer.",   # Price: Negative
    "The area is clean and very close to the school.",    # Location: Positive
    "Management ignores all maintenance requests.",      # Service: Negative
    "Decent apartment, but the commute is too long.",     # Neutral/Negative
    "Beautiful view from the balcony, very peaceful.",   # Lifestyle: Positive
    "Security is excellent, feel safe at night.",         # Safety: Positive
    "The roads are crowded and full of potholes.",       # Infrastructure: Negative
    "Very responsive society committee, helpful.",       # Service: Positive
    "The rent is cheap but no water for 5 hours a day.", # Price/Infra: Negative
    "Modern architecture and great lighting in rooms.",   # Infrastructure: Positive
    "Terrible experience, would not recommend this."     # Overall: Negative
]

def run_validation():
    # Load Model
    model = RealEstatePropTechModel()
    model.load_state_dict(torch.load('public/data/bilstm_trained_weights_3class.pth', map_location='cpu'))
    model.eval()
    
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    bert_base = BertModel.from_pretrained('bert-base-uncased')
    bert_base.eval()

    class_labels = ["Positive", "Neutral", "Negative"]

    print(f"{'REVIEW':<50} | {'PREDICTION'}")
    print("-" * 65)

    with torch.no_grad():
        for text in test_reviews:
            inputs = tokenizer(text, return_tensors="pt", max_length=128, truncation=True, padding='max_length')
            embeddings = bert_base(**inputs).last_hidden_state
            logits, _ = model(embeddings)
            
            # Apply your logic (e.g., argmax or threshold calibration)
            pred_idx = torch.argmax(F.softmax(logits, dim=1), dim=1).item()
            print(f"{text[:50]:<50} | {class_labels[pred_idx]}")

run_validation()