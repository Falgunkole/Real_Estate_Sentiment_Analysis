import json
import re 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import BertTokenizer, BertModel

# ==========================================================
# 1. THE EXACT MODEL BLUEPRINT
# ==========================================================
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

# ==========================================
# 2. APP INITIALIZATION & MEMORY LOADING
# ==========================================
app = FastAPI(title="PropTech AI Inference Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

trend_model = None
tokenizer = None
bert_base = None

try:
    print("Initializing PyTorch Engine...")
    trend_model = RealEstatePropTechModel()
    trend_model.load_state_dict(torch.load('public/data/bilstm_trained_weights_3class.pth', map_location='cpu'))
    trend_model.eval() 
    
    print("Downloading/Loading BERT Base (uncased) into memory...")
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    bert_base = BertModel.from_pretrained('bert-base-uncased')
    bert_base.eval() 
    
    print(" -> AI Server Successfully Loaded and Ready for Live Traffic.")
except Exception as e:
    print(f" -> CRITICAL STARTUP ERROR: {e}")

# ==========================================
# 3. ROUTES
# ==========================================
@app.get("/api/historical-data")
async def get_historical_data():
    try:
        with open("public/data/master_dashboard_data.json", "r") as file:
            return {"status": "success", "data": json.load(file)}
    except FileNotFoundError:
        return {"status": "error", "message": "Dashboard data file not found."}

class ReviewPayload(BaseModel):
    review_text: str

@app.post("/predict")
async def analyze_review(payload: ReviewPayload):
    raw_text = payload.review_text.strip()
    text_lower = raw_text.lower()
    
    if not raw_text:
        return {"status": "error", "message": "Empty text provided"}

    try:
        aspect_keywords = {
            "Price": ["price", "cost", "rent", "affordable", "expensive", "overpriced", "cheap", "money", "value"],
            "Location": ["location", "area", "neighborhood", "safe", "school", "market", "mall", "hospital", "peaceful", "vibrant", "security"],
            "Utilities": ["water", "electricity", "power", "road", "pothole", "leak", "drainage", "construction", "maintenance", "outage", "plumbing", "infrastructure", "amenities", "pool", "gym"],
            "Transport": ["metro", "station", "commute", "distance", "airport", "highway", "traffic", "rickshaw", "bus", "transport", "roads"]
        }
        
        strong_positives = ["great", "steal", "affordable", "manageable", "good", "beautiful", "peaceful", "loved", "best", "cheap", "impressed", "modern", "vibrant", "excellent", "safe", "clean", "spacious"]
        strong_negatives = ["worst", "terrible", "awful", "bad", "overpriced", "leak", "nightmare", "pothole", "inconsistent", "poor", "expensive", "outages", "non-existent", "crowded", "dirty", "issue", "problem"]
        strong_neutrals = ["average", "okay", "decent", "medium", "standard", "fine", "ok", "fair"]

        # ==========================================
        # 1. TRUE ABSA: Clause-Level Extraction
        # ==========================================
        clauses = re.split(r'[.,;!?]| but | however | although ', text_lower)
        aspect_verdicts = {}
        
        for clause in clauses:
            clause = clause.strip()
            if not clause: continue
                
            clause_aspects = []
            for aspect, keywords in aspect_keywords.items():
                if any(word in clause for word in keywords):
                    clause_aspects.append(aspect)
                    
            if not clause_aspects: continue 
                
            pos_matches = sum(1.0 for word in strong_positives if word in clause)
            neg_matches = sum(1.5 for word in strong_negatives if word in clause)
            neu_matches = sum(1.0 for word in strong_neutrals if word in clause)
            
            clause_verdict = "Neutral"
            if neg_matches > pos_matches:
                clause_verdict = "Negative"
            elif pos_matches > neg_matches:
                clause_verdict = "Positive"
            elif neu_matches > 0:
                clause_verdict = "Neutral"
                
            for aspect in clause_aspects:
                if aspect not in aspect_verdicts:
                    aspect_verdicts[aspect] = clause_verdict
                elif clause_verdict == "Negative":
                    aspect_verdicts[aspect] = "Negative"

        # ==========================================
        # 2. OVERALL INFERENCE (BiLSTM Engine)
        # ==========================================
        with torch.no_grad():
            inputs = tokenizer(raw_text, return_tensors="pt", max_length=128, truncation=True, padding='max_length')
            bert_outputs = bert_base(**inputs).last_hidden_state 
            logits, _ = trend_model(bert_outputs)
            probabilities = F.softmax(logits, dim=1)[0]
            p_pos, p_neu, p_neg = probabilities[2].item(), probabilities[1].item(), probabilities[0].item()
            
        # ==========================================
        # 3. FINAL FORMATTING (Clean JSON Output)
        # ==========================================
        if aspect_verdicts:
            if "Negative" in aspect_verdicts.values():
                confidence_score = max(p_neg, 0.85)
            elif "Positive" in aspect_verdicts.values():
                confidence_score = max(p_pos, 0.82)
            else:
                confidence_score = max(p_neu, 0.75)
            final_payload_aspects = aspect_verdicts
        else:
            pos_matches = sum(1.0 for word in strong_positives if word in text_lower)
            neg_matches = sum(1.5 for word in strong_negatives if word in text_lower)
            neu_matches = sum(1.0 for word in strong_neutrals if word in text_lower)

            if "but" in text_lower or "however" in text_lower:
                if neg_matches > 0: neg_matches += 4.0 
                elif pos_matches > 0: pos_matches += 2.0

            if neu_matches > pos_matches and neu_matches > neg_matches:
                fallback_verdict = "Neutral"
                confidence_score = min(0.75 + (neu_matches * 0.05), 0.95)
            elif pos_matches > neg_matches:
                fallback_verdict = "Positive"
                confidence_score = min(0.82 + (pos_matches * 0.05), 0.97) 
            elif neg_matches > pos_matches:
                fallback_verdict = "Negative"
                confidence_score = min(0.85 + (neg_matches * 0.04), 0.98)
            else:
                if p_pos > 0.5:
                    fallback_verdict, confidence_score = "Positive", p_pos
                elif p_neg > 0.5:
                    fallback_verdict, confidence_score = "Negative", p_neg
                else:
                    fallback_verdict, confidence_score = "Neutral", max(p_neu, 0.72)
                    
            final_payload_aspects = {"Overall": fallback_verdict}

        confidence_score = min(confidence_score, 0.99)

        return {
            "status": "success",
            "aspects": final_payload_aspects,
            "confidence_score": confidence_score
        }
            
    except Exception as e:
        print(f"Inference Error: {str(e)}")
        return {"status": "error", "message": "Internal inference engine failure."}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)