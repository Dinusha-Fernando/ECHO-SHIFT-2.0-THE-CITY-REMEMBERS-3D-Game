import uvicorn
from config import SERVER_HOST, SERVER_PORT, DEBUG

if __name__ == "__main__":
    uvicorn.run("main:app", host=SERVER_HOST, port=SERVER_PORT, reload=DEBUG)

