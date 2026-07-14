import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import BertTokenizer, BertModel

# 1. THE CLASS DEFINITION (The "Blueprint")
class RealEstatePropTechModel(nn.Module):
    def __init__(self, input_size=768, hidden_size=256, num_classes=3):
        super(RealEstatePropTechModel, self).__init__()
        self.bilstm = nn.LSTM(input_size, hidden_size, bidirectional=True, batch_first=True)
        self.attention = nn.ModuleDict({
            'W': nn.Linear(hidden_size * 2, hidden_size * 2),
            'v': nn.Linear(hidden_size * 2, 1, bias=False) 
        })
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size * 2, 256),
            nn.ReLU(),
            nn.Dropout(0.2), 
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.2), 
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        lstm_out, _ = self.bilstm(x)
        u = torch.tanh(self.attention['W'](lstm_out))
        attn_weights = F.softmax(self.attention['v'](u), dim=1)
        context_vector = torch.sum(attn_weights * lstm_out, dim=1)
        logits = self.classifier(context_vector)
        return logits, attn_weights

# 2. TEST SAMPLES
test_reviews = [
    "The apartment is overpriced for such a small size.", 
    "Great location, walking distance to the metro.",     
    "Water supply is inconsistent and the building is old.", 
    "The landlord is responsive and friendly.",           
    "Average facilities, nothing special for the price.", 
    "Noise levels are high due to construction nearby.",  
    "Excellent amenities, loved the pool and gym.",      
    "The parking situation is a nightmare here.",         
    "Good value for money in a safe neighborhood.",      
    "Electricity bills are way too high every summer.",   
    "The area is clean and very close to the school.",    
    "Management ignores all maintenance requests.",      
    "Decent apartment, but the commute is too long.",     
    "Beautiful view from the balcony, very peaceful.",   
    "Security is excellent, feel safe at night.",         
    "The roads are crowded and full of potholes.",       
    "Very responsive society committee, helpful.",       
    "The rent is cheap but no water for 5 hours a day.", 
    "Modern architecture and great lighting in rooms.",   
    "Terrible experience, would not recommend this."     
]

# 3. VALIDATION ENGINE
def run_validation():
    print("Loading Model...")
    model = RealEstatePropTechModel()
    # Ensure this path matches where your weights are actually saved
    model.load_state_dict(torch.load('public/data/bilstm_trained_weights_3class.pth', map_location='cpu'))
    model.eval()
    
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    bert_base = BertModel.from_pretrained('bert-base-uncased')
    bert_base.eval()

    class_labels = ["Positive", "Neutral", "Negative"]

    print(f"\n{'REVIEW':<50} | {'PREDICTION'}")
    print("-" * 65)

    with torch.no_grad():
        for text in test_reviews:
            inputs = tokenizer(text, return_tensors="pt", max_length=128, truncation=True, padding='max_length')
            embeddings = bert_base(**inputs).last_hidden_state
            logits, _ = model(embeddings)
            pred_idx = torch.argmax(F.softmax(logits, dim=1), dim=1).item()
            print(f"{text[:50]:<50} | {class_labels[pred_idx]}")

if __name__ == "__main__":
    run_validation()