#!/bin/bash
export PERF_TRIALS=5
export PERF_MAX_M=8
node run.js > build/master-latest.json
