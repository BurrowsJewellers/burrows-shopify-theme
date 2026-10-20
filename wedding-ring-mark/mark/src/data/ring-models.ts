// Infinity Rings website 3D models (used with the stockist's permission).
// Calibration measured from each GLB: widths/thickness in mm, morph weight 0..1.
export type RingModel = {
  url: string;
  baseWidth: number;
  widthPerUnit: number;
  innerRadius: number;
  baseThickness: number;
  thicknessPerUnit: number;
  stoneUnitsToMm?: number;
};
/** Classic styles the supplier prices with a separate "-Flat" SKU (FB has no Flat listing). */
export const FLAT_STYLES = new Set(["ab2", "ac6", "ad7", "ag2", "ah2", "ak1", "as2", "ea"]);
export const RING_MODELS: Record<string, RingModel> = {
 "ac6": {
  "url": "/models/c13f6670-ac6.glb",
  "baseWidth": 2.0,
  "widthPerUnit": 10.0,
  "innerRadius": 9.311,
  "baseThickness": 1.051,
  "thicknessPerUnit": 1.5
 },
 "ad7": {
  "url": "/models/4b71a8c6-ad7.glb",
  "baseWidth": 2.001,
  "widthPerUnit": 11.0,
  "innerRadius": 9.295,
  "baseThickness": 1.005,
  "thicknessPerUnit": 1.499
 },
 "ag2": {
  "url": "/models/0d69a8c0-ag2.glb",
  "baseWidth": 1.5,
  "widthPerUnit": 9.5,
  "innerRadius": 9.311,
  "baseThickness": 1.052,
  "thicknessPerUnit": 1.301
 },
 "ah2": {
  "url": "/models/3b787ea9-ah2.glb",
  "baseWidth": 3.0,
  "widthPerUnit": 7.012,
  "innerRadius": 9.311,
  "baseThickness": 1.453,
  "thicknessPerUnit": 1.102
 },
 "ak1": {
  "url": "/models/5943e6f0-ak1.glb",
  "baseWidth": 2.0,
  "widthPerUnit": 8.0,
  "innerRadius": 9.311,
  "baseThickness": 1.402,
  "thicknessPerUnit": 0.837
 },
 "as2": {
  "url": "/models/2bf5664a-as2.glb",
  "baseWidth": 2.0,
  "widthPerUnit": 7.0,
  "innerRadius": 9.311,
  "baseThickness": 1.352,
  "thicknessPerUnit": 0.901
 },
 "ea": {
  "url": "/models/5bd296ba-ea.glb",
  "baseWidth": 2.0,
  "widthPerUnit": 8.0,
  "innerRadius": 9.311,
  "baseThickness": 1.261,
  "thicknessPerUnit": 1.103
 },
 "fb6": {
  "url": "/models/8cb68e7b-fb6.glb",
  "baseWidth": 3.051,
  "widthPerUnit": 7.024,
  "innerRadius": 9.311,
  "baseThickness": 1.452,
  "thicknessPerUnit": 1.101
 },
 "in1004": {
  "url": "/models/89558e8b-in1004.glb",
  "baseWidth": 5.049,
  "widthPerUnit": 3.947,
  "innerRadius": 9.259,
  "baseThickness": 1.598,
  "thicknessPerUnit": 0.54
 },
 "in1008": {
  "url": "/models/f48524dd-in1008.glb",
  "baseWidth": 2.999,
  "widthPerUnit": 7.011,
  "innerRadius": 9.323,
  "baseThickness": 1.276,
  "thicknessPerUnit": 1.202
 },
 "in1034": {
  "url": "/models/de3bf0e7-in1034.glb",
  "baseWidth": 3.505,
  "widthPerUnit": 6.509,
  "innerRadius": 9.305,
  "baseThickness": 1.459,
  "thicknessPerUnit": 1.092
 },
 "in1036": {
  "url": "/models/541a4966-in1036.glb",
  "baseWidth": 4.001,
  "widthPerUnit": 6.001,
  "innerRadius": 9.332,
  "baseThickness": 1.319,
  "thicknessPerUnit": 1.2
 },
 "in1038": {
  "url": "/models/311ba465-in1038.glb",
  "baseWidth": 3.5,
  "widthPerUnit": 6.489,
  "innerRadius": 9.328,
  "baseThickness": 1.328,
  "thicknessPerUnit": 1.197
 },
 "in1045": {
  "url": "/models/a1696481-in1045.glb",
  "baseWidth": 4.0,
  "widthPerUnit": 5.994,
  "innerRadius": 9.309,
  "baseThickness": 1.346,
  "thicknessPerUnit": 1.194
 },
 "in1046": {
  "url": "/models/3fc89900-in1046.glb",
  "baseWidth": 2.999,
  "widthPerUnit": 6.987,
  "innerRadius": 9.323,
  "baseThickness": 1.324,
  "thicknessPerUnit": 1.202
 },
 "in1049": {
  "url": "/models/64875f1a-in1049.glb",
  "baseWidth": 4.997,
  "widthPerUnit": 3.018,
  "innerRadius": 9.303,
  "baseThickness": 1.562,
  "thicknessPerUnit": 0.498
 },
 "in1058": {
  "url": "/models/855cde14-in1058.glb",
  "baseWidth": 5.0,
  "widthPerUnit": 0.0,
  "innerRadius": 9.244,
  "baseThickness": 1.556,
  "thicknessPerUnit": 0.0
 },
 "in1074": {
  "url": "/models/367f1891-in1074.glb",
  "baseWidth": 4.004,
  "widthPerUnit": 6.006,
  "innerRadius": 9.294,
  "baseThickness": 1.341,
  "thicknessPerUnit": 1.136
 },
 "in1076": {
  "url": "/models/c6a3a273-in1076.glb",
  "baseWidth": 4.004,
  "widthPerUnit": 6.006,
  "innerRadius": 9.322,
  "baseThickness": 1.328,
  "thicknessPerUnit": 1.185
 },
 "in1080": {
  "url": "/models/31f74541-in1080.glb",
  "baseWidth": 4.001,
  "widthPerUnit": 6.002,
  "innerRadius": 9.257,
  "baseThickness": 1.421,
  "thicknessPerUnit": 1.103
 },
 "in1107": {
  "url": "/models/a732cea4-in1107.glb",
  "baseWidth": 4.004,
  "widthPerUnit": 6.006,
  "innerRadius": 9.295,
  "baseThickness": 1.304,
  "thicknessPerUnit": 0.999
 },
 "in1108": {
  "url": "/models/edbbaf5f-in1108.glb",
  "baseWidth": 5.0,
  "widthPerUnit": 5.002,
  "innerRadius": 9.292,
  "baseThickness": 1.571,
  "thicknessPerUnit": 1.016
 },
 "in1243": {
  "url": "/models/8474b7b8-in1243.glb",
  "baseWidth": 5.0,
  "widthPerUnit": 4.975,
  "innerRadius": 9.311,
  "baseThickness": 1.652,
  "thicknessPerUnit": 0.6
 },
 "in1275": {
  "url": "/models/a14a24f0-in1275.glb",
  "baseWidth": 3.503,
  "widthPerUnit": 5.756,
  "innerRadius": 8.722,
  "baseThickness": 1.19,
  "thicknessPerUnit": 1.13
 },
 "in1277": {
  "url": "/models/0d9981d8-in1277.glb",
  "baseWidth": 4.004,
  "widthPerUnit": 5.967,
  "innerRadius": 9.359,
  "baseThickness": 1.235,
  "thicknessPerUnit": 1.237
 },
 "in1344": {
  "url": "/models/bf440c21-in1344.glb",
  "baseWidth": 4.004,
  "widthPerUnit": 6.006,
  "innerRadius": 9.369,
  "baseThickness": 1.278,
  "thicknessPerUnit": 0.99
 },
 "in1345": {
  "url": "/models/0120de3f-in1345.glb",
  "baseWidth": 4.999,
  "widthPerUnit": 4.999,
  "innerRadius": 9.286,
  "baseThickness": 1.316,
  "thicknessPerUnit": 1.202
 },
 "in1379": {
  "url": "/models/3ea3ce62-in1379.glb",
  "baseWidth": 3.5,
  "widthPerUnit": 6.489,
  "innerRadius": 9.303,
  "baseThickness": 1.345,
  "thicknessPerUnit": 1.197
 },
 "in1381": {
  "url": "/models/cc947116-in1381.glb",
  "baseWidth": 3.5,
  "widthPerUnit": 6.503,
  "innerRadius": 9.309,
  "baseThickness": 1.354,
  "thicknessPerUnit": 0.999
 },
 "in1382": {
  "url": "/models/79de4bbc-in1382.glb",
  "baseWidth": 3.5,
  "widthPerUnit": 6.5,
  "innerRadius": 9.292,
  "baseThickness": 1.47,
  "thicknessPerUnit": 1.101
 },
 "in1388": {
  "url": "/models/b36fd293-in1388.glb",
  "baseWidth": 3.5,
  "widthPerUnit": 6.474,
  "innerRadius": 9.244,
  "baseThickness": 1.442,
  "thicknessPerUnit": 1.178
 },
 "in1394": {
  "url": "/models/cb65cfe6-in1394.glb",
  "baseWidth": 4.003,
  "widthPerUnit": 5.998,
  "innerRadius": 9.215,
  "baseThickness": 1.539,
  "thicknessPerUnit": 1.113
 },
 "in1398": {
  "url": "/models/9c37042c-in1398.glb",
  "baseWidth": 3.993,
  "widthPerUnit": 5.989,
  "innerRadius": 9.392,
  "baseThickness": 1.256,
  "thicknessPerUnit": 1.157
 },
 "in1432": {
  "url": "/models/633eee91-in1432.glb",
  "baseWidth": 3.505,
  "widthPerUnit": 6.509,
  "innerRadius": 9.305,
  "baseThickness": 1.459,
  "thicknessPerUnit": 1.092
 },
 "in1610": {
  "url": "/models/88c2dd07-in1610.glb",
  "baseWidth": 3.0,
  "widthPerUnit": 6.999,
  "innerRadius": 9.332,
  "baseThickness": 1.319,
  "thicknessPerUnit": 1.198
 },
 "in1617": {
  "url": "/models/d3724e62-in1617.glb",
  "baseWidth": 4.0,
  "widthPerUnit": 6.0,
  "innerRadius": 9.302,
  "baseThickness": 1.461,
  "thicknessPerUnit": 1.101
 },
 "in1760": {
  "url": "/models/63762154-in1760.glb",
  "baseWidth": 4.002,
  "widthPerUnit": 6.0,
  "innerRadius": 9.323,
  "baseThickness": 1.327,
  "thicknessPerUnit": 1.182
 },
 "in1765": {
  "url": "/models/695a9af0-in1765.glb",
  "baseWidth": 5.0,
  "widthPerUnit": 5.0,
  "innerRadius": 9.332,
  "baseThickness": 1.319,
  "thicknessPerUnit": 1.199
 },
 "in1849": {
  "url": "/models/5053ee3a-in1849.glb",
  "baseWidth": 4.0,
  "widthPerUnit": 6.0,
  "innerRadius": 9.311,
  "baseThickness": 1.852,
  "thicknessPerUnit": 0.5
 },
 "in1886": {
  "url": "/models/ee958266-in1886.glb",
  "baseWidth": 5.993,
  "widthPerUnit": 4.005,
  "innerRadius": 9.3,
  "baseThickness": 1.557,
  "thicknessPerUnit": 0.702
 },
 "in1914": {
  "url": "/models/c2c75794-in1914.glb",
  "baseWidth": 4.0,
  "widthPerUnit": 5.997,
  "innerRadius": 9.303,
  "baseThickness": 1.335,
  "thicknessPerUnit": 1.215
 },
 "in1918": {
  "url": "/models/cef1157c-in1918.glb",
  "baseWidth": 5.0,
  "widthPerUnit": 5.023,
  "innerRadius": 9.244,
  "baseThickness": 1.513,
  "thicknessPerUnit": 1.089
 },
 "in6001": {
  "url": "/models/b9530acc-in6001.glb",
  "baseWidth": 4.001,
  "widthPerUnit": 6.002,
  "innerRadius": 9.331,
  "baseThickness": 1.317,
  "thicknessPerUnit": 1.199
 },
 "in6002": {
  "url": "/models/f5fee060-in6002.glb",
  "baseWidth": 4.001,
  "widthPerUnit": 6.002,
  "innerRadius": 9.331,
  "baseThickness": 1.317,
  "thicknessPerUnit": 1.199
 },
 "in6003": {
  "url": "/models/736b27ef-in6003.glb",
  "baseWidth": 5.002,
  "widthPerUnit": 5.002,
  "innerRadius": 9.285,
  "baseThickness": 1.415,
  "thicknessPerUnit": 1.099
 },
 "in6006": {
  "url": "/models/504ab784-in6006.glb",
  "baseWidth": 4.0,
  "widthPerUnit": 6.0,
  "innerRadius": 9.302,
  "baseThickness": 1.461,
  "thicknessPerUnit": 1.101
 },
 "in6007": {
  "url": "/models/20a73a97-in6007.glb",
  "baseWidth": 3.0,
  "widthPerUnit": 7.0,
  "innerRadius": 9.311,
  "baseThickness": 1.752,
  "thicknessPerUnit": 0.801
 },
 "in8018": {
  "url": "/models/3ba97450-in8018.glb",
  "baseWidth": 5.0,
  "widthPerUnit": 4.871,
  "innerRadius": 9.294,
  "baseThickness": 1.556,
  "thicknessPerUnit": 0.989
 },
 "in8021": {
  "url": "/models/8efab6c7-in8021.glb",
  "baseWidth": 4.0,
  "widthPerUnit": 0.0,
  "innerRadius": 9.264,
  "baseThickness": 1.413,
  "thicknessPerUnit": 0.0
 },
 "in6004": {
  "url": "/models/dc29e7fd-in6004.glb",
    stoneUnitsToMm: 1000,
  "baseWidth": 4.0,
  "widthPerUnit": 5.987,
  "innerRadius": 9.311,
  "baseThickness": 1.45,
  "thicknessPerUnit": 0.907
 },
 "in6010": {
  "url": "/models/b79b686c-in6010.glb",
    stoneUnitsToMm: 1000,
  "baseWidth": 4.001,
  "widthPerUnit": 5.999,
  "innerRadius": 9.302,
  "baseThickness": 1.541,
  "thicknessPerUnit": 0.985
 },
 "in1915": {
  "url": "/models/85f0bb50-in1915.glb",
    stoneUnitsToMm: 1000,
  "baseWidth": 5.0,
  "widthPerUnit": 3.493,
  "innerRadius": 9.292,
  "baseThickness": 1.571,
  "thicknessPerUnit": 0.701
 },
 // AB-2's own GLB is corrupt at the source (no shape data). AB-2 and AC are both
 // plain court bands, so AB-2 reuses AC's real geometry; at morph 0 it is 2mm.
 "ab2": {
  "url": "/models/c13f6670-ac6.glb",
  "baseWidth": 2.0,
  "widthPerUnit": 10.0,
  "innerRadius": 9.311,
  "baseThickness": 1.051,
  "thicknessPerUnit": 1.5
 }
};
