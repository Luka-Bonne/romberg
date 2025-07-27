@echo off
set PYTHONPATH=.
uvicorn backend.main:app --reload
