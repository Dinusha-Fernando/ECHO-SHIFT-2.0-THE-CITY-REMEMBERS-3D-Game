"""
ECHO//SHIFT - Main FastAPI Application
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sockets import ws_router, server_tick_loop, match_manager
from config import CORS_ORIGINS, SERVER_HOST, SERVER_PORT, DEBUG
import uuid

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the 25Hz game tick loop on server startup
    tick_task = asyncio.create_task(server_tick_loop())
    yield
    tick_task.cancel()

app = FastAPI(
    title="ECHO//SHIFT Game Backend",
    version="1.0.0",
    description="Authoritative multiplayer and temporal echo service for ECHO//SHIFT",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws_router)

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "online",
        "service": "ECHO//SHIFT Nexus Service",
        "active_matches": len(match_manager.matches),
        "protocol_version": "1.0-alpha"
    }

@app.get("/api/v1/matches")
async def list_matches():
    return {
        "matches": [
            {
                "match_id": m.match_id,
                "map": m.map_name,
                "status": m.status,
                "player_count": len(m.players),
                "echo_count": len(m.active_echoes)
            }
            for m in match_manager.matches.values()
        ]
    }

@app.post("/api/v1/matches/create")
async def create_match():
    match_id = f"sec09_{uuid.uuid4().hex[:6]}"
    match = match_manager.get_or_create_match(match_id)
    return {
        "match_id": match.match_id,
        "map_name": match.map_name,
        "status": match.status
    }

@app.get("/api/v1/echoes/{match_id}")
async def get_echoes(match_id: str):
    match = match_manager.get_or_create_match(match_id)
    return {
        "match_id": match_id,
        "echoes": [e.model_dump() for e in match.active_echoes]
    }

@app.get("/api/v1/profile")
async def get_mock_profile():
    return {
        "operative_callsign": "SHIFTER-77",
        "clearance_level": 14,
        "intel_balance": 1850,
        "shift_credits": 4200,
        "active_role": "Hunter",
        "contracts_completed": 28,
        "extraction_rate": "78.5%"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=SERVER_HOST, port=SERVER_PORT, reload=DEBUG)
