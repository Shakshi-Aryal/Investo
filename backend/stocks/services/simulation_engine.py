"""
Backward-compatible exports — NEPSE simulation is implemented in nepse_simulation.py.
"""
from .nepse_simulation import (
    SimulationEngine,
    generate_historical_candles,
    clamp_percentage_change,
    compute_nepse_index,
    SECTOR_BOUNDS,
)

__all__ = [
    'SimulationEngine',
    'generate_historical_candles',
    'clamp_percentage_change',
    'compute_nepse_index',
    'SECTOR_BOUNDS',
]
