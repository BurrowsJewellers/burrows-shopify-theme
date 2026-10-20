// Infinity Rings website 3D models (used with the stockist's permission), served from Shopify Files (originalSource URLs; see wedding-builder/README.md).
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
  "url": "https://cdn.shopify.com/3d/models/31c00e2dbd1885a0/wr-ac6.glb",
  "baseWidth": 2.0,
  "widthPerUnit": 10.0,
  "innerRadius": 9.311,
  "baseThickness": 1.051,
  "thicknessPerUnit": 1.5
 },
 "ad7": {
  "url": "https://cdn.shopify.com/3d/models/7863d919afb721fd/wr-ad7.glb",
  "baseWidth": 2.001,
  "widthPerUnit": 11.0,
  "innerRadius": 9.295,
  "baseThickness": 1.005,
  "thicknessPerUnit": 1.499
 },
 "ag2": {
  "url": "https://cdn.shopify.com/3d/models/f1f19c94902ebb4e/wr-ag2.glb",
  "baseWidth": 1.5,
  "widthPerUnit": 9.5,
  "innerRadius": 9.311,
  "baseThickness": 1.052,
  "thicknessPerUnit": 1.301
 },
 "ah2": {
  "url": "https://cdn.shopify.com/3d/models/50e0c8f42ad5a9cf/wr-ah2.glb",
  "baseWidth": 3.0,
  "widthPerUnit": 7.012,
  "innerRadius": 9.311,
  "baseThickness": 1.453,
  "thicknessPerUnit": 1.102
 },
 "ak1": {
  "url": "https://cdn.shopify.com/3d/models/0d5d5b3cabba506a/wr-ak1.glb",
  "baseWidth": 2.0,
  "widthPerUnit": 8.0,
  "innerRadius": 9.311,
  "baseThickness": 1.402,
  "thicknessPerUnit": 0.837
 },
 "as2": {
  "url": "https://cdn.shopify.com/3d/models/d099531bfd502c78/wr-as2.glb",
  "baseWidth": 2.0,
  "widthPerUnit": 7.0,
  "innerRadius": 9.311,
  "baseThickness": 1.352,
  "thicknessPerUnit": 0.901
 },
 "ea": {
  "url": "https://cdn.shopify.com/3d/models/5d1a6a6c0cf01cb3/wr-ea.glb",
  "baseWidth": 2.0,
  "widthPerUnit": 8.0,
  "innerRadius": 9.311,
  "baseThickness": 1.261,
  "thicknessPerUnit": 1.103
 },
 "fb6": {
  "url": "https://cdn.shopify.com/3d/models/429cffc50ccda94f/wr-fb6.glb",
  "baseWidth": 3.051,
  "widthPerUnit": 7.024,
  "innerRadius": 9.311,
  "baseThickness": 1.452,
  "thicknessPerUnit": 1.101
 },
 "in1004": {
  "url": "https://cdn.shopify.com/3d/models/ce431287f67792b3/wr-in1004.glb",
  "baseWidth": 5.049,
  "widthPerUnit": 3.947,
  "innerRadius": 9.259,
  "baseThickness": 1.598,
  "thicknessPerUnit": 0.54
 },
 "in1008": {
  "url": "https://cdn.shopify.com/3d/models/575b371419076cd1/wr-in1008.glb",
  "baseWidth": 2.999,
  "widthPerUnit": 7.011,
  "innerRadius": 9.323,
  "baseThickness": 1.276,
  "thicknessPerUnit": 1.202
 },
 "in1034": {
  "url": "https://cdn.shopify.com/3d/models/1dfd7c64499bd45f/wr-in1034.glb",
  "baseWidth": 3.505,
  "widthPerUnit": 6.509,
  "innerRadius": 9.305,
  "baseThickness": 1.459,
  "thicknessPerUnit": 1.092
 },
 "in1036": {
  "url": "https://cdn.shopify.com/3d/models/0c702902fe9b5b09/wr-in1036.glb",
  "baseWidth": 4.001,
  "widthPerUnit": 6.001,
  "innerRadius": 9.332,
  "baseThickness": 1.319,
  "thicknessPerUnit": 1.2
 },
 "in1038": {
  "url": "https://cdn.shopify.com/3d/models/8359d7824ec4dcbb/wr-in1038.glb",
  "baseWidth": 3.5,
  "widthPerUnit": 6.489,
  "innerRadius": 9.328,
  "baseThickness": 1.328,
  "thicknessPerUnit": 1.197
 },
 "in1045": {
  "url": "https://cdn.shopify.com/3d/models/18ee9b16494cb3c2/wr-in1045.glb",
  "baseWidth": 4.0,
  "widthPerUnit": 5.994,
  "innerRadius": 9.309,
  "baseThickness": 1.346,
  "thicknessPerUnit": 1.194
 },
 "in1046": {
  "url": "https://cdn.shopify.com/3d/models/0db19933e3634084/wr-in1046.glb",
  "baseWidth": 2.999,
  "widthPerUnit": 6.987,
  "innerRadius": 9.323,
  "baseThickness": 1.324,
  "thicknessPerUnit": 1.202
 },
 "in1049": {
  "url": "https://cdn.shopify.com/3d/models/3cd23e9e3f11e7ce/wr-in1049.glb",
  "baseWidth": 4.997,
  "widthPerUnit": 3.018,
  "innerRadius": 9.303,
  "baseThickness": 1.562,
  "thicknessPerUnit": 0.498
 },
 "in1058": {
  "url": "https://cdn.shopify.com/3d/models/4c97d69208ce3393/wr-in1058.glb",
  "baseWidth": 5.0,
  "widthPerUnit": 0.0,
  "innerRadius": 9.244,
  "baseThickness": 1.556,
  "thicknessPerUnit": 0.0
 },
 "in1074": {
  "url": "https://cdn.shopify.com/3d/models/12785a0eed958dc1/wr-in1074.glb",
  "baseWidth": 4.004,
  "widthPerUnit": 6.006,
  "innerRadius": 9.294,
  "baseThickness": 1.341,
  "thicknessPerUnit": 1.136
 },
 "in1076": {
  "url": "https://cdn.shopify.com/3d/models/fa3a5f475a81f738/wr-in1076.glb",
  "baseWidth": 4.004,
  "widthPerUnit": 6.006,
  "innerRadius": 9.322,
  "baseThickness": 1.328,
  "thicknessPerUnit": 1.185
 },
 "in1080": {
  "url": "https://cdn.shopify.com/3d/models/63622fa2ff6905a6/wr-in1080.glb",
  "baseWidth": 4.001,
  "widthPerUnit": 6.002,
  "innerRadius": 9.257,
  "baseThickness": 1.421,
  "thicknessPerUnit": 1.103
 },
 "in1107": {
  "url": "https://cdn.shopify.com/3d/models/1b03d74d26994736/wr-in1107.glb",
  "baseWidth": 4.004,
  "widthPerUnit": 6.006,
  "innerRadius": 9.295,
  "baseThickness": 1.304,
  "thicknessPerUnit": 0.999
 },
 "in1108": {
  "url": "https://cdn.shopify.com/3d/models/06c63d577a0b37c4/wr-in1108.glb",
  "baseWidth": 5.0,
  "widthPerUnit": 5.002,
  "innerRadius": 9.292,
  "baseThickness": 1.571,
  "thicknessPerUnit": 1.016
 },
 "in1243": {
  "url": "https://cdn.shopify.com/3d/models/85f68c25bcf2c7ce/wr-in1243.glb",
  "baseWidth": 5.0,
  "widthPerUnit": 4.975,
  "innerRadius": 9.311,
  "baseThickness": 1.652,
  "thicknessPerUnit": 0.6
 },
 "in1275": {
  "url": "https://cdn.shopify.com/3d/models/0401af0f9bd124fb/wr-in1275.glb",
  "baseWidth": 3.503,
  "widthPerUnit": 5.756,
  "innerRadius": 8.722,
  "baseThickness": 1.19,
  "thicknessPerUnit": 1.13
 },
 "in1277": {
  "url": "https://cdn.shopify.com/3d/models/487ee39daaa425fc/wr-in1277.glb",
  "baseWidth": 4.004,
  "widthPerUnit": 5.967,
  "innerRadius": 9.359,
  "baseThickness": 1.235,
  "thicknessPerUnit": 1.237
 },
 "in1344": {
  "url": "https://cdn.shopify.com/3d/models/e8b3e1f65b9c268d/wr-in1344.glb",
  "baseWidth": 4.004,
  "widthPerUnit": 6.006,
  "innerRadius": 9.369,
  "baseThickness": 1.278,
  "thicknessPerUnit": 0.99
 },
 "in1345": {
  "url": "https://cdn.shopify.com/3d/models/6d85389de448f7cd/wr-in1345.glb",
  "baseWidth": 4.999,
  "widthPerUnit": 4.999,
  "innerRadius": 9.286,
  "baseThickness": 1.316,
  "thicknessPerUnit": 1.202
 },
 "in1379": {
  "url": "https://cdn.shopify.com/3d/models/6c28a2932f02e6ef/wr-in1379.glb",
  "baseWidth": 3.5,
  "widthPerUnit": 6.489,
  "innerRadius": 9.303,
  "baseThickness": 1.345,
  "thicknessPerUnit": 1.197
 },
 "in1381": {
  "url": "https://cdn.shopify.com/3d/models/828a774ca7897272/wr-in1381.glb",
  "baseWidth": 3.5,
  "widthPerUnit": 6.503,
  "innerRadius": 9.309,
  "baseThickness": 1.354,
  "thicknessPerUnit": 0.999
 },
 "in1382": {
  "url": "https://cdn.shopify.com/3d/models/95d631b763cf05c2/wr-in1382.glb",
  "baseWidth": 3.5,
  "widthPerUnit": 6.5,
  "innerRadius": 9.292,
  "baseThickness": 1.47,
  "thicknessPerUnit": 1.101
 },
 "in1388": {
  "url": "https://cdn.shopify.com/3d/models/1c5e280eb705f790/wr-in1388.glb",
  "baseWidth": 3.5,
  "widthPerUnit": 6.474,
  "innerRadius": 9.244,
  "baseThickness": 1.442,
  "thicknessPerUnit": 1.178
 },
 "in1394": {
  "url": "https://cdn.shopify.com/3d/models/93ffd46f05e0c0de/wr-in1394.glb",
  "baseWidth": 4.003,
  "widthPerUnit": 5.998,
  "innerRadius": 9.215,
  "baseThickness": 1.539,
  "thicknessPerUnit": 1.113
 },
 "in1398": {
  "url": "https://cdn.shopify.com/3d/models/14c3781cbca2a1d5/wr-in1398.glb",
  "baseWidth": 3.993,
  "widthPerUnit": 5.989,
  "innerRadius": 9.392,
  "baseThickness": 1.256,
  "thicknessPerUnit": 1.157
 },
 "in1432": {
  "url": "https://cdn.shopify.com/3d/models/fff4cf8c0568977a/wr-in1432.glb",
  "baseWidth": 3.505,
  "widthPerUnit": 6.509,
  "innerRadius": 9.305,
  "baseThickness": 1.459,
  "thicknessPerUnit": 1.092
 },
 "in1610": {
  "url": "https://cdn.shopify.com/3d/models/45eb8efcb3c4a1a4/wr-in1610.glb",
  "baseWidth": 3.0,
  "widthPerUnit": 6.999,
  "innerRadius": 9.332,
  "baseThickness": 1.319,
  "thicknessPerUnit": 1.198
 },
 "in1617": {
  "url": "https://cdn.shopify.com/3d/models/0405f46ed6e9e24e/wr-in1617.glb",
  "baseWidth": 4.0,
  "widthPerUnit": 6.0,
  "innerRadius": 9.302,
  "baseThickness": 1.461,
  "thicknessPerUnit": 1.101
 },
 "in1760": {
  "url": "https://cdn.shopify.com/3d/models/7fb56624a09f3023/wr-in1760.glb",
  "baseWidth": 4.002,
  "widthPerUnit": 6.0,
  "innerRadius": 9.323,
  "baseThickness": 1.327,
  "thicknessPerUnit": 1.182
 },
 "in1765": {
  "url": "https://cdn.shopify.com/3d/models/435852a4d121cb25/wr-in1765.glb",
  "baseWidth": 5.0,
  "widthPerUnit": 5.0,
  "innerRadius": 9.332,
  "baseThickness": 1.319,
  "thicknessPerUnit": 1.199
 },
 "in1849": {
  "url": "https://cdn.shopify.com/3d/models/b4a7b10f00cecda5/wr-in1849.glb",
  "baseWidth": 4.0,
  "widthPerUnit": 6.0,
  "innerRadius": 9.311,
  "baseThickness": 1.852,
  "thicknessPerUnit": 0.5
 },
 "in1886": {
  "url": "https://cdn.shopify.com/3d/models/0ac772af10a33e82/wr-in1886.glb",
  "baseWidth": 5.993,
  "widthPerUnit": 4.005,
  "innerRadius": 9.3,
  "baseThickness": 1.557,
  "thicknessPerUnit": 0.702
 },
 "in1914": {
  "url": "https://cdn.shopify.com/3d/models/8b46a4955eca813f/wr-in1914.glb",
  "baseWidth": 4.0,
  "widthPerUnit": 5.997,
  "innerRadius": 9.303,
  "baseThickness": 1.335,
  "thicknessPerUnit": 1.215
 },
 "in1918": {
  "url": "https://cdn.shopify.com/3d/models/f2190b98bc157a8b/wr-in1918.glb",
  "baseWidth": 5.0,
  "widthPerUnit": 5.023,
  "innerRadius": 9.244,
  "baseThickness": 1.513,
  "thicknessPerUnit": 1.089
 },
 "in6001": {
  "url": "https://cdn.shopify.com/3d/models/a3ebd122392511ba/wr-in6001.glb",
  "baseWidth": 4.001,
  "widthPerUnit": 6.002,
  "innerRadius": 9.331,
  "baseThickness": 1.317,
  "thicknessPerUnit": 1.199
 },
 "in6002": {
  "url": "https://cdn.shopify.com/3d/models/53dd35a12636b189/wr-in6002.glb",
  "baseWidth": 4.001,
  "widthPerUnit": 6.002,
  "innerRadius": 9.331,
  "baseThickness": 1.317,
  "thicknessPerUnit": 1.199
 },
 "in6003": {
  "url": "https://cdn.shopify.com/3d/models/7a182bbe77106375/wr-in6003.glb",
  "baseWidth": 5.002,
  "widthPerUnit": 5.002,
  "innerRadius": 9.285,
  "baseThickness": 1.415,
  "thicknessPerUnit": 1.099
 },
 "in6006": {
  "url": "https://cdn.shopify.com/3d/models/2eda596cb06e1553/wr-in6006.glb",
  "baseWidth": 4.0,
  "widthPerUnit": 6.0,
  "innerRadius": 9.302,
  "baseThickness": 1.461,
  "thicknessPerUnit": 1.101
 },
 "in6007": {
  "url": "https://cdn.shopify.com/3d/models/053924742514e147/wr-in6007.glb",
  "baseWidth": 3.0,
  "widthPerUnit": 7.0,
  "innerRadius": 9.311,
  "baseThickness": 1.752,
  "thicknessPerUnit": 0.801
 },
 "in8018": {
  "url": "https://cdn.shopify.com/3d/models/5e8473f6519f4c64/wr-in8018.glb",
  "baseWidth": 5.0,
  "widthPerUnit": 4.871,
  "innerRadius": 9.294,
  "baseThickness": 1.556,
  "thicknessPerUnit": 0.989
 },
 "in8021": {
  "url": "https://cdn.shopify.com/3d/models/66470ec43b480204/wr-in8021.glb",
  "baseWidth": 4.0,
  "widthPerUnit": 0.0,
  "innerRadius": 9.264,
  "baseThickness": 1.413,
  "thicknessPerUnit": 0.0
 },
 "in6004": {
  "url": "https://cdn.shopify.com/3d/models/c7a502705d0afa8b/wr-in6004.glb",
    stoneUnitsToMm: 1000,
  "baseWidth": 4.0,
  "widthPerUnit": 5.987,
  "innerRadius": 9.311,
  "baseThickness": 1.45,
  "thicknessPerUnit": 0.907
 },
 "in6010": {
  "url": "https://cdn.shopify.com/3d/models/a55ce09e926a1af6/wr-in6010.glb",
    stoneUnitsToMm: 1000,
  "baseWidth": 4.001,
  "widthPerUnit": 5.999,
  "innerRadius": 9.302,
  "baseThickness": 1.541,
  "thicknessPerUnit": 0.985
 },
 "in1915": {
  "url": "https://cdn.shopify.com/3d/models/d4522a5dd53208a8/wr-in1915.glb",
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
  "url": "https://cdn.shopify.com/3d/models/31c00e2dbd1885a0/wr-ac6.glb",
  "baseWidth": 2.0,
  "widthPerUnit": 10.0,
  "innerRadius": 9.311,
  "baseThickness": 1.051,
  "thicknessPerUnit": 1.5
 }
};
