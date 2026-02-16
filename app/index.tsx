import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Camera, Clock, MapPin, Shield } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Color constants
const Colors = {
  emerald600: "#059669",
  teal600: "#0d9488",
  emerald100: "#d1fae5",
  white: "#ffffff",
};

export default function Index() {
  const insets = useSafeAreaInsets();

  const onGetStarted = () => {
    console.log("Get Started Pressed");
  };

  return (
    <LinearGradient
      colors={[Colors.emerald600, Colors.teal600]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 30, // Reduced top padding
            paddingBottom: insets.bottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Logo Container */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.emoji}>🐍</Text>
            </View>
          </View>

          <Text style={styles.title}>SnakeScan.Ph</Text>
          <Text style={styles.subtitle}>
            Identify Philippine snakes instantly and learn if there venomous
          </Text>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <FeatureCard
              IconComponent={Camera}
              title="Quick Scan"
              description="Instant snake identification"
            />
            <FeatureCard
              IconComponent={Shield}
              title="Safety First"
              description="Get Philippine-specific safety tips"
            />
            <FeatureCard
              IconComponent={Clock}
              title="Scan History"
              description="Review past identifications"
            />
            <FeatureCard
              IconComponent={MapPin}
              title="Geotagging"
              description="Track snake sighting locations"
            />
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.button}
            onPress={onGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <ArrowRight size={24} color={Colors.emerald600} />
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Discover Philippine snake species safely
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// Helper component for the feature cards
function FeatureCard({
  IconComponent,
  title,
  description,
}: {
  IconComponent: React.ComponentType<any>;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <IconComponent size={22} color={Colors.white} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 10, // Reduced bottom padding
  },
  logoContainer: {
    marginBottom: 16, // Reduced margin
  },
  logoCircle: {
    width: 100, // Reduced size from 100
    height: 100,
    backgroundColor: Colors.white,
    borderRadius: 24, // Adjusted radius
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  emoji: {
    fontSize: 40, // Adjusted font size
  },
  title: {
    fontSize: 28, // Reduced size slightly
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15, // Slightly smaller
    color: Colors.emerald100,
    textAlign: "center",
    maxWidth: 300,
    marginBottom: 20, // Reduced margin
    lineHeight: 22,
  },
  featuresContainer: {
    width: "100%",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20, // Reduced padding
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10, // Reduced margin
  },
  iconBox: {
    width: 40, // Reduced size
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: Colors.emerald100,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  button: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 14, // Slightly reduced
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.emerald600,
    marginRight: 8,
  },
  footerText: {
    textAlign: "center",
    color: Colors.emerald100,
    marginTop: 12,
    fontSize: 13,
  },
});
