import { colors } from "@/styles/global";
import { isToday } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type DashboardGreetingProps = {
  displayName: string;
  selectedDate: string;
  goToToday: () => void;
};

export default function DashboardGreeting({
  displayName,
  selectedDate,
  goToToday,
}: DashboardGreetingProps) {
  const now = new Date();
  const selected = new Date(selectedDate);

  const isCurrentDateToday = isToday(selectedDate);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const selectedStart = new Date(
    selected.getFullYear(),
    selected.getMonth(),
    selected.getDate(),
  );

  const diffDays = Math.round(
    (selectedStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  const isFutureDate = diffDays > 0;

  const getTodayContent = () => {
    const hour = now.getHours();

    // 12 AM – 3:59 AM
    if (hour < 4) {
      const messages = [
        {
          title: "Still awake?",
          subtitle: "Tomorrow's workout is judging you.",
        },
        {
          title: "Okay... why are you awake?",
          subtitle: "This is either dedication or a scheduling problem.",
        },
      ];

      return messages[Math.floor(Math.random() * messages.length)];
    }

    // 4 AM – 6:59 AM
    if (hour < 7) {
      const messages = [
        {
          title: "Already awake?",
          subtitle: "That's suspiciously productive.",
        },
        {
          title: "You're up early.",
          subtitle: "Someone's beating the alarm today.",
        },
      ];

      return messages[Math.floor(Math.random() * messages.length)];
    }

    // 7 AM – 11:59 AM
    if (hour < 12) {
      return {
        title: `Morning, ${displayName}.`,
        subtitle: "The day has officially started asking things of you.",
      };
    }

    // 12 PM – 1:59 PM
    if (hour < 14) {
      return {
        title: "It's afternoon already.",
        subtitle: "That escalated quickly.",
      };
    }

    // 2 PM – 4:59 PM
    if (hour < 17) {
      const messages = [
        {
          title: "Afternoon slump?",
          subtitle: "Or just a personality trait?",
        },
        {
          title: "Halfway through the day.",
          subtitle: "How are we doing?",
        },
      ];

      return messages[Math.floor(Math.random() * messages.length)];
    }

    // 5 PM – 7:59 PM
    if (hour < 20) {
      return {
        title: "Evening check-in.",
        subtitle: "Let's see what you actually got done.",
      };
    }

    // 8 PM – 11:59 PM
    return {
      title: "The day's nearly over.",
      subtitle: "Anything left on the list?",
    };
  };

  const formatSelectedDate = () => {
    return selected.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getFutureContent = () => {
    if (diffDays <= 7) {
      return {
        title: "Planning ahead?",
        subtitle: "Future-you seems optimistic.",
      };
    }

    if (diffDays <= 28) {
      return {
        title: "Okay, you're really planning ahead.",
        subtitle: "Respect.",
      };
    }

    return {
      title: "You've gone too far.",
      subtitle: "There's nothing to see here yet.",
    };
  };

  const getPastContent = () => {
    const daysAgo = Math.abs(diffDays);

    if (daysAgo === 1) {
      return {
        title: "Looking back?",
        subtitle: "Let's see what you got up to.",
      };
    }

    if (daysAgo <= 7) {
      return {
        title: "Back to this one.",
        subtitle: "How did we do?",
      };
    }

    if (daysAgo <= 28) {
      return {
        title: "Let's rewind.",
        subtitle: "What did you actually get done?",
      };
    }

    return {
      title: "A trip down memory lane.",
      subtitle: "Here's how you did.",
    };
  };

  const content = isCurrentDateToday
    ? getTodayContent()
    : isFutureDate
      ? getFutureContent()
      : getPastContent();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {content.title}
        </Text>

        <Text style={styles.subtitle} numberOfLines={1}>
          {content.subtitle}
        </Text>
      </View>

      {!isCurrentDateToday && (
        <TouchableOpacity
          style={styles.todayButton}
          onPress={goToToday}
          activeOpacity={0.7}
        >
          <Ionicons name="today-outline" size={14} color={colors.primary} />
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  content: {
    flex: 1,
    marginRight: 12,
  },

  title: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: colors.textSecondary,
    marginTop: 3,
  },

  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },

  todayButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
});
