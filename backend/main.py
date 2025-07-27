import os
import sys
import uuid
import shutil
import logging
import traceback

from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "core")))

from pose import process_video


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = "uploads"
RESULTS_DIR = "results"
PLOTS_DIR = "plots"
ANALYSIS_DIR = "analysis"
ELIPSIS_DIR = "elipsis"
JSON_RESULTS_DIR = "json_results"

# Создаем директории, если они не существуют
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)
os.makedirs(ANALYSIS_DIR, exist_ok=True)
os.makedirs(ELIPSIS_DIR, exist_ok=True)
os.makedirs(JSON_RESULTS_DIR, exist_ok=True)

# Настройка логгирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/upload_videos")
async def process_videos(
    file1: UploadFile = File(..., description="Первое видео"),
    file2: UploadFile = File(..., description="Второе видео")
):
    # Проверка MIME-типа
    if not file1.content_type.startswith("video/") or not file2.content_type.startswith("video/"):
        raise HTTPException(
            status_code=400,
            detail="Файлы должны быть видео"
        )
    """
    Эндпоинт для загрузки и обработки двух видео файлов
    """
    try:
        # Генерируем уникальные ID для файлов
        video1_id = str(uuid.uuid4())
        video2_id = str(uuid.uuid4())
        
        # Сохраняем оригинальные видеофайлы
        video1_path = os.path.join(UPLOAD_DIR, f"{video1_id}_{file1.filename}")
        video2_path = os.path.join(UPLOAD_DIR, f"{video2_id}_{file2.filename}")
        
        with open(video1_path, "wb") as f:
            shutil.copyfileobj(file1.file, f)
        with open(video2_path, "wb") as f:
            shutil.copyfileobj(file2.file, f)
        
        logger.info(f"Видео сохранены: {video1_path}, {video2_path}")
        
        # Обрабатываем первое видео
        result1 = process_single_video(video1_path, video1_id)
        
        # Обрабатываем второе видео
        result2 = process_single_video(video2_path, video2_id)
        
        return JSONResponse(content={
            "status": "success",
            "json1": f"/results/json/{result1['json_result']}",
            "json2": f"/results/json/{result2['json_result']}",
            "video1_id": video1_id,
            "video2_id": video2_id
        })
        
    except Exception as e:
        logger.error(f"Ошибка при обработке видео: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при обработке видео: {str(e)}"
        )

def process_single_video(video_path: str, video_id: str) -> dict:
    """
    Обрабатывает одно видео и возвращает информацию о результатах
    """

    # Генерируем пути для результатов
    plot_filename = f"{video_id}_plot.png"
    elipsis_filename = f"{video_id}_elipsis.png"
    analysis_filename = f"{video_id}_analysis.txt"
    json_filename = f"{video_id}_result.json"
    
    plot_path = os.path.join(PLOTS_DIR, plot_filename)
    elipsis_path = os.path.join(ELIPSIS_DIR, elipsis_filename)
    analysis_path = os.path.join(ANALYSIS_DIR, analysis_filename)
    json_path = os.path.join(JSON_RESULTS_DIR, json_filename)
    
    # Обрабатываем видео
    process_video(
        video_path=video_path,
        plot_path=plot_path,
        elipsis_path=elipsis_path,
        analyze_path=analysis_path,
        save_path=json_path
    )
    
    # Возвращаем информацию о файлах результатов
    return {
        "plot": plot_filename,
        "elipsis": elipsis_filename,
        "analysis": analysis_filename,
        "json_result": json_filename
    }

@app.get("/results/{result_type}/{filename}")
async def get_result_file(result_type: str, filename: str):
    """
    Эндпоинт для получения файлов результатов
    Поддерживаемые типы: plot, elipsis, analysis, json
    """
    try:
        # Определяем директорию по типу результата
        dir_map = {
            "plot": PLOTS_DIR,
            "elipsis": ELIPSIS_DIR,
            "analysis": ANALYSIS_DIR,
            "json": JSON_RESULTS_DIR
        }
        
        media_types = {
            "plot": "image/png",
            "elipsis": "image/png",
            "analysis": "text/plain",
            "json": "application/json"
        }
        
        if result_type not in dir_map:
            raise HTTPException(status_code=400, detail="Invalid result type")
        
        dir_path = dir_map[result_type]
        file_path = os.path.join(dir_path, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
            
        return FileResponse(
            file_path, 
            media_type=media_types.get(result_type, "application/octet-stream"),
            filename=filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении файла: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении файла: {str(e)}"
        )

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Video processing API is running"}

@app.get("/list-results")
async def list_available_results():
    """
    Эндпоинт для получения списка доступных результатов
    """
    try:
        results = {
            "plots": os.listdir(PLOTS_DIR),
            "elipsis": os.listdir(ELIPSIS_DIR),
            "analysis": os.listdir(ANALYSIS_DIR),
            "json_results": os.listdir(JSON_RESULTS_DIR)
        }
        return JSONResponse(content={"status": "success", "data": results})
    except Exception as e:
        logger.error(f"Ошибка при получении списка результатов: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении списка результатов: {str(e)}"
        )
