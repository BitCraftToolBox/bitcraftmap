#!/bin/bash

curl -o region1.json http://localhost:4001/paved
curl -o region2.json http://localhost:4002/paved
curl -o region3.json http://localhost:4003/paved
curl -o region4.json http://localhost:4004/paved
curl -o region5.json http://localhost:4005/paved
curl -o region6.json http://localhost:4006/paved
curl -o region7.json http://localhost:4007/paved
curl -o region8.json http://localhost:4008/paved
curl -o region9.json http://localhost:4009/paved

python ./scripts/generate_roads.py --mode fixed region1.json roads_r1_small.geojson
python ./scripts/generate_roads.py --mode fixed region2.json roads_r2_small.geojson
python ./scripts/generate_roads.py --mode fixed region3.json roads_r3_small.geojson
python ./scripts/generate_roads.py --mode fixed region4.json roads_r4_small.geojson
python ./scripts/generate_roads.py --mode fixed region5.json roads_r5_small.geojson
python ./scripts/generate_roads.py --mode fixed region6.json roads_r6_small.geojson
python ./scripts/generate_roads.py --mode fixed region7.json roads_r7_small.geojson
python ./scripts/generate_roads.py --mode fixed region8.json roads_r8_small.geojson
python ./scripts/generate_roads.py --mode fixed region9.json roads_r9_small.geojson