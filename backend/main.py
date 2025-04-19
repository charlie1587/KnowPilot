from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from backend.routers import content, knowledge, qa

# Create FastAPI instance
app = FastAPI(title="KnowPilot API")

# CORS setup
origins = [
    "http://localhost",
    "http://localhost:5173",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(content.router)
app.include_router(knowledge.router)
app.include_router(qa.router)

# Health check endpoint
@app.get("/")
def read_root():
    return {"status": "healthy", "message": "KnowPilot API is running"}