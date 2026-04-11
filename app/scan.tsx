import { toByteArray } from "base64-js";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as jpeg from "jpeg-js";
import {
  AlertOctagon,
  AlertTriangle,
  Brain,
  Camera,
  CheckCircle2,
  ChevronRight,
  Flashlight,
  FlashlightOff,
  Image as ImageIcon,
  Info,
  MapPin,
  Microscope,
  Shield,
  Trees,
  X,
  XCircle,
  Zap,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTensorflowModel } from "react-native-fast-tflite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { initDatabase, insertScan } from "../data/sqlite";

type FlashMode = "off" | "on" | "auto";

type SnakeInfo = {
  common_name: string;
  scientific_name: string;
  venom_type: string;
  warning: string;
  description: string;
  traits: string[];
  habitat: string;
  behavior: string;
  ecological_role: string;
  safety: string[];
};

type ScanResult =
  | {
      status: "not_snake";
      name: string;
      venom_type: string;
      confidence: number;
    }
  | {
      status: "snake";
      key: string;
      name: string;
      venom_type: string;
      confidence: number;
    };

const snakeInfoMap = require("../data/snake.json") as Record<string, SnakeInfo>;
const CLASS_NAMES = Object.keys(snakeInfoMap);
const IMG_SIZE = 224;
const SNAKE_THRESHOLD = 0.6;

export default function Scan() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObjectCoords | null>(null);

  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [torchEnabled, setTorchEnabled] = useState(false);

  const binaryPlugin = useTensorflowModel(
    require("../data/snake_vs_not_snake.tflite"),
  );

  const classifierPlugin = useTensorflowModel(
    require("../data/efficientnet_b0_quantized.tflite"),
  );

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState("");
  const [pulseAnim] = useState(new Animated.Value(1));

  const modelsReady =
    binaryPlugin.state === "loaded" && classifierPlugin.state === "loaded";

  useEffect(() => {
    initDatabase().catch((error) => {
      console.error("Database init error:", error);
    });
  }, []);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (isScanning) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );

      animation.start();

      return () => {
        animation.stop();
      };
    } else {
      pulseAnim.setValue(1);
    }
  }, [isScanning, pulseAnim]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        setLocationPermission(true);

        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
          });
          setCurrentLocation(location.coords);
        } catch (error) {
          console.warn("Could not get initial location:", error);
        }
      } else {
        setLocationPermission(false);
      }
    } catch (error) {
      console.warn("Location permission request failed:", error);
      setLocationPermission(false);
    }
  };

  const getCurrentLocation = async () => {
    if (!locationPermission) return null;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      return location.coords;
    } catch (error) {
      console.warn("Could not get current location:", error);
      return null;
    }
  };

  const toggleFlash = useCallback(() => {
    setFlashMode((prev) => {
      if (prev === "off") {
        setTorchEnabled(true);
        return "on";
      } else if (prev === "on") {
        setTorchEnabled(false);
        return "auto";
      } else {
        setTorchEnabled(false);
        return "off";
      }
    });
  }, []);

  const handleClose = () => {
    if (scanResult) {
      setScanResult(null);
      setShowDetails(false);
      setCurrentImageUri("");
    } else {
      router.back();
    }
  };

  const imageUriToInputTensor = async (uri: string) => {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: IMG_SIZE, height: IMG_SIZE } }],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      },
    );

    if (!manipulated.base64) {
      throw new Error("Failed to convert image.");
    }

    const jpegBytes = toByteArray(manipulated.base64);
    const decoded = jpeg.decode(jpegBytes, { useTArray: true });

    if (!decoded?.data) {
      throw new Error("Failed to decode image.");
    }

    const input = new Float32Array(IMG_SIZE * IMG_SIZE * 3);

    let j = 0;
    for (let i = 0; i < decoded.data.length; i += 4) {
      input[j++] = decoded.data[i];
      input[j++] = decoded.data[i + 1];
      input[j++] = decoded.data[i + 2];
    }

    return input;
  };

  const analyzeImage = async (uri: string) => {
    if (!modelsReady || !binaryPlugin.model || !classifierPlugin.model) {
      console.error("SCAN: models not loaded");
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setShowDetails(false);
    setCurrentImageUri(uri);

    try {
      console.log("SCAN: start");
      console.log("SCAN: uri =", uri);

      const coords = await getCurrentLocation();
      if (coords) {
        setCurrentLocation(coords);
      }

      console.log("SCAN: converting image");
      const inputTensor = await imageUriToInputTensor(uri);
      console.log("SCAN: tensor size =", inputTensor.length);

      console.log("SCAN: running binary model");
      const binaryOutput = await binaryPlugin.model.run([inputTensor]);
      console.log("SCAN: binaryOutput =", binaryOutput);

      const binaryArray = binaryOutput?.[0] as Float32Array | undefined;

      if (!binaryArray || binaryArray.length === 0) {
        throw new Error("Binary model returned empty output");
      }

      const snakeProb = Number(binaryArray[0]);

      if (Number.isNaN(snakeProb)) {
        throw new Error("Binary model returned NaN");
      }

      console.log("SCAN: snakeProb =", snakeProb);

      if (snakeProb <= SNAKE_THRESHOLD) {
        console.log("SCAN: not snake, skipping database save");

        const result: ScanResult = {
          status: "not_snake",
          name: "Not a Snake",
          venom_type: "No Snake Detected",
          confidence: Number(((1 - snakeProb) * 100).toFixed(2)),
        };

        setScanResult(result);
        return;
      }

      console.log("SCAN: running classifier");
      const classifierOutput = await classifierPlugin.model.run([inputTensor]);
      console.log("SCAN: classifierOutput =", classifierOutput);

      const classArray = classifierOutput?.[0] as Float32Array | undefined;

      if (!classArray || classArray.length === 0) {
        throw new Error("Classifier model returned empty output");
      }

      const scores = Array.from(classArray);

      let bestIndex = 0;
      let bestScore = scores[0] ?? 0;

      for (let i = 1; i < scores.length; i++) {
        if ((scores[i] ?? 0) > bestScore) {
          bestScore = scores[i] ?? 0;
          bestIndex = i;
        }
      }

      const classKey = CLASS_NAMES[bestIndex];
      const info = snakeInfoMap[classKey];

      if (!info) {
        throw new Error(`Missing snake info for class: ${classKey}`);
      }

      const result: ScanResult = {
        status: "snake",
        key: classKey,
        name: info.common_name,
        venom_type: info.venom_type,
        confidence: Number((bestScore * 100).toFixed(2)),
      };

      setScanResult(result);

      console.log("SCAN: saving snake to database");
      await insertScan({
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        imageUri: uri,
        status: "snake",
        snakeKey: classKey,
        name: result.name,
        venomType: result.venom_type,
        confidence: result.confidence,
      });
      console.log("SCAN: save done");
    } catch (error) {
      console.error("SCAN ERROR:", error);

      const errorResult: ScanResult = {
        status: "not_snake",
        name: "Scan Failed",
        venom_type: "Unknown",
        confidence: 0,
      };

      setScanResult(errorResult);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || !modelsReady) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (!photo?.uri) return;

      await analyzeImage(photo.uri);
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  const handleUpload = async () => {
    if (!modelsReady) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const getResultConfig = () => {
    if (!scanResult) return null;

    if (scanResult.status === "not_snake") {
      return {
        icon: XCircle,
        color: "#6B7280",
        bgColor: "#374151",
        gradient: ["#374151", "#4B5563"],
        statusText: "Not Detected",
      };
    }

    if (scanResult.venom_type === "Non-venomous Snake") {
      return {
        icon: CheckCircle2,
        color: "#059669",
        bgColor: "#059669",
        gradient: ["#059669", "#10B981"],
        statusText: "Safe",
      };
    }

    return {
      icon: AlertTriangle,
      color: "#DC2626",
      bgColor: "#DC2626",
      gradient: ["#DC2626", "#EF4444"],
      statusText: "Dangerous",
    };
  };

  const renderDetailsModal = () => {
    if (!scanResult || scanResult.status !== "snake") return null;

    const info = snakeInfoMap[scanResult.key];
    if (!info) return null;

    return (
      <Modal
        animationType="slide"
        transparent
        visible={showDetails}
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Species Details</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowDetails(false)}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View
                style={[
                  styles.detailHeader,
                  { borderLeftColor: getResultConfig()?.color },
                ]}
              >
                <Text style={styles.detailScientific}>
                  {info.scientific_name}
                </Text>
                <Text style={styles.detailCommon}>{info.common_name}</Text>

                <View
                  style={[
                    styles.venomBadge,
                    { backgroundColor: getResultConfig()?.bgColor },
                  ]}
                >
                  <AlertOctagon size={14} color="#fff" />
                  <Text style={styles.venomBadgeText}>{info.venom_type}</Text>
                </View>
              </View>

              {info.warning ? (
                <View style={styles.warningBanner}>
                  <AlertTriangle size={20} color="#FCA5A5" />
                  <Text style={styles.warningText}>{info.warning}</Text>
                </View>
              ) : null}

              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <Microscope size={18} color="#34D399" />
                  <Text style={styles.sectionTitle}>Description</Text>
                </View>
                <Text style={styles.sectionText}>{info.description}</Text>
              </View>

              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <Info size={18} color="#34D399" />
                  <Text style={styles.sectionTitle}>Identifying Traits</Text>
                </View>
                {info.traits.map((trait, idx) => (
                  <View key={idx} style={styles.traitItem}>
                    <View style={styles.traitDot} />
                    <Text style={styles.traitText}>{trait}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <Trees size={18} color="#34D399" />
                  <Text style={styles.sectionTitle}>Habitat</Text>
                </View>
                <Text style={styles.sectionText}>{info.habitat}</Text>
              </View>

              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <Brain size={18} color="#34D399" />
                  <Text style={styles.sectionTitle}>Behavior</Text>
                </View>
                <Text style={styles.sectionText}>{info.behavior}</Text>
              </View>

              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <Shield size={18} color="#34D399" />
                  <Text style={styles.sectionTitle}>Safety Guidelines</Text>
                </View>
                {info.safety.map((tip, idx) => (
                  <View key={idx} style={styles.safetyItem}>
                    <Text style={styles.safetyNumber}>{idx + 1}</Text>
                    <Text style={styles.safetyText}>{tip}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.detailSection, styles.lastSection]}>
                <View style={styles.sectionHeader}>
                  <Trees size={18} color="#34D399" />
                  <Text style={styles.sectionTitle}>Ecological Role</Text>
                </View>
                <Text style={styles.sectionText}>{info.ecological_role}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const config = getResultConfig();

  const getFlashConfig = () => {
    if (torchEnabled || flashMode === "on") {
      return {
        icon: Flashlight,
        color: "#FCD34D",
        bgColor: "rgba(252, 211, 77, 0.2)",
        label: "Torch",
      };
    }

    if (flashMode === "auto") {
      return {
        icon: Zap,
        color: "#34D399",
        bgColor: "rgba(52, 211, 153, 0.2)",
        label: "Auto",
      };
    }

    return {
      icon: FlashlightOff,
      color: "#9CA3AF",
      bgColor: "rgba(255, 255, 255, 0.1)",
      label: "Flash",
    };
  };

  const flashConfig = getFlashConfig();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={[styles.content, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
          >
            <X color="#fff" size={24} />
          </TouchableOpacity>

          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              Camera permission is required to scan snakes.
            </Text>

            <TouchableOpacity
              style={styles.permissionBtn}
              onPress={requestPermission}
            >
              <Text style={styles.permissionBtnText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (binaryPlugin.state === "error" || classifierPlugin.state === "error") {
    return (
      <View style={styles.container}>
        <View style={[styles.content, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
          >
            <X color="#fff" size={24} />
          </TouchableOpacity>

          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              Failed to load TFLite models.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        ref={cameraRef}
        flash={flashMode}
        enableTorch={torchEnabled}
        active={true}
      />

      <View style={styles.overlay}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.headerTitle}>Scan Snake</Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
              <MapPin
                color={currentLocation ? "#34D399" : "#9CA3AF"}
                size={20}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <X color="#fff" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {!locationPermission ? (
          <View style={styles.locationWarning}>
            <Text style={styles.locationWarningText}>
              ⚠️ Location permission denied. Enable for geotagging.
            </Text>
          </View>
        ) : null}

        <View style={styles.contentLayer}>
          {!scanResult && !isScanning ? (
            <>
              <View style={styles.placeholderContainer}>
                <View style={styles.iconCircle}>
                  <Camera size={40} color="#34D399" />
                </View>

                <Text style={styles.instructionTitle}>
                  Position the snake in frame
                </Text>

                <Text style={styles.instructionSub}>
                  Make sure the snake is clearly visible and well-lit
                </Text>

                {currentLocation ? (
                  <View style={styles.gpsBadge}>
                    <MapPin size={12} color="#34D399" />
                    <Text style={styles.gpsText}>GPS Active</Text>
                  </View>
                ) : null}

                {!modelsReady ? (
                  <Text style={[styles.instructionSub, { marginTop: 12 }]}>
                    Loading AI models...
                  </Text>
                ) : null}
              </View>

              <View style={styles.scanFrameContainer}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
              </View>
            </>
          ) : null}

          {isScanning ? (
            <View style={styles.placeholderContainer}>
              <Animated.View
                style={[
                  styles.iconCircle,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Zap size={40} color="#34D399" />
              </Animated.View>

              <ActivityIndicator
                size="large"
                color="#34D399"
                style={{ marginTop: 20 }}
              />

              <Text style={styles.instructionTitle}>Analyzing...</Text>
              <Text style={styles.instructionSub}>
                AI is identifying the species
              </Text>

              {currentLocation ? (
                <View style={styles.gpsBadge}>
                  <MapPin size={12} color="#6EE7B7" />
                  <Text style={styles.gpsText}>
                    {currentLocation.latitude.toFixed(4)},{" "}
                    {currentLocation.longitude.toFixed(4)}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {scanResult && config ? (
            <View style={styles.resultCard}>
              <View
                style={[
                  styles.resultIconContainer,
                  { backgroundColor: config.bgColor },
                ]}
              >
                <config.icon size={40} color="#fff" strokeWidth={2} />
              </View>

              <Text style={styles.resultName}>{scanResult.name}</Text>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${config.color}20` },
                ]}
              >
                <View
                  style={[styles.statusDot, { backgroundColor: config.color }]}
                />
                <Text style={[styles.statusText, { color: config.color }]}>
                  {scanResult.status === "not_snake"
                    ? "Not a Snake"
                    : config.statusText}
                </Text>
              </View>

              <View style={styles.confidenceContainer}>
                <View style={styles.confidenceHeader}>
                  <Text style={styles.confidenceLabel}>AI Confidence</Text>
                  <Text
                    style={[styles.confidenceValue, { color: config.color }]}
                  >
                    {scanResult.confidence}%
                  </Text>
                </View>

                <View style={styles.confidenceBarBg}>
                  <View
                    style={[
                      styles.confidenceBarFill,
                      {
                        width: `${scanResult.confidence}%`,
                        backgroundColor: config.color,
                      },
                    ]}
                  />
                </View>
              </View>

              {currentLocation && scanResult.status === "snake" ? (
                <View style={styles.locationTag}>
                  <MapPin size={14} color="#9CA3AF" />
                  <Text style={styles.locationTagText}>
                    {currentLocation.latitude.toFixed(5)},{" "}
                    {currentLocation.longitude.toFixed(5)}
                  </Text>
                </View>
              ) : null}

              <View style={styles.actionButtons}>
                {scanResult.status === "snake" ? (
                  <TouchableOpacity
                    style={[
                      styles.viewDetailsBtn,
                      { backgroundColor: config.color },
                    ]}
                    onPress={() => setShowDetails(true)}
                  >
                    <Info size={18} color="#fff" />
                    <Text style={styles.viewDetailsText}>
                      View Species Details
                    </Text>
                    <ChevronRight size={18} color="#fff" />
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={styles.scanAgainBtn}
                  onPress={() => {
                    setScanResult(null);
                    setShowDetails(false);
                    setCurrentImageUri("");
                  }}
                >
                  <Camera size={18} color="#fff" />
                  <Text style={styles.scanAgainText}>Scan Another</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>

        {!scanResult && !isScanning ? (
          <View
            style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}
          >
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={handleUpload}
              disabled={!modelsReady}
            >
              <View style={styles.controlCircleSmall}>
                <ImageIcon size={22} color="#fff" />
              </View>
              <Text style={styles.controlLabel}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={handleCapture}
              disabled={!modelsReady}
            >
              <View style={styles.captureBtn}>
                <Camera size={28} color="#fff" />
              </View>
              <Text style={[styles.controlLabel, { fontWeight: "bold" }]}>
                Capture
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={toggleFlash}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.controlCircleSmall,
                  { backgroundColor: flashConfig.bgColor },
                ]}
              >
                <flashConfig.icon size={22} color={flashConfig.color} />
              </View>
              <Text style={[styles.controlLabel, { color: flashConfig.color }]}>
                {flashConfig.label}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {renderDetailsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentLayer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  placeholderContainer: {
    alignItems: "center",
    marginBottom: 200,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.3)",
  },
  instructionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  instructionSub: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
  gpsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.3)",
  },
  gpsText: {
    color: "#34D399",
    fontSize: 12,
    fontWeight: "600",
  },
  scanFrameContainer: {
    position: "absolute",
    width: 280,
    height: 280,
    marginBottom: 180,
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#34D399",
    borderTopLeftRadius: 24,
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "#34D399",
    borderTopRightRadius: 24,
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#34D399",
    borderBottomLeftRadius: 24,
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: "#34D399",
    borderBottomRightRadius: 24,
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  controlBtn: {
    alignItems: "center",
  },
  controlCircleSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  controlLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  resultCard: {
    width: "100%",
    backgroundColor: "rgba(17, 24, 39, 0.95)",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  resultIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resultName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  confidenceContainer: {
    width: "100%",
    marginBottom: 16,
  },
  confidenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  confidenceLabel: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "500",
  },
  confidenceValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  confidenceBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  confidenceBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 211, 153, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.2)",
  },
  locationTagText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontFamily: "monospace",
  },
  actionButtons: {
    width: "100%",
    gap: 10,
  },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  viewDetailsText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  scanAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    gap: 8,
  },
  scanAgainText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#111827",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalScroll: {
    padding: 20,
  },
  detailHeader: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  detailScientific: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginBottom: 4,
    fontFamily: "serif",
  },
  detailCommon: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
  },
  venomBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  venomBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220, 38, 38, 0.15)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.3)",
  },
  warningText: {
    color: "#FCA5A5",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    lineHeight: 20,
  },
  detailSection: {
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  sectionText: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 22,
  },
  traitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 10,
  },
  traitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34D399",
    marginTop: 7,
  },
  traitText: {
    fontSize: 14,
    color: "#D1D5DB",
    flex: 1,
    lineHeight: 20,
  },
  safetyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  safetyNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(52, 211, 153, 0.2)",
    color: "#34D399",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 22,
  },
  safetyText: {
    fontSize: 14,
    color: "#D1D5DB",
    flex: 1,
    lineHeight: 20,
    paddingTop: 2,
  },
  locationWarning: {
    backgroundColor: "rgba(220, 38, 38, 0.15)",
    marginHorizontal: 20,
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.3)",
  },
  locationWarningText: {
    color: "#FCA5A5",
    fontSize: 12,
    fontWeight: "500",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
  },
  permissionBtn: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  permissionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
